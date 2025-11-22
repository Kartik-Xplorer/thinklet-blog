import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient, createAuthenticatedServerSupabaseClient } from '../../../lib/supabase/client';
import { request } from 'graphql-request';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;
const HASHNODE_AUTH_TOKEN = process.env.HASHNODE_AUTH_TOKEN;

const LIKE_POST_MUTATION = `
	mutation LikePost($input: LikePostInput!) {
		likePost(input: $input) {
			post {
				id
				reactionCount
			}
		}
	}
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		// Check if Supabase is configured
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
			return res.status(500).json({ 
				error: 'Server configuration error: Supabase not configured' 
			});
		}

		// Get authenticated user
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({ error: 'Unauthorized: No authorization header' });
		}

		const token = authHeader.replace('Bearer ', '');
		const supabase = createServerSupabaseClient();
		
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token);

		if (authError || !user) {
			return res.status(401).json({ 
				error: authError?.message || 'Unauthorized: Invalid or expired token' 
			});
		}

		const { postId, hashnodePostId } = req.body;

		if (!postId) {
			return res.status(400).json({ error: 'Missing postId' });
		}

		const authenticatedSupabase = createAuthenticatedServerSupabaseClient(token);

		// Check if user already liked this post
		const { data: existingLike } = await authenticatedSupabase
			.from('post_likes')
			.select('id')
			.eq('post_id', postId)
			.eq('user_id', user.id)
			.single();

		if (existingLike) {
			// Unlike: Delete from Supabase
			const { error: deleteError } = await authenticatedSupabase
				.from('post_likes')
				.delete()
				.eq('id', existingLike.id);

			if (deleteError) {
				console.error('Error unliking post:', deleteError);
				return res.status(500).json({ error: 'Failed to unlike post' });
			}

			// Get updated like count
			const { count } = await authenticatedSupabase
				.from('post_likes')
				.select('*', { count: 'exact', head: true })
				.eq('post_id', postId);

			return res.status(200).json({ 
				liked: false,
				likeCount: count || 0 
			});
		} else {
			// Like: Insert into Supabase
			const { data: like, error: insertError } = await authenticatedSupabase
				.from('post_likes')
				.insert({
					post_id: postId,
					user_id: user.id,
					hashnode_post_id: hashnodePostId || null,
					synced_to_hashnode: false,
				})
				.select()
				.single();

			if (insertError) {
				console.error('Error liking post:', insertError);
				return res.status(500).json({ error: 'Failed to like post' });
			}

			// Sync to Hashnode in the background (if configured)
			if (HASHNODE_AUTH_TOKEN && GQL_ENDPOINT && hashnodePostId) {
				syncLikeToHashnode(hashnodePostId, like.id, token).catch((error) => {
					console.error('Error syncing like to Hashnode:', error);
				});
			}

			// Get updated like count
			const { count } = await authenticatedSupabase
				.from('post_likes')
				.select('*', { count: 'exact', head: true })
				.eq('post_id', postId);

			return res.status(200).json({ 
				liked: true,
				likeCount: count || 0 
			});
		}
	} catch (error: any) {
		console.error('Error in like endpoint:', error);
		return res.status(500).json({ 
			error: error.message || 'Internal server error' 
		});
	}
}

async function syncLikeToHashnode(hashnodePostId: string, supabaseLikeId: string, accessToken: string) {
	if (!HASHNODE_AUTH_TOKEN || !GQL_ENDPOINT) {
		return;
	}

	try {
		const variables = {
			input: {
				postId: hashnodePostId,
				likesCount: 1,
			},
		};

		await request(GQL_ENDPOINT, LIKE_POST_MUTATION, variables, {
			Authorization: `Bearer ${HASHNODE_AUTH_TOKEN}`,
		});

		// Update Supabase like to mark as synced
		const authenticatedSupabase = createAuthenticatedServerSupabaseClient(accessToken);
		await authenticatedSupabase
			.from('post_likes')
			.update({ synced_to_hashnode: true })
			.eq('id', supabaseLikeId);
	} catch (error) {
		console.error('Hashnode sync error:', error);
		throw error;
	}
}

