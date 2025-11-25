import { useEffect, useState } from 'react';
import { TwitterLogoIcon } from '@radix-ui/react-icons';

const HighlightShare = () => {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [selectedText, setSelectedText] = useState('');

    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.toString().length === 0) {
                setPosition(null);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const text = selection.toString();

            // Only show if selection is within the post content
            const postContent = document.getElementById('post-content-parent');
            if (postContent && postContent.contains(range.commonAncestorContainer)) {
                setSelectedText(text);
                setPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top + window.scrollY - 40,
                });
            } else {
                setPosition(null);
            }
        };

        document.addEventListener('selectionchange', handleSelection);
        return () => document.removeEventListener('selectionchange', handleSelection);
    }, []);

    if (!position) return null;

    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `"${selectedText}"`
    )}&url=${encodeURIComponent(window.location.href)}`;

    return (
        <div
            className="absolute z-50 -translate-x-1/2 transform"
            style={{ left: position.x, top: position.y }}
        >
            <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 dark:bg-white dark:text-slate-900"
            >
                <TwitterLogoIcon className="h-4 w-4" />
                Share
            </a>
            <div className="absolute left-1/2 top-full -ml-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-900 dark:bg-white" />
        </div>
    );
};

export default HighlightShare;
