import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { getHashId } from '../utils/commonUtils';
import { useAppContext } from './contexts/appContext';

interface Props {
	isPublicationPost: boolean;
	currentFilter: string;
}

const PostCommentsEnhanced = dynamic(() =>
	import('../components/post-comments-enhanced').then((mod) => mod.PostCommentsEnhanced),
);

function ResponseList(props: Props) {
	const { currentFilter } = props;
	const { post: _post } = useAppContext();
	const post = _post as any;
	const [isLoading, setLoading] = useState(false);
	const [initialResponsesLoaded, setInitialResponsesLoaded] = useState(false);
	const hashId = getHashId();

	useEffect(() => {
		(async () => {
			if (post.responseCount === 0) {
				return;
			}
			setLoading(true);
			setLoading(false);
			if (!initialResponsesLoaded) {
				setInitialResponsesLoaded(true);
			}
			// Scroll to responseId after the responses load
			if (!hashId) {
				return;
			}
			const el = document.getElementById(hashId);
			if (!el) {
				return;
			}
			el.scrollIntoView();
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentFilter, hashId, initialResponsesLoaded, post.responseCount]);

	return (
		<div className="mx-2 pb-10 lg:mx-0" id="comments-list">
			<PostCommentsEnhanced />
			{isLoading &&
				[...Array(3).keys()].map((val: number) => (
					<div
						key={`comments-list-loader-${val}`}
						className="border-b-1/2 animate-pulse dark:border-slate-700"
					>
						<div className="px-4 py-5">
							<div className="mb-6 flex flex-row items-center bg-white dark:border-slate-800 dark:bg-slate-900">
								<div className="mr-4 h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
								<div className="flex flex-col gap-2">
									<div className="h-3 w-56 rounded bg-slate-200 dark:bg-slate-700" />
									<div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
								</div>
							</div>
							<div>
								<div className="mb-2 h-3 w-11/12 rounded bg-slate-200 dark:bg-slate-700" />
								<div className="mb-2 h-3 w-11/12 rounded bg-slate-200 dark:bg-slate-700" />
								<div className="mb-2 h-3 w-11/12 rounded bg-slate-200 dark:bg-slate-700" />
							</div>
						</div>
					</div>
				))}
		</div>
	);
}

export default ResponseList;
