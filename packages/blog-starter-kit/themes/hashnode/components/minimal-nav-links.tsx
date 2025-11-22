import Link from 'next/link';
import { twJoin } from 'tailwind-merge';

type Props = {
	isHome: boolean;
	enabledPages?: { newsletter?: boolean | null } | null;
};

export function MinimalNavLinks(props: Props) {
	const { isHome, enabledPages } = props;

	return (
		<nav className="flex items-center gap-8">
			<Link
				href="/"
				className={twJoin(
					'text-sm font-medium transition-colors',
					isHome
						? 'text-slate-900 dark:text-slate-100'
						: 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
				)}
			>
				Home
			</Link>
			{enabledPages?.newsletter === true && (
				<Link
					href="/newsletter"
					className={twJoin(
						'text-sm font-medium transition-colors',
						'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
					)}
				>
					Newsletter
				</Link>
			)}
		</nav>
	);
}

