import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseAuth } from '../../components/contexts/supabaseAuthContext';
import { Button } from '../../components/custom-button';
import Link from 'next/link';

export default function SignUpPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const { signUp } = useSupabaseAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		const { error } = await signUp(email, password, name);

		if (error) {
			setError(error.message);
			setLoading(false);
		} else {
			setSuccess(true);
			setLoading(false);
			// Redirect immediately after successful signup (user is auto-logged in)
			setTimeout(() => {
				router.push(router.query.redirect as string || '/');
			}, 1000);
		}
	};

	if (success) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
				<div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-slate-800">
					<h1 className="mb-4 text-2xl font-bold text-green-600 dark:text-green-400">Success!</h1>
					<p className="text-slate-600 dark:text-slate-400">
						Account created successfully! You&apos;re now signed in. Redirecting...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
			<div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-slate-800">
				<h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Sign Up</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
							Name
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
						/>
					</div>
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
						/>
					</div>
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={6}
							className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
						/>
					</div>
					{error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
					<Button
						type="primary"
						label={loading ? 'Signing up...' : 'Sign Up'}
						disabled={loading}
					/>
					<p className="text-center text-sm text-slate-600 dark:text-slate-400">
						Already have an account?{' '}
						<Link href="/auth/signin" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
							Sign in
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
}

