import { useState, useEffect } from 'react';
import moment from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { twJoin } from 'tailwind-merge';
import { formatDate } from '../utils';
import Autolinker from '../utils/autolinker';
import { imageReplacer } from '../utils/image';
import { useAppContext } from './contexts/appContext';
import { CommentForm } from './comment-form';
import ProfileImage from './profile-image';
import ResponseFooter from './response-footer';
import { Comment } from '../lib/supabase/types';

moment.extend(relativeTime);
moment.extend(localizedFormat);

interface PostCommentsEnhancedProps {
	showHashnodeComments?: boolean;
}

export const PostCommentsEnhanced = ({ showHashnodeComments = true }: PostCommentsEnhancedProps) => {
	const { post } = useAppContext();
	const [supabaseComments, setSupabaseComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(true);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);

	const fetchSupabaseComments = async () => {
		if (!post) return;
		try {
			const res = await fetch(`/api/comments/${post.id}`);
			if (res.ok) {
				const data = await res.json();
				setSupabaseComments(data.comments || []);
			}
		} catch (error) {
			console.error('Error fetching Supabase comments:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (post) {
			fetchSupabaseComments();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post?.id]);

	const handleCommentAdded = () => {
		fetchSupabaseComments();
		setReplyingTo(null);
	};

	const renderComment = (comment: any, isReply = false) => {
		if (!post) return null;
		const isAuthor = comment.user?.id === post.author.id.toString();
		const commentDate = comment.created_at || comment.dateAdded;

		return (
			<div
				key={comment.id}
				className={twJoin(
					'border-b-1/2 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900',
					isReply && 'ml-8 border-l-2 border-slate-200 pl-4 dark:border-slate-700'
				)}
			>
				<div className="flex flex-col">
					<div className="flex justify-between text-slate-900 dark:text-slate-50">
						<div className="flex min-w-0 items-center">
							<div className="h-8 w-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700">
								<ProfileImage
									width="160"
									height="160"
									user={{
										id: comment.user?.id || comment.author?.id,
										name: comment.user?.name || comment.author?.name,
										profilePicture: comment.user?.avatar_url || comment.author?.profilePicture,
									}}
									hoverDisabled={true}
								/>
							</div>
							<div className="ml-2 min-w-0">
								<div className="flex flex-row flex-wrap">
									<p className="flex items-center truncate">
										<span
											title={comment.user?.name || comment.author?.name}
											className={twJoin(
												'mr-2 truncate text-sm font-semibold text-slate-800 dark:text-slate-100',
											)}
										>
											{comment.user?.name || comment.author?.name}
										</span>
										{isAuthor && (
											<span className="block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium leading-normal text-green-700 dark:bg-green-800 dark:text-green-50">
												Author
											</span>
										)}
									</p>
								</div>
								<p className="text-sm text-slate-500 dark:text-slate-400">
									<span title={moment(commentDate).format('MMM D, YYYY HH:mm')} aria-label="Comment added at">
										{formatDate(commentDate)}
									</span>
								</p>
							</div>
						</div>
					</div>
				</div>
				<div
					className="prose dark:prose-dark mb-4 mt-3 break-words leading-snug text-slate-800 dark:text-slate-100"
					dangerouslySetInnerHTML={{
						__html: imageReplacer(
							Autolinker.link(
								comment.content?.html || 
								(comment.content_markdown ? `<p>${comment.content_markdown.replace(/\n/g, '<br>')}</p>` : '') ||
								'',
								{
									twitter: true,
									truncate: 45,
									css: 'autolinkedURL',
								}
							),
						),
					}}
				/>
				{!isReply && (
					<div className="mb-2">
						<button
							onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
							className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
						>
							{replyingTo === comment.id ? 'Cancel' : 'Reply'}
						</button>
					</div>
				)}
				{replyingTo === comment.id && (
					<div className="mb-4">
						<CommentForm
							parentCommentId={comment.id}
							onCommentAdded={handleCommentAdded}
							onCancel={() => setReplyingTo(null)}
						/>
					</div>
				)}
				{comment.replies && comment.replies.length > 0 && (
					<div className="mt-2">
						{comment.replies.map((reply: any) => renderComment(reply, true))}
					</div>
				)}
			</div>
		);
	};

	if (!post) return null;

	const totalComments = supabaseComments.length + (showHashnodeComments ? (post.responseCount || 0) : 0);

	return (
		<div id="write-comment" className="mx-2 flex flex-col gap-5">
			<div className="relative z-50 flex flex-row flex-wrap items-center justify-between border-b bg-white p-4 dark:border-slate-800 dark:bg-transparent">
				<div className="flex w-full flex-row items-center dark:text-slate-200 md:w-auto">
					<h3 className="text-xl font-medium tracking-tight text-slate-900 dark:text-slate-100">
						Comments {totalComments > 0 ? <span>({totalComments})</span> : ''}
					</h3>
				</div>
			</div>

			{/* Comment Form */}
			<div className="px-2">
				<CommentForm onCommentAdded={handleCommentAdded} />
			</div>

			{/* Supabase Comments */}
			{loading ? (
				<div className="px-4 py-8 text-center text-slate-500">Loading comments...</div>
			) : supabaseComments.length > 0 ? (
				<div>{supabaseComments.map((comment) => renderComment(comment))}</div>
			) : (
				<div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
					No comments yet. Be the first to comment!
				</div>
			)}

			{/* Hashnode Comments (if enabled) */}
			{showHashnodeComments && post.comments && post.comments.edges.length > 0 && (
				<>
					<div className="border-t border-slate-200 pt-4 dark:border-slate-700">
						<h4 className="mb-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
							Comments from Hashnode
						</h4>
						{post.comments.edges.map((edge) => {
							const comment = edge.node as any;
							return renderComment({
								id: comment.id,
								author: comment.author,
								content: comment.content,
								dateAdded: comment.dateAdded,
								totalReactions: comment.totalReactions,
								replies: comment.replies?.edges?.map((e: any) => e.node) || [],
							});
						})}
					</div>
				</>
			)}
		</div>
	);
};

