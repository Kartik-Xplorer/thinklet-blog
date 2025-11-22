import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient, createAuthenticatedServerSupabaseClient } from '../../../lib/supabase/client';
import { request, gql } from 'graphql-request';

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
		// Check if Supabase is configured
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
			console.error('Supabase environment variables not configured');
			return res.status(500).json({ 
				error: 'Server configuration error: Supabase not configured. Please check environment variables.' 
			});
		}

		// Get authenticated user from Supabase
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({ error: 'Unauthorized: No authorization header' });
		}

		const token = authHeader.replace('Bearer ', '');
		
		// Create a Supabase client to verify the user token
		const supabase = createServerSupabaseClient();
		
		// Verify the user token
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token);

		if (authError || !user) {
			console.error('Auth error:', authError);
			return res.status(401).json({ 
				error: authError?.message || 'Unauthorized: Invalid or expired token' 
			});
		}

		// Create an authenticated Supabase client with the access token
		// This ensures RLS policies can identify the user via auth.uid()
		const authenticatedSupabase = createAuthenticatedServerSupabaseClient(token);

		// Get user profile (optional - don't fail if profile doesn't exist)
		let profile = null;
		try {
			const { data } = await authenticatedSupabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single();
			profile = data;
		} catch (error) {
			// Profile might not exist yet - that's okay, we'll use user metadata
			console.debug('Profile not found, using user metadata:', error);
		}

		const { postId, content, contentMarkdown, parentCommentId }: CreateCommentRequest = req.body;

		if (!postId || !content || !contentMarkdown) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		// Validate parentCommentId if provided - must be a valid UUID
		let validParentCommentId: string | null = null;
		if (parentCommentId) {
			// Check if it's a valid UUID format (Supabase uses UUIDs)
			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
			if (uuidRegex.test(parentCommentId)) {
				// Verify the parent comment exists in Supabase
				const { data: parentComment, error: parentError } = await authenticatedSupabase
					.from('comments')
					.select('id')
					.eq('id', parentCommentId)
					.single();

				if (parentError || !parentComment) {
					return res.status(400).json({ 
						error: 'Parent comment not found. You can only reply to comments posted on this site.' 
					});
				}
				validParentCommentId = parentCommentId;
			} else {
				// Not a valid UUID - likely a Hashnode comment ID
				return res.status(400).json({ 
					error: 'Cannot reply to this comment. You can only reply to comments posted on this site.' 
				});
			}
		}

		// Save comment to Supabase first using authenticated client
		// The access token in the headers allows RLS policies to identify the user
		const { data: comment, error: dbError } = await authenticatedSupabase
			.from('comments')
			.insert({
				post_id: postId,
				user_id: user.id,
				content: content,
				content_markdown: contentMarkdown,
				parent_comment_id: validParentCommentId,
				synced_to_hashnode: false,
			})
			.select()
			.single();

		if (dbError) {
			console.error('Error saving comment to Supabase:', {
				message: dbError.message,
				details: dbError.details,
				hint: dbError.hint,
				code: dbError.code,
				user_id: user.id,
				post_id: postId,
			});
			
			// Provide more helpful error messages
			let errorMessage = 'Failed to save comment';
			if (dbError.code === 'PGRST116') {
				errorMessage = 'Comments table not found. Please run database migrations.';
			} else if (dbError.code === '42501') {
				errorMessage = 'Permission denied. Please check Row Level Security policies. Make sure the RLS policy allows authenticated users to insert comments.';
			} else if (dbError.message) {
				errorMessage = `Failed to save comment: ${dbError.message}`;
			}
			
			return res.status(500).json({ 
				error: errorMessage,
				details: process.env.NODE_ENV === 'development' ? dbError : undefined
			});
		}

		// Sync to Hashnode in the background (don't wait for it)
		if (HASHNODE_AUTH_TOKEN && !parentCommentId) {
			// Only sync top-level comments to Hashnode (replies can be handled separately)
			syncToHashnode(postId, contentMarkdown, comment.id, token).catch(async (error) => {
				console.error('Error syncing comment to Hashnode:', error);
				// Update comment to mark sync as failed (optional)
				try {
					await authenticatedSupabase
						.from('comments')
						.update({ synced_to_hashnode: false })
						.eq('id', comment.id);
				} catch (updateError) {
					console.error('Error updating comment sync status:', updateError);
				}
			});
		}

		// Get user name from profile or fallback to user metadata
		const userName = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous';
		const userAvatar = profile?.avatar_url || user.user_metadata?.avatar_url || null;

		// Return the comment with user info
		return res.status(200).json({
			...comment,
			user: {
				id: user.id,
				email: user.email,
				name: userName,
				avatar_url: userAvatar,
			},
		});
	} catch (error: any) {
		console.error('Error creating comment:', {
			message: error.message,
			stack: error.stack,
			name: error.name,
		});
		
		// Check if it's a Supabase configuration error
		if (error.message?.includes('Missing Supabase environment variables')) {
			return res.status(500).json({ 
				error: 'Server configuration error: Supabase environment variables are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' 
			});
		}
		
		return res.status(500).json({ 
			error: error.message || 'Internal server error. Please check server logs for details.' 
		});
	}
}

const ADD_COMMENT_MUTATION = `
	mutation AddComment($input: AddCommentInput!) {
		addComment(input: $input) {
			comment {
				id
				dateAdded
				content {
					html
					markdown
				}
				author {
					id
					name
					username
					profilePicture
				}
				totalReactions
			}
		}
	}
`;

async function syncToHashnode(
	postId: string,
	contentMarkdown: string,
	supabaseCommentId: string,
	accessToken: string
) {
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

		const data = await request<{
			addComment?: {
				comment?: {
					id: string;
				};
			};
		}>(GQL_ENDPOINT, ADD_COMMENT_MUTATION, variables, {
			Authorization: `Bearer ${HASHNODE_AUTH_TOKEN}`,
		});

		if (data.addComment?.comment?.id) {
			// Create authenticated client for the update operation
			const authenticatedSupabase = createAuthenticatedServerSupabaseClient(accessToken);
			
			// Update Supabase comment with Hashnode ID
			await authenticatedSupabase
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

