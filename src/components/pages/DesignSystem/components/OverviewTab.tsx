/**
 * Design System Overview Tab
 *
 * Dashboard-style summary showing design system health, statistics,
 * quick navigation, and current theme preview.
 *
 * @module DesignSystem/components/OverviewTab
 */

import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Badge, Alert, Button } from 'antd';
import {
	BgColorsOutlined,
	ColumnWidthOutlined,
	FontSizeOutlined,
	SkinOutlined,
	BuildOutlined,
	AppstoreOutlined,
	ExportOutlined,
	ImportOutlined,
	ReloadOutlined,
	CheckCircleOutlined,
	WarningOutlined,
	CloseCircleOutlined} from '@ant-design/icons';
import styled from 'styled-components';
import type { Theme } from '../types';
import {getTokenValue, checkContrastRatio, _getModifiedTokens } from '../utils/tokenHelpers';

/**
 * Props interface for OverviewTab component
 */
interface OverviewTabProps {
	/** Currently active theme */
	currentTheme: Theme;
	/** Set of modified token names */
	modifiedTokens: Set<string>;
	/** Navigation callback to switch tabs and optionally jump to category */
	onNavigate: (tabKey: string, categoryId?: string) => void;
}

/**
 * Contrast check result
 */
interface ContrastResult {
	combination: string;
	ratio: number | null;
	level: 'AAA' | 'AA' | 'fail';
}

/**
 * Quick link configuration
 */
interface QuickLink {
	id: string;
	label: string;
	icon: React.ReactNode;
	description: string;
	tabKey: string;
	categoryId?: string;
}

/**
 * Theme description mapping
 */
const THEME_DESCRIPTIONS: Record<Theme, string> = {
	default: 'Professional medical-focused aesthetic with purple brand colors',
	vibrant: 'Energetic design with vibrant orange accents',
	dark: 'Modern dark mode with lime-green highlights',
	light: 'Clean and minimal light theme',
};

/**
 * OverviewTab Component
 *
 * Displays a comprehensive dashboard with:
 * - Hero section with theme info and statistics
 * - Token health metrics (WCAG compliance)
 * - Quick navigation grid
 * - Current theme preview
 */
export const OverviewTab: React.FC<OverviewTabProps> = ({
	currentTheme,
	modifiedTokens,
	onNavigate,
}) => {
	/**
	 * Calculate token statistics
	 */
	const tokenStats = useMemo(() => {
		// Get all CSS variables from document root
		const computedStyles = getComputedStyle(document.documentElement);
		const allTokens: string[] = [];

		// Parse all CSS custom properties
		for (let i = 0; i < computedStyles.length; i++) {
			const prop = computedStyles[i];
			if (prop.startsWith('--')) {
				allTokens.push(prop);
			}
		}

		// Count tokens by category (simple heuristic)
		const colorTokens = allTokens.filter(
			t =>
				t.includes('color') ||
				t.includes('purple') ||
				t.includes('orange') ||
				t.includes('lime') ||
				t.includes('gray') ||
				t.includes('brand') ||
				t.includes('bg-') ||
				t.includes('text-')
		).length;

		const spacingTokens = allTokens.filter(
			t => t.includes('spacing') || t.includes('space')
		).length;

		const typographyTokens = allTokens.filter(
			t => t.includes('font') || t.includes('line-height') || t.includes('letter-spacing')
		).length;

		const shadowTokens = allTokens.filter(t => t.includes('shadow')).length;

		return {
			total: allTokens.length,
			colors: colorTokens,
			spacing: spacingTokens,
			typography: typographyTokens,
			shadows: shadowTokens,
			modified: modifiedTokens.size,
		};
	}, [modifiedTokens]);

	/**
	 * Calculate WCAG contrast compliance
	 */
	const contrastHealth = useMemo(() => {
		const bgPrimary = getTokenValue('--bg-primary');
		const textPrimary = getTokenValue('--text-primary');
		const textSecondary = getTokenValue('--text-secondary');
		const brandPrimary = getTokenValue('--brand-primary');

		const checks: ContrastResult[] = [
			{
				combination: 'Primary text on primary background',
				ratio: checkContrastRatio(textPrimary, bgPrimary),
				level: 'fail',
			},
			{
				combination: 'Secondary text on primary background',
				ratio: checkContrastRatio(textSecondary, bgPrimary),
				level: 'fail',
			},
			{
				combination: 'Brand primary on primary background',
				ratio: checkContrastRatio(brandPrimary, bgPrimary),
				level: 'fail',
			},
		];

		// Determine compliance level based on ratio
		checks.forEach(check => {
			if (check.ratio) {
				if (check.ratio >= 7) {
					check.level = 'AAA';
				} else if (check.ratio >= 4.5) {
					check.level = 'AA';
				}
			}
		});

		const aaCount = checks.filter(c => c.level === 'AA' || c.level === 'AAA').length;
		const aaaCount = checks.filter(c => c.level === 'AAA').length;
		const failCount = checks.filter(c => c.level === 'fail').length;

		return {
			checks,
			aaCount,
			aaaCount,
			failCount,
			totalChecks: checks.length,
		};
	}, []);

	/**
	 * Quick navigation links
	 */
	const quickLinks: QuickLink[] = [
		{
			id: 'colors',
			label: 'Color Tokens',
			icon: <BgColorsOutlined />,
			description: 'Browse and customize color palette',
			tabKey: 'tokens',
			categoryId: 'colors',
		},
		{
			id: 'spacing',
			label: 'Spacing',
			icon: <ColumnWidthOutlined />,
			description: 'Layout spacing and sizing',
			tabKey: 'tokens',
			categoryId: 'spacing',
		},
		{
			id: 'typography',
			label: 'Typography',
			icon: <FontSizeOutlined />,
			description: 'Font styles and text properties',
			tabKey: 'tokens',
			categoryId: 'typography',
		},
		{
			id: 'shadows',
			label: 'Shadows',
			icon: <SkinOutlined />,
			description: 'Elevation and depth effects',
			tabKey: 'tokens',
			categoryId: 'shadows',
		},
		{
			id: 'custom',
			label: 'Custom Components',
			icon: <BuildOutlined />,
			description: 'VitalFlow custom UI components',
			tabKey: 'components',
			categoryId: 'custom',
		},
		{
			id: 'antd',
			label: 'Ant Design',
			icon: <AppstoreOutlined />,
			description: 'Ant Design component showcase',
			tabKey: 'components',
			categoryId: 'antd',
		},
		{
			id: 'export',
			label: 'Export Theme',
			icon: <ExportOutlined />,
			description: 'Download customizations',
			tabKey: 'export',
		},
		{
			id: 'import',
			label: 'Import Theme',
			icon: <ImportOutlined />,
			description: 'Load saved theme',
			tabKey: 'export',
		},
		{
			id: 'reset',
			label: 'Reset Theme',
			icon: <ReloadOutlined />,
			description: 'Restore default values',
			tabKey: 'themes',
		},
	];

	/**
	 * Brand colors for preview
	 */
	const brandColors = useMemo(
		() => [
			{ name: 'Primary', token: '--brand-primary' },
			{ name: 'Secondary', token: '--brand-secondary' },
			{ name: 'Tertiary', token: '--brand-tertiary' },
			{ name: 'Success', token: '--color-success-600' },
			{ name: 'Error', token: '--color-error-600' },
		],
		[]
	);

	return (
		<Container>
			{/* Hero Section */}
			<HeroSection>
				<HeroContent>
					<ThemeName>{currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Theme</ThemeName>
					<ThemeDescription>{THEME_DESCRIPTIONS[currentTheme]}</ThemeDescription>

					<StatisticsRow gutter={[24, 24]}>
						<Col xs={24} sm={8}>
							<Statistic
								title="Design Tokens"
								value={tokenStats.total}
								prefix={<BgColorsOutlined />}
								valueStyle={{ color: 'var(--brand-primary)' }}
							/>
						</Col>
						<Col xs={24} sm={8}>
							<Statistic
								title="Themes"
								value={4}
								valueStyle={{ color: 'var(--brand-secondary)' }}
							/>
						</Col>
						<Col xs={24} sm={8}>
							<Statistic
								title="Components"
								value="45+"
								valueStyle={{ color: 'var(--brand-tertiary)' }}
							/>
						</Col>
					</StatisticsRow>
				</HeroContent>
			</HeroSection>

			{/* Token Health Section */}
			<Section>
				<SectionTitle>Token Health</SectionTitle>
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={12}>
						<Card>
							<CardTitle>WCAG Contrast Compliance</CardTitle>
							<HealthStats>
								<HealthStat>
									<CheckCircleOutlined style={{ color: 'var(--color-success-600)' }} />
									<span>
										AA Compliant: <strong>{contrastHealth.aaCount}</strong> /{' '}
										{contrastHealth.totalChecks}
									</span>
								</HealthStat>
								<HealthStat>
									<CheckCircleOutlined style={{ color: 'var(--color-success-700)' }} />
									<span>
										AAA Compliant: <strong>{contrastHealth.aaaCount}</strong> /{' '}
										{contrastHealth.totalChecks}
									</span>
								</HealthStat>
								{contrastHealth.failCount > 0 && (
									<HealthStat>
										<WarningOutlined style={{ color: 'var(--color-warning-600)' }} />
										<span>
											Warnings: <strong>{contrastHealth.failCount}</strong> combinations
										</span>
									</HealthStat>
								)}
							</HealthStats>

							{contrastHealth.failCount > 0 && (
								<Alert
									message="Contrast Warnings"
									description={
										<div>
											{contrastHealth.checks
												.filter(c => c.level === 'fail')
												.map((check, idx) => (
													<div key={idx}>
														<CloseCircleOutlined style={{ marginRight: 8 }} />
														{check.combination}:{' '}
														{check.ratio ? `${check.ratio.toFixed(2)}:1` : 'N/A'}
													</div>
												))}
										</div>
									}
									type="warning"
									showIcon
									style={{ marginTop: 16 }}
								/>
							)}
						</Card>
					</Col>

					<Col xs={24} lg={12}>
						<Card>
							<CardTitle>Token Categories</CardTitle>
							<CategoryStats>
								<CategoryStat>
									<span>Colors</span>
									<Badge count={tokenStats.colors} style={{ backgroundColor: 'var(--brand-primary)' }} />
								</CategoryStat>
								<CategoryStat>
									<span>Spacing</span>
									<Badge count={tokenStats.spacing} style={{ backgroundColor: 'var(--brand-secondary)' }} />
								</CategoryStat>
								<CategoryStat>
									<span>Typography</span>
									<Badge count={tokenStats.typography} style={{ backgroundColor: 'var(--brand-tertiary)' }} />
								</CategoryStat>
								<CategoryStat>
									<span>Shadows</span>
									<Badge count={tokenStats.shadows} style={{ backgroundColor: 'var(--color-success-600)' }} />
								</CategoryStat>
							</CategoryStats>

							{tokenStats.modified > 0 && (
								<Alert
									message={`${tokenStats.modified} token${tokenStats.modified > 1 ? 's' : ''} modified`}
									description="Your customizations are saved in this session"
									type="info"
									showIcon
									style={{ marginTop: 16 }}
								/>
							)}
						</Card>
					</Col>
				</Row>
			</Section>

			{/* Quick Links Grid */}
			<Section>
				<SectionTitle>Quick Navigation</SectionTitle>
				<QuickLinksGrid gutter={[16, 16]}>
					{quickLinks.map(link => (
						<Col xs={24} sm={12} md={8} key={link.id}>
							<QuickLinkCard
								hoverable
								onClick={() => onNavigate(link.tabKey, link.categoryId)}
							>
								<QuickLinkIcon>{link.icon}</QuickLinkIcon>
								<QuickLinkLabel>{link.label}</QuickLinkLabel>
								<QuickLinkDescription>{link.description}</QuickLinkDescription>
							</QuickLinkCard>
						</Col>
					))}
				</QuickLinksGrid>
			</Section>

			{/* Current Theme Preview */}
			<Section>
				<SectionTitle>Current Theme Preview</SectionTitle>
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={12}>
						<Card title="Brand Colors">
							<ColorSwatchGrid>
								{brandColors.map(color => {
									const value = getTokenValue(color.token);
									return (
										<ColorSwatchItem key={color.token}>
											<ColorSwatch style={{ backgroundColor: value }} />
											<ColorName>{color.name}</ColorName>
											<ColorValue>{value}</ColorValue>
										</ColorSwatchItem>
									);
								})}
							</ColorSwatchGrid>
						</Card>
					</Col>

					<Col xs={24} lg={12}>
						<Card title="Typography Sample">
							<TypographySample>
								<h1 style={{ margin: 0, marginBottom: 8 }}>Heading 1</h1>
								<h2 style={{ margin: 0, marginBottom: 8 }}>Heading 2</h2>
								<h3 style={{ margin: 0, marginBottom: 16 }}>Heading 3</h3>
								<p style={{ margin: 0, marginBottom: 8 }}>
									This is a paragraph of body text using the default typography styles from the design
									system. It demonstrates font size, line height, and color.
								</p>
								<small style={{ color: 'var(--text-secondary)' }}>
									Secondary text color for less prominent content.
								</small>
							</TypographySample>
						</Card>
					</Col>
				</Row>

				<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
					<Col xs={24}>
						<Card title="UI Elements Sample">
							<SampleUIElements>
								<Button type="primary" style={{ marginRight: 8 }}>
									Primary Button
								</Button>
								<Button style={{ marginRight: 8 }}>Default Button</Button>
								<Button type="dashed" style={{ marginRight: 8 }}>
									Dashed Button
								</Button>
								<Button type="link">Link Button</Button>
							</SampleUIElements>
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

const HeroSection = styled.div`
	background: linear-gradient(
		135deg,
		var(--brand-primary) 0%,
		var(--brand-secondary) 100%
	);
	border-radius: 12px;
	padding: 48px 32px;
	margin-bottom: 32px;
	color: var(--text-on-dark) /* TODO: Verify context */;
`;

const HeroContent = styled.div`
	max-width: 800px;
`;

const ThemeName = styled.h1`
	font-size: 36px;
	font-weight: 700;
	margin: 0 0 8px 0;
	color: var(--text-on-dark) /* TODO: Verify context */;
`;

const ThemeDescription = styled.p`
	font-size: 16px;
	margin: 0 0 32px 0;
	color: rgba(255, 255, 255, 0.9);
`;

const StatisticsRow = styled(Row)`
	.ant-statistic-title {
		color: rgba(255, 255, 255, 0.85);
	}

	.ant-statistic-content {
		color: var(--text-on-dark) /* TODO: Verify context */;
	}
`;

const Section = styled.section`
	margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
	font-size: 24px;
	font-weight: 600;
	margin-bottom: 16px;
	color: var(--text-primary);
`;

const CardTitle = styled.h3`
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 16px;
	color: var(--text-primary);
`;

const HealthStats = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const HealthStat = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	font-size: 14px;
	color: var(--text-primary);

	.anticon {
		font-size: 18px;
	}
`;

const CategoryStats = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const CategoryStat = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 14px;
	color: var(--text-primary);
`;

const QuickLinksGrid = styled(Row)``;

const QuickLinkCard = styled(Card)`
	text-align: center;
	transition: all 0.3s ease;
	cursor: pointer;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
		border-color: var(--brand-primary);
	}
`;

const QuickLinkIcon = styled.div`
	font-size: 32px;
	color: var(--brand-primary);
	margin-bottom: 12px;

	.anticon {
		font-size: 32px;
	}
`;

const QuickLinkLabel = styled.div`
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 4px;
	color: var(--text-primary);
`;

const QuickLinkDescription = styled.div`
	font-size: 12px;
	color: var(--text-secondary);
`;

const ColorSwatchGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
`;

const ColorSwatchItem = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	min-width: 80px;
`;

const ColorSwatch = styled.div`
	width: 60px;
	height: 60px;
	border-radius: 8px;
	border: 2px solid var(--color-gray-200);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ColorName = styled.div`
	font-size: 12px;
	font-weight: 600;
	color: var(--text-primary);
`;

const ColorValue = styled.div`
	font-size: 11px;
	color: var(--text-secondary);
	font-family: monospace;
`;

const TypographySample = styled.div`
	color: var(--text-primary);

	h1 {
		color: var(--text-primary);
	}

	h2 {
		color: var(--text-primary);
	}

	h3 {
		color: var(--text-primary);
	}
`;

const SampleUIElements = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	align-items: center;
`;
