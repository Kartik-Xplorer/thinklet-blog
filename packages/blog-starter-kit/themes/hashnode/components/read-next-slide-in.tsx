import { useEffect, useState } from 'react';
import Link from 'next/link';
import { resizeImage } from '../utils/image';
import { MorePostsEdgeFragment } from '../generated/graphql';
import { ArrowRightIcon, Cross2Icon } from '@radix-ui/react-icons';

type Props = {
    recommendedPosts: MorePostsEdgeFragment[];
};

const ReadNextSlideIn = ({ recommendedPosts }: Props) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (isDismissed) return;

            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Show when user has scrolled 70% of the page
            if (scrollPosition > documentHeight * 0.7) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isDismissed]);

    if (!recommendedPosts || recommendedPosts.length === 0 || !isVisible || isDismissed) {
        return null;
    }

    const nextPost = recommendedPosts[0].node;

    return (
        <div className="fixed bottom-5 right-5 z-40 w-80 translate-y-0 transform rounded-lg border border-slate-200 bg-white p-4 shadow-xl transition-transform duration-300 dark:border-slate-700 dark:bg-slate-900">
            <button
                onClick={() => setIsDismissed(true)}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close"
            >
                <Cross2Icon className="h-4 w-4" />
            </button>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Read Next</p>
            <Link href={`/${nextPost.slug}`} className="group block">
                <div className="flex items-start gap-3">
                    {nextPost.coverImage?.url && (
                        <img
                            src={resizeImage(nextPost.coverImage.url, { w: 100, h: 100, c: 'thumb' })}
                            alt={nextPost.title}
                            className="h-16 w-16 rounded object-cover"
                        />
                    )}
                    <div>
                        <h4 className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                            {nextPost.title}
                        </h4>
                        <div className="mt-2 flex items-center text-xs font-medium text-blue-600 dark:text-blue-400">
                            Read now <ArrowRightIcon className="ml-1 h-3 w-3" />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ReadNextSlideIn;
