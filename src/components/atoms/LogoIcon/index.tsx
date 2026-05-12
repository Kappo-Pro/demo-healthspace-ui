import React from 'react';
import { useTheme } from '@providers/ThemeProvider';
import { THEME } from '../../../stores/constants';
import { LogoIconProps } from '../Logo/types';

/**
 * LogoIcon Component
 *
 * Displays the VitalFlow icon logo with automatic theme detection.
 * Optimized for small UI elements, avatars, and favicons.
 *
 * @example
 * ```tsx
 * // Basic usage (64x64)
 * <LogoIcon />
 *
 * // Small icon for chips
 * <LogoIcon size={32} />
 *
 * // Large avatar
 * <LogoIcon size={128} />
 *
 * // Monochrome white for overlays
 * <LogoIcon iconStyle="mono" theme="white" size={64} />
 * ```
 */
export const LogoIcon: React.FC<LogoIconProps> = ({
  size = 64,
  iconStyle = 'color',
  theme: themeOverride,
  format = 'svg',
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

  // Build the icon path
  const buildIconPath = (): string => {
    const basePath = '/brand/logo/icon';

    if (format === 'svg') {
      // Color icons don't have theme suffix
      if (iconStyle === 'color') {
        return `${basePath}/${iconStyle}/logo-icon-${iconStyle}.svg`;
      }
      // Mono and outline icons include theme
      return `${basePath}/${iconStyle}/logo-icon-${iconStyle}-${effectiveTheme}.svg`;
    } else {
      // PNG format
      if (iconStyle === 'color') {
        return `${basePath}/${iconStyle}/logo-icon-${iconStyle}-${size}x${size}.png`;
      }
      return `${basePath}/${iconStyle}/logo-icon-${iconStyle}-${effectiveTheme}-${size}x${size}.png`;
    }
  };

  const iconPath = buildIconPath();

  return (
    <img
      src={iconPath}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={style}
      onClick={onClick}
      loading="lazy"
    />
  );
};

export default LogoIcon;
