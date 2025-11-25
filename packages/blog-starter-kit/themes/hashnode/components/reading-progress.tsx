import { useEffect, useState } from 'react';

const ReadingProgress = () => {
    const [completion, setCompletion] = useState(0);

    useEffect(() => {
        const updateScrollCompletion = () => {
            const currentProgress = window.scrollY;
            const scrollHeight = document.body.scrollHeight - window.innerHeight;
            if (scrollHeight) {
                setCompletion(Number((currentProgress / scrollHeight).toFixed(2)) * 100);
            }
        };

        window.addEventListener('scroll', updateScrollCompletion);

        return () => {
            window.removeEventListener('scroll', updateScrollCompletion);
        };
    }, []);

    return (
        <div
            className="fixed top-0 left-0 z-50 h-1 bg-blue-600 transition-all duration-150 ease-out"
            style={{ width: `${completion}%` }}
        />
    );
};

export default ReadingProgress;
