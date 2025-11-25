import { useBookmarks } from './hooks/use-bookmarks';
import { twJoin } from 'tailwind-merge';

type Props = {
    post: any;
};

const BookmarkButton = ({ post }: Props) => {
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const bookmarked = isBookmarked(post.slug);

    return (
        <button
            onClick={() => toggleBookmark(post.slug)}
            className={twJoin(
                'flex items-center justify-center rounded-full p-2 transition-colors duration-200',
                bookmarked
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            )}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={bookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
            >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
        </button>
    );
};

export default BookmarkButton;
