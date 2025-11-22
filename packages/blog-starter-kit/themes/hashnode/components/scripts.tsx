export const Scripts = () => {
	const googleAnalytics = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());`;
	
	const themeInit = `
    (function() {
      try {
        const theme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (!theme && prefersDark)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();`;

	return (
		<>
			<script dangerouslySetInnerHTML={{ __html: themeInit }} />
			<script async src={`https://ping.hashnode.com/gtag/js?id=G-72XG3F8LNJ`} />
			<script dangerouslySetInnerHTML={{ __html: googleAnalytics }} />
		</>
	);
};
