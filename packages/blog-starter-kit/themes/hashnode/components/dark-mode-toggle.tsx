import { useEffect, useState } from 'react';
import { twJoin } from 'tailwind-merge';
import SunSVG from './icons/svgs/SunSVG';
import MoonSVG from './icons/svgs/MoonSVG';

export function DarkModeToggle() {
	const [isDark, setIsDark] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Check initial theme
		const darkMode = document.documentElement.classList.contains('dark');
		setIsDark(darkMode);
	}, []);

	const toggleTheme = () => {
		const html = document.documentElement;
		const newIsDark = !html.classList.contains('dark');
		
		if (newIsDark) {
			html.classList.add('dark');
			setIsDark(true);
			localStorage.setItem('theme', 'dark');
		} else {
			html.classList.remove('dark');
			setIsDark(false);
			localStorage.setItem('theme', 'light');
		}
	};

	if (!mounted) {
		return (
			<button
				type="button"
				className={twJoin(
					'focus-ring-base flex h-9 w-9 items-center justify-center rounded-full transition-colors',
					'focus-ring-colors-base hover:bg-black/5 dark:hover:bg-white/10',
					'text-slate-600 dark:text-slate-300'
				)}
				aria-label="Toggle dark mode"
			>
				<div className="h-4 w-4" />
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className={twJoin(
				'focus-ring-base flex h-9 w-9 items-center justify-center rounded-full transition-colors',
				'focus-ring-colors-base hover:bg-black/5 dark:hover:bg-white/10',
				'text-slate-600 dark:text-slate-300'
			)}
			aria-label="Toggle dark mode"
		>
			{isDark ? (
				<SunSVG className="h-4 w-4 stroke-current" />
			) : (
				<MoonSVG className="h-4 w-4 stroke-current" />
			)}
		</button>
	);
}

