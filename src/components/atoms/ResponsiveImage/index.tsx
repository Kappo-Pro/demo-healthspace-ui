import React, { useMemo, useState } from 'react';

export interface ResponsiveImageProps {
	src: string;
	alt: string;
	width?: number | string;
	height?: number | string;
	className?: string;
	loading?: 'lazy' | 'eager';
	style?: React.CSSProperties;
	// optional: pass true only if you actually have webp assets generated
	tryWebp?: boolean;
	// optional: function to normalize relative Strapi URLs -> absolute
	normalizeSrc?: (url: string) => string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
	src,
	alt,
	width,
	height,
	className,
	loading = 'lazy',
	style,
	tryWebp = true,
	normalizeSrc,
}) => {
	// Allow caller to normalize (e.g., prepend STRAPI_BASE_URL or enforce https)
	const original = useMemo(
		() => (normalizeSrc ? normalizeSrc(src) : src),
		[src, normalizeSrc],
	);

	const isRaster = /\.(jpg|jpeg|png)(\?.*)?$/i.test(original);
	const computedWebp = isRaster
		? original.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2') // keep querystring if any
		: null;

	// Start by offering webp if we think it *might* exist
	const [useWebp, setUseWebp] = useState<boolean>(
		Boolean(tryWebp && computedWebp),
	);

	// If the selected resource fails (e.g., webp 404), remove the <source> and force re-evaluation.
	const [pictureKey, setPictureKey] = useState('webp-try');
	const handleError = () => {
		if (useWebp) {
			setUseWebp(false);
			setPictureKey('orig-only'); // force <picture> to remount without <source>
		}
	};

	return (
		<picture key={pictureKey}>
			{useWebp && computedWebp && (
				<source srcSet={computedWebp} type="image/webp" />
			)}
			<img
				src={original}
				alt={alt}
				width={width}
				height={height}
				className={className}
				loading={loading}
				style={style}
				onError={handleError}
			/>
		</picture>
	);
};

export default ResponsiveImage;
