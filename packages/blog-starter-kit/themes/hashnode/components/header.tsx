import { twJoin } from 'tailwind-merge';
import { useAppContext } from './contexts/appContext';
import PublicationLogo from './publication-logo';
import PillSearchBar from './pill-search-bar';
import { DarkModeToggle } from './dark-mode-toggle';
import { UserAvatarDropdown } from './user-avatar-dropdown';
import { MinimalNavLinks } from './minimal-nav-links';
import HeaderLeftSidebar from './header-left-sidebar';

type Props = {
	currentMenuId?: string | null;
	isHome: boolean;
};

export const Header = (props: Props) => {
	const { currentMenuId, isHome } = props;
	const { publication } = useAppContext();

	return (
		<header
			className={twJoin(
				'blog-header relative z-50 w-full border-b',
				'border-slate-200 bg-white/80 backdrop-blur-sm',
				'dark:border-slate-800 dark:bg-slate-900/80'
			)}
		>
			<div className="container mx-auto px-4 md:px-6 lg:px-8">
				{/* Mobile: Hamburger menu and logo */}
				<div className="flex items-center justify-between py-4 md:hidden">
					<div className="flex items-center gap-3">
						<HeaderLeftSidebar publication={publication} />
						<PublicationLogo publication={publication} size="sm" withProfileImage />
					</div>
					<div className="flex items-center gap-2">
						<DarkModeToggle />
						<UserAvatarDropdown />
					</div>
				</div>

				{/* Desktop: Full navigation */}
				<div className="hidden items-center justify-between gap-8 py-5 md:flex">
					{/* Logo on the left */}
					<div className="flex-shrink-0">
						<PublicationLogo publication={publication} size="lg" withProfileImage />
					</div>

					{/* Navigation links in the center */}
					<div className="flex flex-1 items-center justify-center">
						<MinimalNavLinks isHome={isHome} enabledPages={publication.preferences?.enabledPages} />
					</div>

					{/* Search, Dark Mode, and Avatar on the right */}
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
		</header>
	);
};
