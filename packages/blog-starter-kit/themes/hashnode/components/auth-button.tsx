import { useRouter } from 'next/router';
import { useSupabaseAuth } from './contexts/supabaseAuthContext';
import { Button } from './custom-button';

export function AuthButton() {
	const { user, loading, signOut } = useSupabaseAuth();
	const router = useRouter();

	if (loading) {
		return <Button type="primary" label="Loading..." disabled />;
	}

	if (user) {
		return (
			<div className="flex items-center gap-2">
				<span className="text-sm text-slate-700 dark:text-slate-300">
					{user.user_metadata?.name || user.email?.split('@')[0]}
				</span>
				<Button
					type="outline"
					label="Sign Out"
					onClick={async () => {
						await signOut();
						router.push('/');
					}}
				/>
			</div>
		);
	}

	return (
		<Button
			type="primary"
			label="Sign Up"
			onClick={() => router.push('/auth/signup')}
		/>
	);
}

