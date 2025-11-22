import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient, createAuthenticatedServerSupabaseClient } from '../../../../lib/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		// Check if Supabase is configured
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
			return res.status(500).json({ 
				error: 'Server configuration error: Supabase not configured' 
			});
		}

		const { postId } = req.query;
		if (!postId || typeof postId !== 'string') {
			return res.status(400).json({ error: 'Invalid post ID' });
		}

		const supabase = createServerSupabaseClient();

		// Get like count
		const { count, error: countError } = await supabase
			.from('post_likes')
			.select('*', { count: 'exact', head: true })
			.eq('post_id', postId);

		if (countError) {
			console.error('Error fetching like count:', countError);
			return res.status(500).json({ error: 'Failed to fetch like count' });
		}

		// Check if user is authenticated and has liked this post
		const authHeader = req.headers.authorization;
		let userLiked = false;

		if (authHeader) {
			const token = authHeader.replace('Bearer ', '');
			const {
				data: { user },
			} = await supabase.auth.getUser(token);

			if (user) {
				const authenticatedSupabase = createAuthenticatedServerSupabaseClient(token);
				const { data: like } = await authenticatedSupabase
					.from('post_likes')
					.select('id')
					.eq('post_id', postId)
					.eq('user_id', user.id)
					.single();

				userLiked = !!like;
			}
		}

		return res.status(200).json({
			likeCount: count || 0,
			userLiked,
		});
	} catch (error: any) {
		console.error('Error fetching likes:', error);
		return res.status(500).json({ 
			error: error.message || 'Internal server error' 
		});
	}
}

