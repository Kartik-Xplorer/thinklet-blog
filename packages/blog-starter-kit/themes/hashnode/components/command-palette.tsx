import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon, MoonIcon, SunIcon, HomeIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';

const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-0 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center border-b border-slate-200 px-4 dark:border-slate-700">
                        <MagnifyingGlassIcon className="mr-2 h-5 w-5 text-slate-500" />
                        <input
                            className="flex h-12 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-slate-500 dark:text-white"
                            placeholder="Type a command or search..."
                        />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-2">
                        <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Navigation</div>
                        <button
                            onClick={() => runCommand(() => router.push('/'))}
                            className="flex w-full items-center rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <HomeIcon className="mr-2 h-4 w-4" />
                            Home
                        </button>
                        <button
                            onClick={() => runCommand(() => router.push('/newsletter'))}
                            className="flex w-full items-center rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                            Newsletter
                        </button>

                        <div className="mb-2 mt-4 px-2 text-xs font-semibold text-slate-500">Theme</div>
                        <button
                            onClick={() => runCommand(() => setTheme('light'))}
                            className="flex w-full items-center rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <SunIcon className="mr-2 h-4 w-4" />
                            Light Mode
                        </button>
                        <button
                            onClick={() => runCommand(() => setTheme('dark'))}
                            className="flex w-full items-center rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <MoonIcon className="mr-2 h-4 w-4" />
                            Dark Mode
                        </button>
                    </div>
                    <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-700">
                        Press <kbd className="font-sans">Esc</kbd> to close
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default CommandPalette;
