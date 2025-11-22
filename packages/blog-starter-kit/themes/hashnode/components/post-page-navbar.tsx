import Link from 'next/link';
import { forwardRef } from 'react';
import { twJoin } from 'tailwind-merge';

import { getCommonBtnStyles } from './common-header-icon-btn';
import HeaderLeftSidebar from './header-left-sidebar';
import HeaderTooltip from './header-tooltip';
import { ChevronLeftSVG } from './icons/svgs/';
import useStickyNavScroll from './use-sticky-nav-scroll';

import { PublicationFragment } from '../generated/graphql';
import PublicationLogo from './publication-logo';
import PillSearchBar from './pill-search-bar';
import { DarkModeToggle } from './dark-mode-toggle';
import { UserAvatarDropdown } from './user-avatar-dropdown';

type Props = {
	publication: Pick<PublicationFragment, 'id' | 'title' | 'links' | 'url' | 'features' | 'isTeam' | 'author' | 'preferences'>;
};

const PostPageNavbar = forwardRef<HTMLElement, Props>((props, ref) => {
	const { publication } = props;

	useStickyNavScroll({ elRef: ref });

	const commonIconBtnStyles = getCommonBtnStyles();

	return (
		<div className="container mx-auto px-4 md:px-6 lg:px-8">
			{/* Mobile */}
			<div className="flex items-center justify-between py-4 md:hidden">
				<div className="flex items-center gap-3">
					<HeaderTooltip tooltipClassName="blog-home-tooltip" tooltipText="Home">
						<Link
							href="/"
							aria-label="Back to blog home"
							className={twJoin('blog-back-to-home-button', commonIconBtnStyles, 'p-2')}
						>
							<ChevronLeftSVG className="h-4 w-4 fill-current text-slate-800 dark:text-white" />
						</Link>
					</HeaderTooltip>
					<HeaderLeftSidebar publication={publication} />
					<PublicationLogo publication={publication} size="sm" withProfileImage isPostPage />
				</div>
				<div className="flex items-center gap-2">
					<DarkModeToggle />
					<UserAvatarDropdown />
				</div>
			</div>

			{/* Desktop */}
			<div className="hidden items-center justify-between gap-8 py-5 md:flex">
				<div className="flex items-center gap-4">
					<HeaderTooltip tooltipClassName="blog-home-tooltip" tooltipText="Home">
						<Link
							href="/"
							aria-label="Back to blog home"
							className={twJoin('blog-back-to-home-button', commonIconBtnStyles, 'p-2')}
						>
							<ChevronLeftSVG className="h-4 w-4 fill-current text-slate-800 dark:text-white" />
						</Link>
					</HeaderTooltip>
					<PublicationLogo publication={publication} size="lg" withProfileImage isPostPage />
				</div>

				<div className="flex items-center gap-4">
					<PillSearchBar publication={publication} />
					<DarkModeToggle />
					<UserAvatarDropdown />
				</div>
			</div>

			{/* Mobile: Search bar */}
			<div className="pb-4 md:hidden">
				<PillSearchBar publication={publication} />
			</div>
		</div>
	);
});

PostPageNavbar.displayName = 'PostPageNavbar';

export default PostPageNavbar;
