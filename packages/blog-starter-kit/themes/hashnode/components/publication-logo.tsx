import Link from 'next/link';
import { useEffect, useState } from 'react';
import { twJoin } from 'tailwind-merge';
import { Maybe, Preferences, PublicationFragment, User } from '../generated/graphql';
import { generateBlogTitleWithoutDisplayTitle } from '../utils/commonUtils';
import { getBlurHash, resizeImage } from '../utils/image';
import CustomImage from './custom-image';

type PublicationLogoProps = {
	publication: Pick<PublicationFragment, 'title' | 'isTeam'> & {
		author: Pick<User, 'username' | 'name' | 'profilePicture'>;
	} & {
		preferences: Pick<Preferences, 'logo' | 'darkMode'>;
	};
	size?: 'xs' | 'sm' | 'lg' | 'xl';
	withProfileImage?: boolean;
	isPostPage?: boolean | null;
};

const textStyles = {
	xs: 'text-base text-left',
	sm: 'text-lg md:text-xl text-left',
	lg: 'text-xl md:text-2xl text-left',
	xl: 'text-2xl text-center',
} as const;

const logoSizes = {
	xs: 'w-44',
	sm: 'w-44',
	lg: 'w-64',
	xl: 'w-64',
} as const;

const CustomLogo = ({
	publication,
	logoSrc,
	size = 'lg',
	isPostPage,
	useLocalLogo = false,
}: {
	publication: Pick<PublicationFragment, 'title'> & {
		author: Pick<User, 'name'>;
	};
	logoSrc: Maybe<string> | undefined;
	size?: 'xs' | 'sm' | 'lg' | 'xl';
	isPostPage?: boolean | null;
	useLocalLogo?: boolean;
}) => {
	const blogTitle = generateBlogTitleWithoutDisplayTitle(publication);
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const checkDarkMode = () => {
			const dark = document.documentElement.classList.contains('dark');
			setIsDarkMode(dark);
		};
		
		checkDarkMode();
		
		const observer = new MutationObserver(checkDarkMode);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});
		
		return () => observer.disconnect();
	}, []);

	// Use local SVG logos if useLocalLogo is true
	if (useLocalLogo && mounted) {
		const logoSrc = isDarkMode 
			? '/assets/ThinkLet-dark.svg' 
			: '/assets/ThinkLet.svg';
		
		// Dark logo has different dimensions (919x252) vs light (221x61)
		const logoWidth = isDarkMode ? 919 : 221;
		const logoHeight = isDarkMode ? 252 : 61;
		
		return (
			<h1 className="blog-main-logo">
				<Link
					className={twJoin(
						'blog-logo focus-ring-base flex flex-row items-center',
						'focus-ring-colors-base',
						logoSizes[size],
					)}
					aria-label={`${blogTitle} home page`}
					href={`/${isPostPage ? '?source=top_nav_blog_home' : ''}`}
				>
					<CustomImage
						priority
						objectFit="contain"
						className="block w-full h-auto"
						src={logoSrc}
						originalSrc={logoSrc}
						width={logoWidth}
						height={logoHeight}
						alt={blogTitle}
					/>
				</Link>
			</h1>
		);
	}

	return (
		<h1 className="blog-main-logo">
			<Link
				className={twJoin(
					'blog-logo focus-ring-base flex flex-row items-center',
					'focus-ring-colors-base',
					logoSizes[size],
				)}
				aria-label={`${blogTitle} home page`}
				href={`/${isPostPage ? '?source=top_nav_blog_home' : ''}`}
			>
				<CustomImage
					priority
					objectFit="contain"
					className="block w-full"
					src={resizeImage(logoSrc, { w: 1000, h: 250 })}
					originalSrc={logoSrc || ''}
					width={1000}
					height={250}
					alt={blogTitle}
				/>
			</Link>
		</h1>
	);
};

const DefaultLogo = ({
	publication,
	size = 'lg',
	withProfileImage = false,
	isPostPage,
}: {
	publication: Pick<PublicationFragment, 'title' | 'isTeam'> & {
		author: Pick<User, 'username' | 'name' | 'profilePicture'>;
	} & {
		preferences: Pick<Preferences, 'logo' | 'darkMode'>;
	};
	size?: 'xs' | 'sm' | 'lg' | 'xl';
	withProfileImage?: boolean;
	isPostPage?: boolean | null;
}) => {
	const blogTitle = generateBlogTitleWithoutDisplayTitle(publication);

	return (
		<h1
			className={twJoin(
				'blog-title',
				textStyles[size],
				'font-heading break-words font-semibold leading-snug md:font-bold',
				'dark:text-white',
			)}
		>
			<Link
				href={`/${isPostPage ? '?source=top_nav_blog_home' : ''}`}
				className={twJoin('focus-ring-base flex flex-row items-center', 'focus-ring-colors-base')}
				aria-label={`${blogTitle} home page`}
			>
				{!publication.isTeam && publication.author.profilePicture && withProfileImage && (
					<div className="mr-2 h-10 w-10 shrink-0 overflow-hidden rounded-full">
						<CustomImage
							priority
							src={resizeImage(publication.author.profilePicture, { w: 400, h: 400, c: 'face' })}
							originalSrc={publication.author.profilePicture}
							blurDataURL={getBlurHash(
								resizeImage(publication.author.profilePicture, { w: 400, h: 400, c: 'face' }),
							)}
							width={400}
							height={400}
							alt={publication.author.name}
						/>
					</div>
				)}
				{blogTitle}
			</Link>
		</h1>
	);
};

function PublicationLogo(props: PublicationLogoProps) {
	const { publication, size, withProfileImage, isPostPage } = props;
	const { preferences } = publication;
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Check if dark mode is active
		const checkDarkMode = () => {
			const dark = document.documentElement.classList.contains('dark');
			setIsDarkMode(dark);
		};
		
		checkDarkMode();
		
		// Watch for theme changes
		const observer = new MutationObserver(checkDarkMode);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});
		
		return () => observer.disconnect();
	}, []);

	if (!publication) {
		return null;
	}
	
	// Always use local SVG logos
	return (
		<CustomLogo 
			publication={publication} 
			logoSrc={preferences.logo} 
			size={size} 
			isPostPage={isPostPage}
			useLocalLogo={true}
		/>
	);
	return (
		<DefaultLogo
			publication={publication}
			size={size}
			withProfileImage={withProfileImage}
			isPostPage={isPostPage}
		/>
	);
}

export default PublicationLogo;
