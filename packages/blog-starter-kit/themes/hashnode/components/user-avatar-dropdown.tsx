import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { twJoin } from 'tailwind-merge';
import { useSupabaseAuth } from './contexts/supabaseAuthContext';
import { createSupabaseClient } from '../lib/supabase/client';
import { DEFAULT_AVATAR } from '../utils/const/images';

export function UserAvatarDropdown() {
	const { user, loading, signOut } = useSupabaseAuth();
	const router = useRouter();
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

	useEffect(() => {
		const fetchAvatar = async () => {
			if (!user) {
				setAvatarUrl(null);
				return;
			}

			try {
				const supabase = createSupabaseClient();
				const { data: profile } = await supabase
					.from('profiles')
					.select('avatar_url')
					.eq('id', user.id)
					.single();

				setAvatarUrl(profile?.avatar_url || user.user_metadata?.avatar_url || null);
			} catch {
				setAvatarUrl(user.user_metadata?.avatar_url || null);
			}
		};

		fetchAvatar();
	}, [user]);

	if (loading) {
		return (
			<div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
		);
	}

	if (!user) {
		return null;
	}

	const displayAvatar = avatarUrl || DEFAULT_AVATAR;

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button
					type="button"
					className={twJoin(
						'focus-ring-base flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 transition-colors',
						'focus-ring-colors-base hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
						'overflow-hidden'
					)}
					aria-label="User menu"
				>
					<img
						src={displayAvatar}
						alt={user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
						className="h-full w-full object-cover"
					/>
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="end"
					className={twJoin(
						'z-50 mt-2 w-56 rounded-lg border bg-white py-2 shadow-lg',
						'dark:border-slate-700 dark:bg-slate-800'
					)}
				>
					<div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
						<p className="text-sm font-medium text-slate-900 dark:text-slate-100">
							{user.user_metadata?.name || user.email?.split('@')[0]}
						</p>
						<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
							{user.email}
						</p>
					</div>
					<DropdownMenu.DropdownMenuItem asChild>
						<button
							type="button"
							onClick={async () => {
								await signOut();
								router.push('/');
							}}
							className={twJoin(
								'w-full px-4 py-2 text-left text-sm text-slate-700',
								'hover:bg-slate-100 focus:bg-slate-100 focus:outline-none',
								'dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700'
							)}
						>
							Sign Out
						</button>
					</DropdownMenu.DropdownMenuItem>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}

