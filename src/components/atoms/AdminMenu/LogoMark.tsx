import { useEffect, useState } from 'react';

interface LogoWithFallbackProps {
	download?: boolean;
}

const LogoWithFallback = ({ download }: LogoWithFallbackProps) => {
	const [imgError, setImgError] = useState(false);

	// Compute logo URL immediately during initialization
	const [logo] = useState<string>(() => {
		const host = window.location.hostname;
		const parts = host.split('.');
		const logoPart = parts.slice(0, -2).join('.');
		return `https://risecxlibrary.blob.core.windows.net/documents/${logoPart}_logo_small.png`;
	});

	// Detect current theme from data-theme attribute - initialize immediately from DOM
	const [currentTheme, setCurrentTheme] = useState<string>(() => {
		return document.documentElement.getAttribute('data-theme') || 'default';
	});

	// Listen for theme changes
	useEffect(() => {
		const updateTheme = () => {
			const theme =
				document.documentElement.getAttribute('data-theme') || 'default';
			setCurrentTheme(theme);
		};

		// Initial theme
		updateTheme();

		// Listen for theme changes
		const observer = new MutationObserver(updateTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});

		return () => observer.disconnect();
	}, []);

	// Determine which fallback logo to use based on theme
	const getFallbackLogo = () => {
		// In dark mode, use white/light logo
		// In light/default mode, use the primary colored logo
		return currentTheme === 'dark' ? '/icon-dark.png' : '/icon-light.png';
	};

	// For PDF downloads, always use fallback logo to ensure immediate rendering
	// Custom logos from Azure might not load in time for PDF capture
	if (download) {
		return (
			<img
				src={getFallbackLogo()}
				alt="vitalflow-logo"
				style={{ width: '100%', height: '100%', objectFit: 'contain' }}
			/>
		);
	}

	// For sidebar, show fallback if logo URL not set or error occurred
	if (!logo || imgError) {
		return (
			<img
				src={getFallbackLogo()}
				alt="vitalflow-logo"
				style={{ width: '35px', marginLeft: 'var(--spacing-1-5)' }}
			/>
		);
	}

	// For sidebar, try to load custom logo
	return (
		<img
			key={logo}
			src={logo}
			alt="logo"
			onError={() => setImgError(true)}
			style={{
				width: '45px',
				height: 'auto',
				objectFit: 'cover',
				borderRadius: '10px',
				background: 'var(--surface-primary)',
			}}
		/>
	);
};

export default LogoWithFallback;
