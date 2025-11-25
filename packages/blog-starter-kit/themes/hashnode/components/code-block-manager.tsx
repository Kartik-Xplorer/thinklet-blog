import { useEffect } from 'react';

const CodeBlockManager = () => {
    useEffect(() => {
        const codeBlocks = document.querySelectorAll('pre');

        codeBlocks.forEach((block) => {
            // Check if button already exists
            if (block.querySelector('.copy-button')) return;

            const button = document.createElement('button');
            button.className = 'copy-button absolute top-2 right-2 rounded bg-slate-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-600';
            button.innerText = 'Copy';

            // Make parent relative and group for hover effect
            block.classList.add('relative', 'group');

            button.addEventListener('click', async () => {
                const code = block.querySelector('code')?.innerText || block.innerText;
                await navigator.clipboard.writeText(code);
                button.innerText = 'Copied!';
                setTimeout(() => {
                    button.innerText = 'Copy';
                }, 2000);
            });

            block.appendChild(button);
        });
    }, []);

    return null;
};

export default CodeBlockManager;
