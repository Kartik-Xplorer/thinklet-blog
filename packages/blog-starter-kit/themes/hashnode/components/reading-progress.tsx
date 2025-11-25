import { useEffect, useState } from 'react';

type Props = {
    readTimeInMinutes?: number;
};

const ReadingProgress = ({ readTimeInMinutes }: Props) => {
    const [completion, setCompletion] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        const updateScrollCompletion = () => {
            const currentProgress = window.scrollY;
            const scrollHeight = document.body.scrollHeight - window.innerHeight;
            if (scrollHeight) {
                const progress = Number((currentProgress / scrollHeight).toFixed(2));
                setCompletion(progress * 100);

                if (readTimeInMinutes) {
                    const remaining = Math.ceil(readTimeInMinutes * (1 - progress));
                    setTimeLeft(remaining > 0 ? remaining : 0);
                }
            }
        };

        window.addEventListener('scroll', updateScrollCompletion);

        return () => {
            window.removeEventListener('scroll', updateScrollCompletion);
        };
    }, [readTimeInMinutes]);

    return (
        <div className="fixed top-0 left-0 z-50 w-full">
            <div
                className="h-1 bg-blue-600 transition-all duration-150 ease-out"
                style={{ width: `${completion}%` }}
            />
            {timeLeft !== null && timeLeft > 0 && (
                <div className="absolute top-2 right-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-300">
                    {timeLeft} min left
                </div>
            )}
        </div>
    );
};

export default ReadingProgress;
