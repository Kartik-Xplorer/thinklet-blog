import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '../../../lib/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		// Check if Supabase is configured
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
			console.error('Supabase environment variables not configured');
			return res.status(500).json({ 
				error: 'Server configuration error: Supabase not configured' 
			});
		}

		const { postId } = req.query;
		if (!postId || typeof postId !== 'string') {
			return res.status(400).json({ error: 'Invalid post ID' });
		}

		const supabase = createServerSupabaseClient();

		// Fetch comments from Supabase
		const { data: comments, error } = await supabase
			.from('comments')
			.select(
				`
				*,
				profiles!comments_user_id_fkey (
					id,
					name,
					avatar_url
				)
			`
			)
			.eq('post_id', postId as string)
			.is('parent_comment_id', null) // Only top-level comments
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching comments:', error);
			return res.status(500).json({ error: 'Failed to fetch comments' });
		}

		// Fetch replies for each comment
		const commentIds = comments?.map((c) => c.id) || [];
		const { data: replies } = await supabase
			.from('comments')
			.select(
				`
				*,
				profiles!comments_user_id_fkey (
					id,
					name,
					avatar_url
				)
			`
			)
			.in('parent_comment_id', commentIds)
			.order('created_at', { ascending: true });

		// Organize comments with replies
		const commentsWithReplies = comments?.map((comment: any) => {
			const commentReplies = replies?.filter((r: any) => r.parent_comment_id === comment.id) || [];
			return {
				...comment,
				user: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles,
				replies: commentReplies.map((r: any) => ({
					...r,
					user: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
				})),
			};
		});

		return res.status(200).json({ comments: commentsWithReplies || [] });
	} catch (error: any) {
		console.error('Error fetching comments:', error);
		return res.status(500).json({ error: error.message || 'Internal server error' });
	}
}

