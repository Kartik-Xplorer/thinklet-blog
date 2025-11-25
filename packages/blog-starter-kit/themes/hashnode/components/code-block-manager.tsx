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

            // Add language label
            const codeElement = block.querySelector('code');
            let language = '';
            if (codeElement) {
                codeElement.classList.forEach((cls) => {
                    if (cls.startsWith('language-')) {
                        language = cls.replace('language-', '');
                    }
                });
            }

            if (language) {
                const langLabel = document.createElement('span');
                langLabel.className = 'absolute top-2 right-14 rounded px-2 py-1 text-xs font-bold text-slate-400 uppercase opacity-0 transition-opacity group-hover:opacity-100 select-none';
                langLabel.innerText = language;
                block.appendChild(langLabel);
            }

            block.appendChild(button);
        });
    }, []);

    return null;
};

export default CodeBlockManager;
