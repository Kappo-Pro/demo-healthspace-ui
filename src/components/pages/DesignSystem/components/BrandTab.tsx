/**
 * Design System Brand Tab
 *
 * Displays logo showcase and brand color palettes with download capabilities
 * and color format conversions.
 *
 * @module DesignSystem/components/BrandTab
 */

import React, { useMemo, useCallback } from 'react';
import { Card, Row, Col, Button, message } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import Logo from '@atoms/Logo';
import type { Theme } from '../types';
import { getTokenValue, hexToHsl } from '../utils/tokenHelpers';
import { downloadFile, copyToClipboard } from '../utils/exportHelpers';

/**
 * Props interface for BrandTab component
 */
interface BrandTabProps {
	/** Currently active theme */
	currentTheme: Theme;
}

/**
 * Logo variant configuration
 */
interface LogoVariant {
	name: string;
	variant: 'full' | 'icon' | 'wordmark';
	logoStyle: 'color' | 'mono' | 'outline';
	theme: 'light' | 'dark';
	bgColor: string;
	width: number;
	height?: number;
}

/**
 * Color swatch in a palette
 */
interface ColorSwatch {
	name: string;
	token: string;
	hex: string;
	rgb: string;
	hsl: string;
}

/**
 * Color palette configuration
 */
interface ColorPalette {
	name: string;
	description: string;
	colors: ColorSwatch[];
}

/**
 * BrandTab Component
 *
 * Displays:
 * - Logo showcase with multiple variants and download options
 * - Color palettes with hex, RGB, HSL values and copy functionality
 * - Brand guidelines and usage examples
 */
export const BrandTab: React.FC<BrandTabProps> = ({ currentTheme: _currentTheme }) => {
	/**
	 * Logo variants to showcase
	 */
	const logoVariants: LogoVariant[] = useMemo(
		() => [
			{
				name: 'Full Logo - Color (Light BG)',
				variant: 'full',
				logoStyle: 'color',
				theme: 'light',
				bgColor: 'var(--surface-primary)',
				width: 240,
			},
			{
				name: 'Full Logo - Color (Dark BG)',
				variant: 'full',
				logoStyle: 'color',
				theme: 'dark',
				bgColor: 'var(--color-gray-900)',
				width: 240,
			},
			{
				name: 'Full Logo - Mono (Light BG)',
				variant: 'full',
				logoStyle: 'mono',
				theme: 'light',
				bgColor: 'var(--color-gray-50)',
				width: 240,
			},
			{
				name: 'Full Logo - Mono (Dark BG)',
				variant: 'full',
				logoStyle: 'mono',
				theme: 'dark',
				bgColor: 'var(--color-gray-900)',
				width: 240,
			},
			{
				name: 'Icon Only - Color',
				variant: 'icon',
				logoStyle: 'color',
				theme: 'light',
				bgColor: 'var(--surface-primary)',
				width: 80,
				height: 80,
			},
			{
				name: 'Icon Only - Mono',
				variant: 'icon',
				logoStyle: 'mono',
				theme: 'light',
				bgColor: 'var(--color-gray-50)',
				width: 80,
				height: 80,
			},
			{
				name: 'Wordmark - Color',
				variant: 'wordmark',
				logoStyle: 'color',
				theme: 'light',
				bgColor: 'var(--surface-primary)',
				width: 200,
			},
			{
				name: 'Wordmark - Mono',
				variant: 'wordmark',
				logoStyle: 'mono',
				theme: 'dark',
				bgColor: 'var(--color-gray-900)',
				width: 200,
			},
		],
		[]
	);

	/**
	 * Convert hex color to RGB string
	 */
	const hexToRgb = useCallback((hex: string): string => {
		const cleanHex = hex.replace('#', '');
		const r = parseInt(cleanHex.slice(0, 2), 16);
		const g = parseInt(cleanHex.slice(2, 4), 16);
		const b = parseInt(cleanHex.slice(4, 6), 16);
		// eslint-disable-next-line vitalflow/no-hardcoded-colors -- Dynamic RGB conversion utility
		return `rgb(${r}, ${g}, ${b})`;
	}, []);

	/**
	 * Convert hex color to HSL string
	 */
	const hexToHslString = useCallback((hex: string): string => {
		const hsl = hexToHsl(hex);
		if (!hsl) return 'N/A';
		return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
	}, []);

	/**
	 * Create color swatch from token
	 */
	const createColorSwatch = useCallback(
		(name: string, token: string): ColorSwatch => {
			const hex = getTokenValue(token);
			return {
				name,
				token,
				hex,
				rgb: hexToRgb(hex),
				hsl: hexToHslString(hex),
			};
		},
		[hexToRgb, hexToHslString]
	);

	/**
	 * Color palettes to display
	 */
	const colorPalettes: ColorPalette[] = useMemo(
		() => [
			{
				name: 'Primary Brand (Purple)',
				description: 'Professional medical-focused aesthetic - Default theme',
				colors: [
					createColorSwatch('Purple 700', '--color-purple-700'),
					createColorSwatch('Purple 600', '--color-purple-600'),
					createColorSwatch('Purple 500', '--color-purple-500'),
					createColorSwatch('Purple 400', '--color-purple-400'),
					createColorSwatch('Purple 300', '--color-purple-300'),
				],
			},
			{
				name: 'Secondary Brand (Orange)',
				description: 'Energetic vibrant theme accents',
				colors: [
					createColorSwatch('Orange 700', '--color-orange-700'),
					createColorSwatch('Orange 600', '--color-orange-600'),
					createColorSwatch('Orange 500', '--color-orange-500'),
					createColorSwatch('Orange 400', '--color-orange-400'),
					createColorSwatch('Orange 300', '--color-orange-300'),
				],
			},
			{
				name: 'Accent Colors (Lime)',
				description: 'Dark theme highlights and CTAs',
				colors: [
					createColorSwatch('Lime 700', '--color-lime-700'),
					createColorSwatch('Lime 600', '--color-lime-600'),
					createColorSwatch('Lime 500', '--color-lime-500'),
					createColorSwatch('Lime 400', '--color-lime-400'),
					createColorSwatch('Lime 300', '--color-lime-300'),
				],
			},
			{
				name: 'Semantic Colors',
				description: 'Status and feedback colors',
				colors: [
					createColorSwatch('Success', '--color-success-600'),
					createColorSwatch('Error', '--color-error-600'),
					createColorSwatch('Warning', '--color-warning-600'),
					createColorSwatch('Info', '--color-info-600'),
				],
			},
		],
		[createColorSwatch]
	);

	/**
	 * Download logo as SVG
	 */
	const downloadLogoSVG = useCallback(async (variant: LogoVariant) => {
		try {
			// Construct SVG path based on variant
			let svgPath = '/brand/logo/';

			if (variant.variant === 'full') {
				svgPath += `full/horizontal/${variant.logoStyle}/logo-horizontal-${variant.logoStyle}-${variant.theme}.svg`;
			} else if (variant.variant === 'icon') {
				svgPath += `icon/${variant.logoStyle}/logo-icon-${variant.logoStyle}-${variant.theme}.svg`;
			} else if (variant.variant === 'wordmark') {
				svgPath += `wordmark/${variant.logoStyle}/logo-wordmark-${variant.logoStyle}-${variant.theme}.svg`;
			}

			// Fetch SVG content
			const response = await fetch(svgPath);
			if (!response.ok) throw new Error('Failed to fetch SVG');

			const svgContent = await response.text();

			// Download
			const filename = svgPath.split('/').pop() || 'vitalflow-logo.svg';
			downloadFile(svgContent, filename, 'image/svg+xml');

			message.success('SVG downloaded successfully');
		} catch (error) {
			message.error('Failed to download SVG');
		}
	}, []);

	/**
	 * Download logo as PNG (using canvas rendering)
	 */
	const downloadLogoPNG = useCallback(
		async (variant: LogoVariant, scale: 1 | 2 | 3 = 1) => {
			try {
				// For PNG, we'll use the pre-rendered PNG files from public folder
				let pngPath = '/brand/logo/';

				if (variant.variant === 'full') {
					const widthSuffix =
						variant.width <= 200 ? '200w' : variant.width <= 400 ? '400w' : '800w';
					const retinaSuffix = scale > 1 ? `@${scale}x` : '';
					pngPath += `full/horizontal/${variant.logoStyle}/logo-horizontal-${variant.logoStyle}-${variant.theme}-${widthSuffix}${retinaSuffix}.png`;
				} else if (variant.variant === 'icon') {
					const size = variant.width || 64;
					pngPath += `icon/${variant.logoStyle}/logo-icon-${variant.logoStyle}-${variant.theme}-${size}x${size}.png`;
				} else if (variant.variant === 'wordmark') {
					const widthSuffix = variant.width <= 200 ? '200w' : '400w';
					const retinaSuffix = scale > 1 ? `@${scale}x` : '';
					pngPath += `wordmark/${variant.logoStyle}/logo-wordmark-${variant.logoStyle}-${variant.theme}-${widthSuffix}${retinaSuffix}.png`;
				}

				// Fetch PNG and trigger download
				const response = await fetch(pngPath);
				if (!response.ok) throw new Error('Failed to fetch PNG');

				const blob = await response.blob();
				const url = URL.createObjectURL(blob);

				const link = document.createElement('a');
				link.href = url;
				link.download = pngPath.split('/').pop() || 'vitalflow-logo.png';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);

				message.success(`PNG downloaded (${scale}x)`);
			} catch (error) {
				message.error('Failed to download PNG');
			}
		},
		[]
	);

	/**
	 * Copy color value to clipboard
	 */
	const copyColorValue = useCallback(async (value: string, format: string) => {
		try {
			await copyToClipboard(value);
			message.success(`${format} copied to clipboard`);
		} catch (error) {
			message.error('Failed to copy to clipboard');
		}
	}, []);

	return (
		<Container>
			{/* Introduction */}
			<IntroSection>
				<SectionTitle>Brand Assets</SectionTitle>
				<IntroText>
					Download VitalFlow logos in various formats and explore our brand color palettes.
					All assets are available in multiple formats and resolutions.
				</IntroText>
			</IntroSection>

			{/* Logo Showcase */}
			<Section>
				<SectionTitle>Logo Variants</SectionTitle>
				<LogoGrid gutter={[24, 24]}>
					{logoVariants.map((variant, index) => (
						<Col xs={24} sm={12} lg={8} key={index}>
							<LogoCard>
								<PreviewArea style={{ backgroundColor: variant.bgColor }}>
									<Logo
										variant={variant.variant}
										logoStyle={variant.logoStyle}
										theme={variant.theme}
										width={variant.width}
										height={variant.height}
									/>
								</PreviewArea>
								<LogoInfo>
									<LogoName>{variant.name}</LogoName>
									<LogoDimensions>
										{variant.width}×{variant.height || 'auto'}px
									</LogoDimensions>
									<DownloadButtons>
										<Button
											icon={<UntitledIcon name="download" />}
											size="small"
											onClick={() => downloadLogoSVG(variant)}
										>
											SVG
										</Button>
										<Button
											icon={<UntitledIcon name="download" />}
											size="small"
											onClick={() => downloadLogoPNG(variant, 1)}
										>
											PNG
										</Button>
										<Button
											icon={<UntitledIcon name="download" />}
											size="small"
											onClick={() => downloadLogoPNG(variant, 2)}
											title="High resolution (2x)"
										>
											PNG @2x
										</Button>
									</DownloadButtons>
								</LogoInfo>
							</LogoCard>
						</Col>
					))}
				</LogoGrid>
			</Section>

			{/* Color Palettes */}
			<Section>
				<SectionTitle>Brand Color Palettes</SectionTitle>
				<PaletteGrid gutter={[24, 24]}>
					{colorPalettes.map((palette, paletteIndex) => (
						<Col xs={24} lg={12} key={paletteIndex}>
							<Card>
								<PaletteTitle>{palette.name}</PaletteTitle>
								<PaletteDescription>{palette.description}</PaletteDescription>
								<ColorSwatches>
									{palette.colors.map((color, colorIndex) => (
										<ColorSwatchContainer key={colorIndex}>
											<SwatchPreview style={{ backgroundColor: color.hex }} />
											<SwatchInfo>
												<ColorName>{color.name}</ColorName>
												<ColorValues>
													<ColorValue
														onClick={() => copyColorValue(color.hex, 'HEX')}
														title="Click to copy"
													>
														<UntitledIcon name="copy" style={{ fontSize: 10, marginRight: 4 }} />
														{color.hex}
													</ColorValue>
													<ColorValue
														onClick={() => copyColorValue(color.rgb, 'RGB')}
														title="Click to copy"
													>
														<UntitledIcon name="copy" style={{ fontSize: 10, marginRight: 4 }} />
														{color.rgb}
													</ColorValue>
													<ColorValue
														onClick={() => copyColorValue(color.hsl, 'HSL')}
														title="Click to copy"
													>
														<UntitledIcon name="copy" style={{ fontSize: 10, marginRight: 4 }} />
														{color.hsl}
													</ColorValue>
												</ColorValues>
											</SwatchInfo>
										</ColorSwatchContainer>
									))}
								</ColorSwatches>
							</Card>
						</Col>
					))}
				</PaletteGrid>
			</Section>

			{/* Usage Guidelines */}
			<Section>
				<SectionTitle>Usage Guidelines</SectionTitle>
				<Row gutter={[24, 24]}>
					<Col xs={24} lg={12}>
						<Card title="Logo Usage">
							<GuidelinesList>
								<GuidelineItem>
									<strong>Minimum Size:</strong> Never display the full logo smaller than 120px
									wide
								</GuidelineItem>
								<GuidelineItem>
									<strong>Clear Space:</strong> Maintain minimum clear space equal to the height
									of the icon
								</GuidelineItem>
								<GuidelineItem>
									<strong>Backgrounds:</strong> Use color version on light backgrounds, ensure
									sufficient contrast
								</GuidelineItem>
								<GuidelineItem>
									<strong>File Format:</strong> Use SVG for web, PNG for documents and
									presentations
								</GuidelineItem>
							</GuidelinesList>
						</Card>
					</Col>
					<Col xs={24} lg={12}>
						<Card title="Color Usage">
							<GuidelinesList>
								<GuidelineItem>
									<strong>Primary Purple:</strong> Main brand color for headers, CTAs, and key UI
									elements
								</GuidelineItem>
								<GuidelineItem>
									<strong>Secondary Orange:</strong> Use sparingly for vibrant theme accents and
									highlights
								</GuidelineItem>
								<GuidelineItem>
									<strong>Accent Lime:</strong> Dark theme CTAs and interactive elements
								</GuidelineItem>
								<GuidelineItem>
									<strong>Semantic Colors:</strong> Reserve for status indicators and feedback
									messages
								</GuidelineItem>
								<GuidelineItem>
									<strong>Accessibility:</strong> All colors meet WCAG AA standards for contrast
									when used properly
								</GuidelineItem>
							</GuidelinesList>
						</Card>
					</Col>
				</Row>
			</Section>
		</Container>
	);
};

// Styled Components

const Container = styled.div`
	padding: 24px;
	max-width: 1400px;
	margin: 0 auto;
`;

const IntroSection = styled.section`
	margin-bottom: 32px;
`;

const IntroText = styled.p`
	font-size: 16px;
	color: var(--text-secondary);
	max-width: 800px;
	margin: 0;
`;

const Section = styled.section`
	margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
	font-size: 24px;
	font-weight: 600;
	margin-bottom: 16px;
	color: var(--text-primary);
`;

const LogoGrid = styled(Row)``;

const LogoCard = styled(Card)`
	height: 100%;
	display: flex;
	flex-direction: column;

	.ant-card-body {
		padding: 0;
		display: flex;
		flex-direction: column;
		height: 100%;
	}
`;

const PreviewArea = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 200px;
	padding: 32px;
	border-bottom: 1px solid var(--color-gray-200);
	border-radius: 8px 8px 0 0;

	img {
		max-width: 100%;
		height: auto;
	}
`;

const LogoInfo = styled.div`
	padding: 16px;
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const LogoName = styled.div`
	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary);
`;

const LogoDimensions = styled.div`
	font-size: 12px;
	color: var(--text-secondary);
	font-family: monospace;
`;

const DownloadButtons = styled.div`
	display: flex;
	gap: 8px;
	margin-top: auto;
	flex-wrap: wrap;
`;

const PaletteGrid = styled(Row)``;

const PaletteTitle = styled.h3`
	font-size: 18px;
	font-weight: 600;
	margin-bottom: 8px;
	color: var(--text-primary);
`;

const PaletteDescription = styled.p`
	font-size: 14px;
	color: var(--text-secondary);
	margin-bottom: 16px;
`;

const ColorSwatches = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const ColorSwatchContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
`;

const SwatchPreview = styled.div`
	width: 60px;
	height: 60px;
	min-width: 60px;
	border-radius: 8px;
	border: 2px solid var(--color-gray-200);
	box-shadow: 0 2px 8px color-mix(in srgb, var(--color-black) 10%, transparent);
`;

const SwatchInfo = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const ColorName = styled.div`
	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 4px;
`;

const ColorValues = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

const ColorValue = styled.div`
	font-size: 12px;
	color: var(--text-secondary);
	font-family: monospace;
	cursor: pointer;
	padding: 4px 8px;
	border-radius: 4px;
	transition: all 0.2s ease;
	display: inline-flex;
	align-items: center;
	width: fit-content;

	&:hover {
		background-color: var(--color-gray-100);
		color: var(--brand-primary);
	}

	.anticon {
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	&:hover .anticon {
		opacity: 1;
	}
`;

const GuidelinesList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const GuidelineItem = styled.li`
	font-size: 14px;
	color: var(--text-primary);
	padding-left: 16px;
	position: relative;

	&::before {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--brand-primary);
		font-weight: bold;
	}

	strong {
		color: var(--brand-primary);
		font-weight: 600;
	}
`;

export default BrandTab;
