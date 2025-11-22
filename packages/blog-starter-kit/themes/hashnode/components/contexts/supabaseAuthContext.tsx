import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createSupabaseClient } from '../../lib/supabase/client';

interface SupabaseAuthContextType {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<{ error: any }>;
	signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
	signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	
	// Check if Supabase is configured
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
	
	const supabase = isSupabaseConfigured ? createSupabaseClient() : null;

	useEffect(() => {
		// Skip auth setup if Supabase is not configured (e.g., during build)
		if (!supabase || !isSupabaseConfigured) {
			setLoading(false);
			return;
		}

		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		}).catch(() => {
			// Handle errors gracefully during build/SSR
			setLoading(false);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, [supabase, isSupabaseConfigured]);

	const signIn = async (email: string, password: string) => {
		if (!supabase) {
			return { error: new Error('Supabase is not configured') };
		}
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		return { error };
	};

	const signUp = async (email: string, password: string, name?: string) => {
		if (!supabase) {
			return { error: new Error('Supabase is not configured') };
		}
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name: name || email.split('@')[0],
				},
				emailRedirectTo: undefined, // Disable email confirmation
			},
		});
		
		// If signup is successful and we have a session, user is automatically logged in
		// (This happens when email confirmation is disabled in Supabase settings)
		if (!error && data.session) {
			// User is already logged in, no need to do anything
		} else if (!error && data.user) {
			// If no session but user was created, try to sign in immediately
			// This handles the case where email confirmation might still be required
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (signInError) {
				return { error: signInError };
			}
		}
		
		return { error };
	};

	const signOut = async () => {
		if (supabase) {
			await supabase.auth.signOut();
		}
	};

	return (
		<SupabaseAuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
			{children}
		</SupabaseAuthContext.Provider>
	);
}

export function useSupabaseAuth() {
	const context = useContext(SupabaseAuthContext);
	if (context === undefined) {
		throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
	}
	return context;
}

