import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '../../../lib/supabase/client';
import { request } from 'graphql-request';
import { AddCommentDocument } from '../../../generated/graphql';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;
const HASHNODE_AUTH_TOKEN = process.env.HASHNODE_AUTH_TOKEN; // Personal access token for Hashnode API

interface CreateCommentRequest {
	postId: string;
	content: string;
	contentMarkdown: string;
	parentCommentId?: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const supabase = createServerSupabaseClient();

		// Get authenticated user from Supabase
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const token = authHeader.replace('Bearer ', '');
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token);

		if (authError || !user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		// Get user profile
		const { data: profile } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		const { postId, content, contentMarkdown, parentCommentId }: CreateCommentRequest = req.body;

		if (!postId || !content || !contentMarkdown) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		// Save comment to Supabase first
		const { data: comment, error: dbError } = await supabase
			.from('comments')
			.insert({
				post_id: postId,
				user_id: user.id,
				content: content,
				content_markdown: contentMarkdown,
				parent_comment_id: parentCommentId || null,
				synced_to_hashnode: false,
			})
			.select()
			.single();

		if (dbError) {
			console.error('Error saving comment to Supabase:', dbError);
			return res.status(500).json({ error: 'Failed to save comment' });
		}

		// Sync to Hashnode in the background (don't wait for it)
		if (HASHNODE_AUTH_TOKEN && !parentCommentId) {
			// Only sync top-level comments to Hashnode (replies can be handled separately)
			syncToHashnode(postId, contentMarkdown, comment.id).catch((error) => {
				console.error('Error syncing comment to Hashnode:', error);
				// Update comment to mark sync as failed (optional)
				supabase
					.from('comments')
					.update({ synced_to_hashnode: false })
					.eq('id', comment.id)
					.catch(console.error);
			});
		}

		// Return the comment with user info
		return res.status(200).json({
			...comment,
			user: {
				id: user.id,
				email: user.email,
				name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
				avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
			},
		});
	} catch (error: any) {
		console.error('Error creating comment:', error);
		return res.status(500).json({ error: error.message || 'Internal server error' });
	}
}

async function syncToHashnode(postId: string, contentMarkdown: string, supabaseCommentId: string) {
	if (!HASHNODE_AUTH_TOKEN || !GQL_ENDPOINT) {
		throw new Error('Hashnode credentials not configured');
	}

	try {
		const variables = {
			input: {
				postId: postId,
				contentMarkdown: contentMarkdown,
			},
		};

		const data = await request(GQL_ENDPOINT, AddCommentDocument, variables, {
			Authorization: `Bearer ${HASHNODE_AUTH_TOKEN}`,
		});

		if (data.addComment?.comment?.id) {
			// Update Supabase comment with Hashnode ID
			const supabase = createServerSupabaseClient();
			await supabase
				.from('comments')
				.update({
					hashnode_comment_id: data.addComment.comment.id,
					synced_to_hashnode: true,
				})
				.eq('id', supabaseCommentId);
		}
	} catch (error) {
		console.error('Hashnode sync error:', error);
		throw error;
	}
}

