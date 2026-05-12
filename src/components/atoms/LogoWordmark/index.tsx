import React from 'react';
import { useTheme } from '@providers/ThemeProvider';
import { THEME } from '../../../stores/constants';
import { LogoWordmarkProps } from '../Logo/types';

/**
 * LogoWordmark Component
 *
 * Displays the VitalFlow wordmark (text-only logo) with automatic theme detection.
 * Ideal for footers, secondary headers, and text-focused layouts.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LogoWordmark width={150} />
 *
 * // Monochrome white for dark backgrounds
 * <LogoWordmark wordmarkStyle="mono" theme="white" width={200} />
 *
 * // Color variant with custom theme
 * <LogoWordmark wordmarkStyle="color" theme="dark" width={180} />
 * ```
 */
export const LogoWordmark: React.FC<LogoWordmarkProps> = ({
  wordmarkStyle = 'color',
  theme: themeOverride,
  width,
  height,
  format = 'svg',
  retina = true,
  alt = 'VitalFlow',
  className = '',
  style,
  onClick,
}) => {
  const { theme: appTheme } = useTheme();

  // Determine the effective theme
  const getEffectiveTheme = (): string => {
    if (themeOverride) return themeOverride;

    // Map app theme to logo theme
    switch (appTheme) {
      case THEME.DARK:
        return 'dark';
      case THEME.VIBRANT:
      case THEME.DEFAULT:
      default:
        return 'light';
    }
  };

  const effectiveTheme = getEffectiveTheme();

  // Build the wordmark path
  const buildWordmarkPath = (): string => {
    const basePath = '/brand/logo/wordmark';

    if (format === 'svg') {
      return `${basePath}/${wordmarkStyle}/logo-wordmark-${wordmarkStyle}-${effectiveTheme}.svg`;
    } else {
      // PNG format
      const widthSuffix = width && width <= 200 ? '200w' : '400w';
      return `${basePath}/${wordmarkStyle}/logo-wordmark-${wordmarkStyle}-${effectiveTheme}-${widthSuffix}.png`;
    }
  };

  // Build srcSet for retina displays (PNG only)
  const buildSrcSet = (): string | undefined => {
    if (format !== 'png' || !retina) return undefined;

    const basePath = '/brand/logo/wordmark';
    const widthSuffix = width && width <= 200 ? '200w' : '400w';
    const retinaSuffix = `${widthSuffix}@2x`;

    return `${basePath}/${wordmarkStyle}/logo-wordmark-${wordmarkStyle}-${effectiveTheme}-${retinaSuffix}.png 2x`;
  };

  const wordmarkPath = buildWordmarkPath();
  const srcSet = buildSrcSet();

  return (
    <img
      src={wordmarkPath}
      srcSet={srcSet}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onClick={onClick}
      loading="lazy"
    />
  );
};

export default LogoWordmark;
