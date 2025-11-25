import { useState, useEffect } from 'react';

export const useBookmarks = () => {
    const [bookmarks, setBookmarks] = useState<string[]>([]);

    useEffect(() => {
        const storedBookmarks = localStorage.getItem('blog_bookmarks');
        if (storedBookmarks) {
            setBookmarks(JSON.parse(storedBookmarks));
        }
    }, []);

    const isBookmarked = (slug: string) => bookmarks.includes(slug);

    const toggleBookmark = (slug: string) => {
        let newBookmarks;
        if (bookmarks.includes(slug)) {
            newBookmarks = bookmarks.filter((b) => b !== slug);
        } else {
            newBookmarks = [...bookmarks, slug];
        }
        setBookmarks(newBookmarks);
        localStorage.setItem('blog_bookmarks', JSON.stringify(newBookmarks));
    };

    return { bookmarks, isBookmarked, toggleBookmark };
};
