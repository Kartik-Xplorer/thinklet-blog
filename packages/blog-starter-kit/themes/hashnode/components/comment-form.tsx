import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseAuth } from './contexts/supabaseAuthContext';
import { useAppContext } from './contexts/appContext';
import { Button } from './custom-button';
import ProfileImage from './profile-image';
import { createSupabaseClient } from '../lib/supabase/client';
import Link from 'next/link';

interface CommentFormProps {
	parentCommentId?: string | null;
	onCommentAdded?: () => void;
	onCancel?: () => void;
}

export function CommentForm({ parentCommentId = null, onCommentAdded, onCancel }: CommentFormProps) {
	const { user, loading: authLoading } = useSupabaseAuth();
	const { post } = useAppContext();
	const router = useRouter();
	const [content, setContent] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [userProfile, setUserProfile] = useState<{ name: string; avatar_url: string | null } | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Fetch user profile when signed in
	useEffect(() => {
		const fetchUserProfile = async () => {
			if (!user) {
				setUserProfile(null);
				return;
			}

			try {
				const supabase = createSupabaseClient();
				const { data: profile } = await supabase
					.from('profiles')
					.select('name, avatar_url')
					.eq('id', user.id)
					.single();

				if (profile) {
					setUserProfile({
						name: profile.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
						avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || null,
					});
				} else {
					// Profile doesn't exist yet, use user metadata
					setUserProfile({
						name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
						avatar_url: user.user_metadata?.avatar_url || null,
					});
				}
			} catch (error) {
				// Fallback to user metadata if profile fetch fails
				setUserProfile({
					name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
					avatar_url: user.user_metadata?.avatar_url || null,
				});
			}
		};

		fetchUserProfile();
	}, [user]);

	if (!post) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			setError('Please sign in to comment');
			return;
		}

		if (!content.trim()) {
			setError('Comment cannot be empty');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const supabase = createSupabaseClient();
			const { data: { session } } = await supabase.auth.getSession();
			
			if (!session) {
				throw new Error('Not authenticated');
			}

			const commentData = {
				postId: post.id,
				content: content.trim(),
				contentMarkdown: content.trim(), // You might want to convert this to markdown properly
				parentCommentId: parentCommentId,
			};

			const res = await fetch('/api/comments/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify(commentData),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({ error: 'Failed to post comment' }));
				const errorMessage = errorData.error || `Failed to post comment (${res.status})`;
				throw new Error(errorMessage);
			}

			setContent('');
			if (onCommentAdded) {
				onCommentAdded();
			}
		} catch (err: any) {
			const errorMessage = err.message || 'Failed to post comment';
			console.error('Comment submission error:', err);
			setError(errorMessage);
			
			// Provide helpful error messages for common issues
			if (errorMessage.includes('Supabase') || errorMessage.includes('configuration')) {
				setError('Server configuration error. Please contact the site administrator.');
			} else if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
				setError('Your session has expired. Please sign in again.');
			} else if (errorMessage.includes('500')) {
				setError('Server error. Please try again later or contact support if the issue persists.');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	if (authLoading) {
		return <div className="p-4 text-center text-slate-500">Loading...</div>;
	}

	if (!user) {
		const redirectUrl = router.asPath ? `/auth/signin?redirect=${encodeURIComponent(router.asPath)}` : '/auth/signin';
		return (
			<div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800">
				<p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
					Please sign in to leave a comment
				</p>
				<div className="flex gap-2 justify-center">
					<Link href={redirectUrl}>
						<Button type="primary" label="Sign In" />
					</Link>
					<Link href={`/auth/signup?redirect=${encodeURIComponent(router.asPath || '/')}`}>
						<Button type="outline" label="Sign Up" />
					</Link>
				</div>
			</div>
		);
	}

	if (!userProfile && user) {
		// Still loading profile
		return <div className="p-4 text-center text-slate-500">Loading...</div>;
	}

	return (
		<form onSubmit={handleSubmit} className="mb-4">
			<div className="flex gap-3">
				<div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700">
					{userProfile && (
						<ProfileImage
							width="40"
							height="40"
							user={{
								id: user.id,
								name: userProfile.name,
								profilePicture: userProfile.avatar_url,
							}}
							hoverDisabled={true}
						/>
					)}
				</div>
				<div className="flex-1">
					{userProfile && (
						<p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
							{userProfile.name}
						</p>
					)}
					<textarea
						ref={textareaRef}
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder={parentCommentId ? 'Write a reply...' : 'Write a comment...'}
						className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
						rows={4}
						disabled={isSubmitting}
					/>
					{error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
					<div className="mt-2 flex gap-2">
						<Button
							type="primary"
							label={isSubmitting ? 'Posting...' : parentCommentId ? 'Reply' : 'Post Comment'}
							disabled={isSubmitting || !content.trim()}
						/>
						{parentCommentId && onCancel && (
							<Button type="outline" label="Cancel" onClick={onCancel} />
						)}
					</div>
				</div>
			</div>
		</form>
	);
}

