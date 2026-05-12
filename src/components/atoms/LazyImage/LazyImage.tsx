/**
 * LazyImage Component
 *
 * Story 4.3: Performance Optimization - AC3 (Image Optimization)
 *
 * Features:
 * - Lazy loading with Intersection Observer
 * - Blur-up placeholder for progressive loading
 * - WebP format with fallback
 * - Responsive srcset support
 * - Automatic width/height to prevent layout shift
 *
 * @module components/atoms/LazyImage
 */

import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import './LazyImage.css';

export interface LazyImageProps {
	/** Image source URL (WebP preferred) */
	src: string;
	/** Fallback image source (JPEG/PNG) */
	fallbackSrc?: string;
	/** Alternative text for accessibility */
	alt: string;
	/** Image width (prevents layout shift) */
	width?: number;
	/** Image height (prevents layout shift) */
	height?: number;
	/** CSS class name */
	className?: string;
	/** Inline styles */
	style?: CSSProperties;
	/** Responsive srcset */
	srcSet?: string;
	/** Image sizes attribute */
	sizes?: string;
	/** Loading priority (eager for above-the-fold) */
	loading?: 'lazy' | 'eager';
	/** Blur placeholder image (tiny base64) */
	placeholder?: string;
	/** Callback when image loads */
	onLoad?: () => void;
	/** Callback when image errors */
	onError?: () => void;
}

/**
 * LazyImage Component with blur-up placeholder
 *
 * @example
 * ```tsx
 * import { useTranslation } from 'react-i18next';
 *
 * const { t } = useTranslation();
 *
 * <LazyImage
 *   src="/images/scan.webp"
 *   fallbackSrc="/images/scan.jpg"
 *   alt={t('common.postureScanAlt')}
 *   width={800}
 *   height={600}
 *   placeholder="data:image/jpeg;base64,/9j/4AAQ..."
 *   loading="lazy"
 * />
 * ```
 */
export const LazyImage: React.FC<LazyImageProps> = ({
	src,
	fallbackSrc,
	alt,
	width,
	height,
	className = '',
	style,
	srcSet,
	sizes,
	loading = 'lazy',
	placeholder,
	onLoad,
	onError,
}) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isInView, setIsInView] = useState(loading === 'eager');
	const [hasError, setHasError] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);

	// Intersection Observer for lazy loading
	useEffect(() => {
		if (loading === 'eager' || !imgRef.current) {
			return;
		}

		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						setIsInView(true);
						observer.disconnect();
					}
				});
			},
			{
				rootMargin: '50px', // Start loading 50px before image enters viewport
			},
		);

		observer.observe(imgRef.current);

		return () => {
			observer.disconnect();
		};
	}, [loading]);

	const handleLoad = () => {
		setIsLoaded(true);
		onLoad?.();
	};

	const handleError = () => {
		setHasError(true);
		onError?.();
	};

	// Aspect ratio container to prevent layout shift
	const aspectRatio = width && height ? (height / width) * 100 : undefined;

	return (
		<div
			className={`lazy-image-container ${className}`}
			style={{
				...style,
				position: 'relative',
				overflow: 'hidden',
				...(aspectRatio && {
					paddingBottom: `${aspectRatio}%`,
					height: 0,
				}),
			}}
			ref={imgRef}>
			{/* Blur placeholder */}
			{placeholder && !isLoaded && (
				<img
					src={placeholder}
					alt=""
					aria-hidden="true"
					className="lazy-image-placeholder"
					style={{
						position: aspectRatio ? 'absolute' : 'relative',
						top: 0,
						left: 0,
						width: '100%',
						height: aspectRatio ? '100%' : 'auto',
						filter: 'blur(10px)',
						transform: 'scale(1.1)',
						transition: 'opacity 0.3s ease-in-out',
						opacity: isLoaded ? 0 : 1,
					}}
				/>
			)}

			{/* Main image */}
			{isInView && (
				<picture>
					{/* WebP source */}
					<source type="image/webp" srcSet={srcSet || src} sizes={sizes} />

					{/* Fallback source */}
					{fallbackSrc && (
						<source
							type={getFallbackType(fallbackSrc)}
							srcSet={fallbackSrc}
							sizes={sizes}
						/>
					)}

					{/* Img element */}
					<img
						src={hasError && fallbackSrc ? fallbackSrc : src}
						alt={alt}
						width={width}
						height={height}
						loading={loading}
						onLoad={handleLoad}
						onError={handleError}
						className={`lazy-image ${isLoaded ? 'lazy-image-loaded' : ''}`}
						style={{
							position: aspectRatio ? 'absolute' : 'relative',
							top: 0,
							left: 0,
							width: '100%',
							height: aspectRatio ? '100%' : 'auto',
							objectFit: 'cover',
							opacity: isLoaded ? 1 : 0,
							transition: 'opacity 0.3s ease-in-out',
						}}
					/>
				</picture>
			)}
		</div>
	);
};

/**
 * Get MIME type from file extension
 */
function getFallbackType(url: string): string {
	const ext = url.split('.').pop()?.toLowerCase();
	switch (ext) {
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'png':
			return 'image/png';
		case 'gif':
			return 'image/gif';
		default:
			return 'image/jpeg';
	}
}

LazyImage.displayName = 'LazyImage';

export default LazyImage;
