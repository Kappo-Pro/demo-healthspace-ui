import React from 'react';
import { useTheme } from '@providers/ThemeProvider';
import { THEME } from '../../../stores/constants';
import { LogoProps } from './types';

/**
 * Logo Component
 *
 * Displays the VitalFlow logo with automatic theme detection and variant support.
 *
 * @example
 * ```tsx
 * // Basic usage with auto theme detection
 * <Logo width={200} />
 *
 * // Icon variant
 * <Logo variant="icon" width={64} />
 *
 * // Custom theme override
 * <Logo variant="full" theme="dark" width={400} />
 *
 * // PNG format with retina support
 * <Logo format="png" width={200} />
 * ```
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  logoStyle = 'color',
  theme: themeOverride,
  width,
  height,
  format = 'svg',
  orientation = 'horizontal',
  retina = true,
  alt = 'VitalFlow',
  className = '',
  style,
  onClick,
}) => {
  const { theme: appTheme } = useTheme();

  // Determine the effective theme
  // Force rebuild - mapping theme values
  const getEffectiveTheme = (): string => {
    if (themeOverride) return themeOverride;

    // Map app theme to logo theme
    // New ThemeProvider uses: 'light', 'dark', 'default', 'vibrant'
    // Logo expects: 'light' or 'dark'
    switch (appTheme) {
      case 'dark':
      case THEME.DARK:
        return 'dark';
      case 'light':
      case 'default':
      case 'vibrant':
      case THEME.VIBRANT:
      case THEME.DEFAULT:
      default:
        return 'light';
    }
  };

  const effectiveTheme = getEffectiveTheme();

  // Build the logo path
  const buildLogoPath = (): string => {
    const basePath = '/brand/logo';

    if (variant === 'full') {
      const component = `full/${orientation}`;
      const style = logoStyle;

      if (format === 'svg') {
        return `${basePath}/${component}/${style}/logo-${orientation}-${style}-${effectiveTheme}.svg`;
      } else {
        const widthSuffix = width && width <= 200 ? '200w' : width && width <= 400 ? '400w' : '800w';
        return `${basePath}/${component}/${style}/logo-${orientation}-${style}-${effectiveTheme}-${widthSuffix}.png`;
      }
    } else if (variant === 'icon') {
      if (format === 'svg') {
        // For icons in color style, include theme suffix
        if (logoStyle === 'color') {
          return `${basePath}/icon/${logoStyle}/logo-icon-${logoStyle}-${effectiveTheme}.svg`;
        }
        // For mono and outline, include theme
        return `${basePath}/icon/${logoStyle}/logo-icon-${logoStyle}-${effectiveTheme}.svg`;
      } else {
        const size = width || height || 64;
        if (logoStyle === 'color') {
          return `${basePath}/icon/${logoStyle}/logo-icon-${logoStyle}-${effectiveTheme}-${size}x${size}.png`;
        }
        return `${basePath}/icon/${logoStyle}/logo-icon-${logoStyle}-${effectiveTheme}-${size}x${size}.png`;
      }
    } else if (variant === 'wordmark') {
      if (format === 'svg') {
        if (logoStyle === 'color') {
          return `${basePath}/wordmark/${logoStyle}/logo-wordmark-${logoStyle}-${effectiveTheme}.svg`;
        }
        return `${basePath}/wordmark/${logoStyle}/logo-wordmark-${logoStyle}-${effectiveTheme}.svg`;
      } else {
        const widthSuffix = width && width <= 200 ? '200w' : '400w';
        if (logoStyle === 'color') {
          return `${basePath}/wordmark/${logoStyle}/logo-wordmark-${logoStyle}-${effectiveTheme}-${widthSuffix}.png`;
        }
        return `${basePath}/wordmark/${logoStyle}/logo-wordmark-${logoStyle}-${effectiveTheme}-${widthSuffix}.png`;
      }
    }

    return `${basePath}/full/horizontal/color/logo-horizontal-color-light.svg`;
  };

  // Build srcSet for retina displays (PNG only)
  const buildSrcSet = (): string | undefined => {
    if (format !== 'png' || !retina) return undefined;

    const basePath = '/brand/logo';

    if (variant === 'full') {
      const component = `full/${orientation}`;
      const style = logoStyle;
      const widthSuffix = width && width <= 200 ? '200w' : width && width <= 400 ? '400w' : '800w';
      const retinaSuffix = `${widthSuffix}@2x`;

      return `${basePath}/${component}/${style}/logo-${orientation}-${style}-${effectiveTheme}-${retinaSuffix}.png 2x`;
    } else if (variant === 'wordmark') {
      const widthSuffix = width && width <= 200 ? '200w' : '400w';
      const retinaSuffix = `${widthSuffix}@2x`;

      if (logoStyle === 'color') {
        return `${basePath}/wordmark/${logoStyle}/logo-wordmark-${logoStyle}-${effectiveTheme}-${retinaSuffix}.png 2x`;
      }
      return `${basePath}/wordmark/${logoStyle}/logo-wordmark-${logoStyle}-${effectiveTheme}-${retinaSuffix}.png 2x`;
    }

    return undefined;
  };

  const logoPath = buildLogoPath();
  const srcSet = buildSrcSet();

  return (
    <img
      src={logoPath}
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

export default Logo;
