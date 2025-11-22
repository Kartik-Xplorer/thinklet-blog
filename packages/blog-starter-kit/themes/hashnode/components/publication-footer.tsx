import Image from 'next/legacy/image';
import Link from 'next/link';
import { twJoin } from 'tailwind-merge';
import { resizeImage } from '../utils/image';

function PublicationFooter(props: any) {
	const { isTeam, authorName, title, imprint, logo } = props;

	return (
		<footer
			className={twJoin(
				'blog-footer-area -mt-px border-t',
				'bg-slate-50 px-5 py-12 text-center',
				'dark:border-slate-800 dark:bg-slate-900/50',
				'md:px-10 md:py-16 lg:py-20'
			)}
		>
			{imprint && (
				<section
					className={twJoin(
						'blog-impressum mx-auto mb-10 rounded-lg border bg-white px-4 py-6 text-left',
						'dark:border-slate-800 dark:bg-transparent',
						'lg:w-3/4 xl:w-2/3'
					)}
				>
					<p
						className={twJoin(
							'mb-4 text-center text-sm font-bold uppercase tracking-wider',
							'text-slate-600 dark:text-slate-400'
						)}
					>
						Impressum
					</p>
					<div
						className="prose mx-auto w-full dark:prose-dark"
						dangerouslySetInnerHTML={{ __html: `${imprint}` }}
					/>
				</section>
			)}
			<div className="blog-footer-credits flex flex-col items-center justify-center">
				{/* Logo */}
				{logo && (
					<div className="mb-8 flex flex-col items-center">
						<Link href="/" className="relative block h-10 w-40">
							<Image
								layout="fill"
								alt={title || `${authorName}'s ${isTeam ? 'team' : ''} blog`}
								src={resizeImage(logo, { w: 1000, h: 250, c: 'thumb' })}
							/>
						</Link>
					</div>
				)}

				{/* Copyright and links */}
				<div className="mb-8 flex flex-col items-center gap-4">
					<p className="text-sm text-slate-600 dark:text-slate-400">
						©{new Date().getFullYear()} {title || 'ThinkLet'}. All rights reserved.
					</p>
					<div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
						<Link
							href="/archive"
							className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
						>
							Archive
						</Link>
						<span className="text-slate-400 dark:text-slate-500">·</span>
						<Link
							href="/privacy"
							className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
						>
							Privacy Policy
						</Link>
						<span className="text-slate-400 dark:text-slate-500">·</span>
						<Link
							href="/terms"
							className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
						>
							Terms
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default PublicationFooter;
