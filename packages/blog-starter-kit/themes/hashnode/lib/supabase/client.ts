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

