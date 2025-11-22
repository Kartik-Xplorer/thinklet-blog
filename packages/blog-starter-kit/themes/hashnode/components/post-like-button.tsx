import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './contexts/supabaseAuthContext';
import { useAppContext } from './contexts/appContext';
import PostFloatingBarTooltipWrapper from './post-floating-bar-tooltip-wrapper';
import { kFormatter } from '../utils/image';

interface PostLikeButtonProps {
	postId: string;
	hashnodePostId?: string;
	initialLikeCount?: number;
	onLikeChange?: (liked: boolean, count: number) => void;
}

export function PostLikeButton({ 
	postId, 
	hashnodePostId, 
	initialLikeCount = 0,
	onLikeChange 
}: PostLikeButtonProps) {
	const { user, session } = useSupabaseAuth();
	const { post } = useAppContext();
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(initialLikeCount);
	const [isAnimating, setIsAnimating] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch initial like status and count
	useEffect(() => {
		const fetchLikeStatus = async () => {
			if (!postId) return;

			try {
				const headers: HeadersInit = {};
				if (session?.access_token) {
					headers.Authorization = `Bearer ${session.access_token}`;
				}

				const res = await fetch(`/api/posts/likes/${postId}`, {
					headers,
				});

				if (res.ok) {
					const data = await res.json();
					setLiked(data.userLiked);
					setLikeCount(data.likeCount);
				}
			} catch (error) {
				console.error('Error fetching like status:', error);
			}
		};

		fetchLikeStatus();
	}, [postId, session]);

	const handleLike = async () => {
		if (!user || !session) {
			// Redirect to sign in
			window.location.href = `/auth/signin?redirect=${encodeURIComponent(window.location.pathname)}`;
			return;
		}

		if (isLoading) return;

		setIsLoading(true);
		const previousLiked = liked;
		const previousCount = likeCount;

		// Optimistic update
		setLiked(!liked);
		setLikeCount(previousLiked ? likeCount - 1 : likeCount + 1);
		setIsAnimating(true);

		try {
			const res = await fetch('/api/posts/like', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({
					postId,
					hashnodePostId: hashnodePostId || post?.id,
				}),
			});

			if (!res.ok) {
				// Revert on error
				setLiked(previousLiked);
				setLikeCount(previousCount);
				const errorData = await res.json().catch(() => ({ error: 'Failed to like post' }));
				console.error('Error liking post:', errorData.error);
			} else {
				const data = await res.json();
				setLiked(data.liked);
				setLikeCount(data.likeCount);
				if (onLikeChange) {
					onLikeChange(data.liked, data.likeCount);
				}
			}
		} catch (error) {
			// Revert on error
			setLiked(previousLiked);
			setLikeCount(previousCount);
			console.error('Error liking post:', error);
		} finally {
			setIsLoading(false);
			setTimeout(() => setIsAnimating(false), 600);
		}
	};

	const HeartIcon = ({ filled }: { filled: boolean }) => {
		const animationClass = isAnimating && filled 
			? 'animate-[heart-beat_0.6s_ease-in-out]' 
			: '';
		
		return (
			<svg
				className={`h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6 transition-all duration-300 ${
					filled
						? 'fill-red-500 text-red-500'
						: 'fill-none stroke-current text-slate-800 dark:text-slate-50'
				} ${animationClass}`}
				viewBox="0 0 24 24"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				style={isAnimating && filled ? {
					animation: 'heart-beat 0.6s ease-in-out',
				} : undefined}
			>
				<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
			</svg>
		);
	};

	const label = liked ? 'Unlike this post' : 'Like this post';
	const accessibleLabel = likeCount > 0 
		? `${kFormatter(likeCount)} like${likeCount === 1 ? '' : 's'}, ${label}`
		: label;

	return (
		<>
			<style dangerouslySetInnerHTML={{
				__html: `
					@keyframes heart-beat {
						0%, 100% { transform: scale(1); }
						25% { transform: scale(1.3); }
						50% { transform: scale(1.1); }
						75% { transform: scale(1.2); }
					}
				`
			}} />
			<PostFloatingBarTooltipWrapper label={label}>
				<button
					type="button"
					onClick={handleLike}
					aria-label={accessibleLabel}
					disabled={isLoading}
					className="outline-none! flex cursor-pointer items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<span className="rounded-full p-2">
						<HeartIcon filled={liked} />
					</span>
					{likeCount > 0 && (
						<span className="ml-0.5 pr-2 transition-all duration-300">{kFormatter(likeCount)}</span>
					)}
				</button>
			</PostFloatingBarTooltipWrapper>
		</>
	);
}

