import { useEffect, useRef, useState } from 'react';
import { twJoin } from 'tailwind-merge';
import dynamic from 'next/dynamic';
import SearchSVG from './icons/svgs/SearchSvg';
import { PublicationFragment } from '../generated/graphql';

const PublicationSearch = dynamic(() => import('./publication-search'), { ssr: false });

interface Props {
	publication: Pick<PublicationFragment, 'id' | 'title' | 'url' | 'isTeam' | 'favicon' | 'links' | 'author' | 'preferences'>;
}

const PillSearchBar = (props: Props) => {
	const { publication } = props;
	const [isSearchUIVisible, setIsSearchUIVisible] = useState(false);
	const triggerRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
				e.preventDefault();
				setIsSearchUIVisible(true);
			}
			if (e.key === 'Escape' && isSearchUIVisible) {
				setIsSearchUIVisible(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isSearchUIVisible]);

	const toggleSearchUI = () => {
		setIsSearchUIVisible(!isSearchUIVisible);
	};

	return (
		<>
			{isSearchUIVisible ? (
				<PublicationSearch 
					publication={publication} 
					toggleSearchUI={toggleSearchUI} 
					triggerRef={triggerRef as any} 
				/>
			) : null}
			<div
				onClick={() => setIsSearchUIVisible(true)}
				className={twJoin(
					'flex items-center gap-2 rounded-full border border-slate-200',
					'bg-white px-4 py-2 transition-colors',
					'hover:border-slate-300 hover:bg-slate-50',
					'dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800',
					'cursor-text focus-within:border-slate-400 dark:focus-within:border-slate-500',
					'max-w-[280px] w-full'
				)}
			>
				<SearchSVG className="h-4 w-4 stroke-current text-slate-400 dark:text-slate-500 flex-shrink-0" />
				<span className="flex-1 text-sm text-slate-500 dark:text-slate-400">
					Search articles…
				</span>
				<kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
					Ctrl + K
				</kbd>
			</div>
		</>
	);
};

export default PillSearchBar;

