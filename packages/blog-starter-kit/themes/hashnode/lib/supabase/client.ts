import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client
export const createSupabaseClient = () => {
	try {
		return createClientComponentClient();
	} catch (error) {
		// Fallback to direct client if auth-helpers fails
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		
		if (!supabaseUrl || !supabaseAnonKey) {
			// During build/static generation, return a dummy client to prevent errors
			// This allows the build to complete even without env vars configured
			if (typeof window === 'undefined') {
				// Server-side: return a minimal client that won't crash
				return createClient(
					supabaseUrl || 'https://placeholder.supabase.co',
					supabaseAnonKey || 'placeholder-key'
				);
			}
			throw new Error('Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
		}
		
		return createClient(supabaseUrl, supabaseAnonKey);
	}
};

// Server-side Supabase client
export const createServerSupabaseClient = () => {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing Supabase environment variables');
	}

	return createClient(supabaseUrl, supabaseAnonKey);
};

// Server-side Supabase client with user authentication token
// This ensures RLS policies can identify the user via auth.uid()
// The Authorization header in the global config allows Supabase to decode the JWT
// and use it for RLS policy evaluation
export const createAuthenticatedServerSupabaseClient = (accessToken: string) => {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing Supabase environment variables');
	}

	// Create client with Authorization header in global config
	// This allows Supabase to decode the JWT and use auth.uid() in RLS policies
	const client = createClient(supabaseUrl, supabaseAnonKey, {
		global: {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},
	});

	return client;
};

