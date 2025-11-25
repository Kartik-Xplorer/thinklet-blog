import { Analytics } from './analytics';
import { Integrations } from './integrations';
import { Meta } from './meta';
import { Scripts } from './scripts';
import dynamic from 'next/dynamic';

const CommandPalette = dynamic(() => import('./command-palette'), { ssr: false });
const ScrollToTop = dynamic(() => import('./scroll-to-top'), { ssr: false });

type Props = {
	children: React.ReactNode;
};

export const Layout = ({ children }: Props) => {
	return (
		<>
			<Meta />
			<Scripts />
			<CommandPalette />
			<ScrollToTop />
			<div className="min-h-screen bg-white dark:bg-neutral-950">
				<main>{children}</main>
			</div>
			<Analytics />
			<Integrations />
		</>
	);
};
