import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '../../../lib/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const supabase = createServerSupabaseClient();
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.status(401).json({ error: 'No authorization header' });
		}

		const token = authHeader.replace('Bearer ', '');
		const {
			data: { user, session },
			error,
		} = await supabase.auth.getUser(token);

		if (error || !user || !session) {
			return res.status(401).json({ error: 'Invalid token' });
		}

		return res.status(200).json({
			user,
			session,
			accessToken: session.access_token,
		});
	} catch (error: any) {
		return res.status(500).json({ error: error.message || 'Internal server error' });
	}
}

