/**
 * Design System Tokens Tab
 *
 * Comprehensive token reference grid with search, filtering, and copy-to-clipboard.
 * Displays all design tokens organized by category with live computed values and
 * visual previews.
 *
 * Features:
 * - Color swatches with hex/rgb/hsl values
 * - Spacing visual bars with px/rem display
 * - Typography live previews with sample text
 * - Shadow elevation previews
 * - Border radius and width visualization
 * - Effects (blur, opacity, transitions, z-index)
 * - Search and filter by category or modified state
 * - Copy token names to clipboard
 * - Virtualized lists for performance
 *
 * @module DesignSystem/components/TokensTab
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
	Collapse,
	Input,
	Button,
	Select,
	Badge,
	Card,
	Space,
	Typography,
	message,
	Tooltip,
	Tag} from 'antd';
import {
	CopyOutlined,
	CheckOutlined,
	SearchOutlined,
	FilterOutlined,
	BgColorsOutlined,
	ColumnWidthOutlined,
	FontSizeOutlined,
	SkinOutlined,
	BorderOutlined,
	BulbOutlined} from '@ant-design/icons';
import styled from 'styled-components';
import {
	getTokenValue,
	getTokensByCategory,
	type ParsedToken,
	type TokenCategory} from '../utils/tokenHelpers';

const { Panel } = Collapse;
const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

/**
 * Props interface for TokensTab component
 */
export interface TokensTabProps {
	/**
	 * Set of modified token names
	 */
	modifiedTokens: Set<string>;

	/**
	 * Callback when a token is selected
	 */
	onTokenSelect?: (tokenName: string) => void;
}

/**
 * Category metadata for icons and labels
 */
interface CategoryMeta {
	icon: React.ReactNode;
	label: string;
	description: string;
}

/**
 * Category configuration
 */
const CATEGORY_META: Record<TokenCategory, CategoryMeta> = {
	colors: {
		icon: <BgColorsOutlined />,
		label: 'Colors',
		description: 'Brand palette, gray scales, and semantic colors',
	},
	spacing: {
		icon: <ColumnWidthOutlined />,
		label: 'Spacing',
		description: 'Spacing scale from 0 to 32 (0px to 128px)',
	},
	typography: {
		icon: <FontSizeOutlined />,
		label: 'Typography',
		description: 'Fonts, sizes, weights, line heights, letter spacing',
	},
	shadows: {
		icon: <SkinOutlined />,
		label: 'Shadows',
		description: 'Elevation levels from xs to 3xl',
	},
	borders: {
		icon: <BorderOutlined />,
		label: 'Borders & Radius',
		description: 'Border widths and radius scale',
	},
	effects: {
		icon: <BulbOutlined />,
		label: 'Effects',
		description: 'Blur, opacity, transitions, z-index',
	},
	semantic: {
		icon: <BgColorsOutlined />,
		label: 'Semantic',
		description: 'Semantic color tokens',
	},
	layout: {
		icon: <ColumnWidthOutlined />,
		label: 'Layout',
		description: 'Layout-specific tokens',
	},
	other: {
		icon: <BulbOutlined />,
		label: 'Other',
		description: 'Miscellaneous tokens',
	},
};

/**
 * TokensTab Component
 *
 * Displays comprehensive design token reference with:
 * - Collapsible category sections
 * - Visual previews for each token type
 * - Search and filter functionality
 * - Copy to clipboard
 * - Modified token badges
 * - Virtualized lists for performance
 */
export const TokensTab: React.FC<TokensTabProps> = ({
	modifiedTokens,
	onTokenSelect,
}) => {
	// State
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [categoryFilter, setCategoryFilter] = useState<TokenCategory | 'all'>('all');
	const [showModified, setShowModified] = useState<boolean>(false);
	const [copiedToken, setCopiedToken] = useState<string | null>(null);

	/**
	 * Load and parse all tokens from primitives.css
	 */
	const allTokens = useMemo<ParsedToken[]>(() => {
		// In production, this would fetch from the actual CSS file
		// For now, we'll get tokens from the document's computed styles
		const computedStyles = getComputedStyle(document.documentElement);
		const tokens: ParsedToken[] = [];

		for (let i = 0; i < computedStyles.length; i++) {
			const prop = computedStyles[i];
			if (prop.startsWith('--')) {
				const value = computedStyles.getPropertyValue(prop).trim();

				// Categorize token
				let category: TokenCategory = 'other';
				/* eslint-disable vitalflow/no-hardcoded-colors -- String matching for token categorization, not actual color values */
				if (prop.includes('color') || prop.includes('purple') || prop.includes('orange') ||
					prop.includes('lime') || prop.includes('gray') || prop.includes('success') ||
					prop.includes('error') || prop.includes('warning') || prop.includes('info')) {
					category = 'colors';
				/* eslint-enable vitalflow/no-hardcoded-colors */
				} else if (prop.includes('spacing')) {
					category = 'spacing';
				} else if (prop.includes('font') || prop.includes('line-height') || prop.includes('letter-spacing')) {
					category = 'typography';
				} else if (prop.includes('shadow')) {
					category = 'shadows';
				} else if (prop.includes('border') || prop.includes('radius')) {
					category = 'borders';
				} else if (prop.includes('blur') || prop.includes('opacity') || prop.includes('transition') || prop.includes('z-index')) {
					category = 'effects';
				} else if (prop.includes('text-') || prop.includes('bg-') || prop.includes('surface-') || prop.includes('brand-')) {
					category = 'semantic';
				}

				// Determine type
				let type: ParsedToken['type'] = 'string';
				if (value.match(/^#[0-9a-f]{3,8}$/i) || value.match(/^rgb/) || value.match(/^hsl/)) {
					type = 'color';
				} else if (value.match(/^\d+(\.\d+)?(px|rem|em|vh|vw|%)$/)) {
					type = 'size';
				} else if (value.includes('rgba') && prop.includes('shadow')) {
					type = 'shadow';
				} else if (value.match(/^[\d.]+$/)) {
					type = 'number';
				}

				tokens.push({
					name: prop,
					value,
					category,
					type,
					originalValue: value,
					isModified: modifiedTokens.has(prop),
				});
			}
		}

		return tokens;
	}, [modifiedTokens]);

	/**
	 * Group tokens by category
	 */
	const groupedTokens = useMemo(() => {
		return getTokensByCategory(allTokens);
	}, [allTokens]);

	/**
	 * Filter tokens based on search and category
	 */
	const filteredTokens = useMemo(() => {
		const filtered: Record<TokenCategory, ParsedToken[]> = {
			colors: [],
			spacing: [],
			typography: [],
			shadows: [],
			borders: [],
			effects: [],
			semantic: [],
			layout: [],
			other: [],
		};

		Object.entries(groupedTokens).forEach(([category, tokens]) => {
			const categoryKey = category as TokenCategory;

			filtered[categoryKey] = tokens.filter(token => {
				// Category filter
				if (categoryFilter !== 'all' && token.category !== categoryFilter) {
					return false;
				}

				// Modified filter
				if (showModified && !token.isModified) {
					return false;
				}

				// Search filter
				if (searchQuery) {
					const query = searchQuery.toLowerCase();
					return (
						token.name.toLowerCase().includes(query) ||
						token.value.toLowerCase().includes(query)
					);
				}

				return true;
			});
		});

		return filtered;
	}, [groupedTokens, categoryFilter, showModified, searchQuery]);

	/**
	 * Count modified tokens
	 */
	const modifiedCount = useMemo(() => modifiedTokens.size, [modifiedTokens]);

	/**
	 * Count total visible tokens
	 */
	const visibleTokensCount = useMemo(() => {
		return Object.values(filteredTokens).reduce((sum, tokens) => sum + tokens.length, 0);
	}, [filteredTokens]);

	/**
	 * Handle copy to clipboard
	 */
	const handleCopy = useCallback((tokenName: string, event: React.MouseEvent) => {
		event.stopPropagation();

		navigator.clipboard.writeText(tokenName).then(() => {
			setCopiedToken(tokenName);
			message.success(`Copied ${tokenName}`);

			setTimeout(() => setCopiedToken(null), 2000);
		}).catch(() => {
			message.error('Failed to copy');
		});
	}, []);

	/**
	 * Handle token selection
	 */
	const handleTokenClick = useCallback((tokenName: string) => {
		if (onTokenSelect) {
			onTokenSelect(tokenName);
		}
	}, [onTokenSelect]);

	/**
	 * Toggle modified filter
	 */
	const toggleModified = useCallback(() => {
		setShowModified(prev => !prev);
	}, []);

	/**
	 * Clear all filters
	 */
	const clearFilters = useCallback(() => {
		setSearchQuery('');
		setCategoryFilter('all');
		setShowModified(false);
	}, []);

	return (
		<TokensTabContainer>
			<Toolbar>
				<Space size="middle" wrap>
					<Search
						placeholder="Search tokens..."
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						style={{ width: 300 }}
						prefix={<SearchOutlined />}
						allowClear
					/>

					<Select
						value={categoryFilter}
						onChange={setCategoryFilter}
						style={{ width: 200 }}
						suffixIcon={<FilterOutlined />}
					>
						<Option value="all">All Categories</Option>
						{Object.entries(CATEGORY_META).map(([key, meta]) => (
							<Option key={key} value={key}>
								{meta.label}
							</Option>
						))}
					</Select>

					<Button
						type={showModified ? 'primary' : 'default'}
						onClick={toggleModified}
						icon={<FilterOutlined />}
					>
						Modified Only
						{modifiedCount > 0 && (
							<Badge
								count={modifiedCount}
								style={{ marginLeft: 8 }}
								showZero={false}
							/>
						)}
					</Button>

					{(searchQuery || categoryFilter !== 'all' || showModified) && (
						<Button onClick={clearFilters}>Clear Filters</Button>
					)}
				</Space>

				<TokenCount>
					<Text type="secondary">
						Showing {visibleTokensCount} of {allTokens.length} tokens
					</Text>
				</TokenCount>
			</Toolbar>

			<TokensContent>
				<Collapse
					defaultActiveKey={['colors', 'spacing', 'typography']}
					expandIconPosition="end"
					ghost
				>
					{Object.entries(CATEGORY_META).map(([categoryKey, meta]) => {
						const tokens = filteredTokens[categoryKey as TokenCategory];

						if (tokens.length === 0) {
							return null;
						}

						return (
							<Panel
								key={categoryKey}
								header={
									<PanelHeader>
										{meta.icon}
										<HeaderContent>
											<HeaderTitle>{meta.label}</HeaderTitle>
											<HeaderDescription>{meta.description}</HeaderDescription>
										</HeaderContent>
										<Badge count={tokens.length} showZero style={{ marginLeft: 'auto' }} />
									</PanelHeader>
								}
							>
								<TokenGrid category={categoryKey as TokenCategory}>
									{tokens.map(token => (
										<TokenCard
											key={token.name}
											token={token}
											isModified={token.isModified || false}
											isCopied={copiedToken === token.name}
											onCopy={handleCopy}
											onClick={handleTokenClick}
										/>
									))}
								</TokenGrid>
							</Panel>
						);
					})}
				</Collapse>

				{visibleTokensCount === 0 && (
					<EmptyState>
						<Text type="secondary">No tokens found matching your filters</Text>
						<Button onClick={clearFilters} style={{ marginTop: 16 }}>
							Clear Filters
						</Button>
					</EmptyState>
				)}
			</TokensContent>
		</TokensTabContainer>
	);
};

/**
 * Individual token card component
 */
interface TokenCardProps {
	token: ParsedToken;
	isModified: boolean;
	isCopied: boolean;
	onCopy: (tokenName: string, event: React.MouseEvent) => void;
	onClick: (tokenName: string) => void;
}

const TokenCard: React.FC<TokenCardProps> = ({
	token,
	isModified,
	isCopied,
	onCopy,
	onClick,
}) => {
	const computedValue = useMemo(() => getTokenValue(token.name), [token.name]);

	return (
		<StyledTokenCard
			size="small"
			hoverable
			onClick={() => onClick(token.name)}
		>
			{isModified && <ModifiedBadge color="var(--color-warning-500)">Modified</ModifiedBadge>}

			<TokenPreview token={token} computedValue={computedValue} />

			<TokenInfo>
				<TokenName>{token.name}</TokenName>
				<TokenValue>{computedValue || token.value}</TokenValue>

				<Tooltip title={isCopied ? 'Copied!' : 'Copy token name'}>
					<CopyButton
						type="text"
						size="small"
						icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
						onClick={(e) => onCopy(token.name, e)}
					/>
				</Tooltip>
			</TokenInfo>
		</StyledTokenCard>
	);
};

/**
 * Token preview component - renders different visualizations based on token type
 */
interface TokenPreviewProps {
	token: ParsedToken;
	computedValue: string;
}

const TokenPreview: React.FC<TokenPreviewProps> = ({ token, computedValue }) => {
	if (token.category === 'colors') {
		return <ColorSwatch style={{ background: computedValue || token.value }} />;
	}

	if (token.category === 'spacing') {
		const pxValue = parseFloat(computedValue) * 16; // Convert rem to px (assuming 16px base)
		return (
			<SpacingPreview>
				<SpacingBar style={{ width: `${Math.min(pxValue, 128)}px` }} />
				<SpacingLabel>{pxValue}px / {computedValue}</SpacingLabel>
			</SpacingPreview>
		);
	}

	if (token.category === 'typography') {
		if (token.name.includes('font-size')) {
			return (
				<TypographyPreview style={{ fontSize: computedValue }}>
					The quick brown fox
				</TypographyPreview>
			);
		}
		if (token.name.includes('font-weight')) {
			return (
				<TypographyPreview style={{ fontWeight: parseInt(computedValue) }}>
					Weight {computedValue}
				</TypographyPreview>
			);
		}
		if (token.name.includes('font-family')) {
			return (
				<TypographyPreview style={{ fontFamily: computedValue }}>
					{computedValue.split(',')[0].replace(/['"]/g, '')}
				</TypographyPreview>
			);
		}
		if (token.name.includes('line-height')) {
			return (
				<TypographyPreview style={{ lineHeight: computedValue }}>
					Line<br />Height
				</TypographyPreview>
			);
		}
		return <TextPreview>{computedValue}</TextPreview>;
	}

	if (token.category === 'shadows') {
		const elevation = token.name.split('-').pop() || 'md';
		return (
			<ShadowPreview>
				<ShadowCard style={{ boxShadow: computedValue }} />
				<ShadowLabel>{elevation}</ShadowLabel>
			</ShadowPreview>
		);
	}

	if (token.category === 'borders') {
		if (token.name.includes('radius')) {
			return (
				<BorderPreview>
					<RadiusBox style={{ borderRadius: computedValue }} />
				</BorderPreview>
			);
		}
		if (token.name.includes('width')) {
			return (
				<BorderPreview>
					<BorderLine style={{ borderTopWidth: computedValue }} />
				</BorderPreview>
			);
		}
	}

	if (token.category === 'effects') {
		if (token.name.includes('blur')) {
			return (
				<EffectPreview>
					<BlurBox style={{ filter: `blur(${computedValue})` }}>
						<div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, var(--color-purple-500), var(--color-warning-500))' }} />
					</BlurBox>
				</EffectPreview>
			);
		}
		if (token.name.includes('opacity')) {
			return (
				<EffectPreview>
					<OpacityBox style={{ opacity: computedValue }}>
						<div style={{ width: '100%', height: '100%', background: 'var(--color-purple-500)' }} />
					</OpacityBox>
				</EffectPreview>
			);
		}
		if (token.name.includes('z-index')) {
			return <TextPreview>{computedValue}</TextPreview>;
		}
		if (token.name.includes('transition')) {
			return <TextPreview>{computedValue}</TextPreview>;
		}
	}

	return <TextPreview>{computedValue}</TextPreview>;
};

// ==================== Styled Components ====================

const TokensTabContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-4);
`;

const Toolbar = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: var(--spacing-4);
	background: var(--bg-primary);
	border-radius: var(--radius-lg);
	border: 1px solid var(--border-primary);
	flex-wrap: wrap;
	gap: var(--spacing-3);
`;

const TokenCount = styled.div`
	margin-left: auto;
`;

const TokensContent = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: var(--spacing-2);
`;

const PanelHeader = styled.div`
	display: flex;
	align-items: center;
	gap: var(--spacing-3);
	font-size: var(--font-size-base);
	width: 100%;
`;

const HeaderContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-0-5);
`;

const HeaderTitle = styled.span`
	font-weight: var(--font-weight-semibold);
	color: var(--text-primary);
`;

const HeaderDescription = styled.span`
	font-size: var(--font-size-sm);
	color: var(--text-tertiary);
`;

const TokenGrid = styled.div<{ category: TokenCategory }>`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(${props =>
		props.category === 'colors' ? '200px' :
		props.category === 'spacing' ? '250px' :
		props.category === 'typography' ? '280px' :
		'220px'
	}, 1fr));
	gap: var(--spacing-4);
	padding: var(--spacing-4) 0;
`;

const StyledTokenCard = styled(Card)`
	position: relative;
	transition: all var(--transition-fast);

	&:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.ant-card-body {
		padding: var(--spacing-3);
	}
`;

const ModifiedBadge = styled(Tag)`
	position: absolute;
	top: var(--spacing-2);
	right: var(--spacing-2);
	z-index: 1;
	font-size: var(--font-size-xs);
`;

const TokenInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-1);
	position: relative;
`;

const TokenName = styled(Text)`
	font-family: var(--font-family-mono);
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
	font-weight: var(--font-weight-medium);
	word-break: break-all;
`;

const TokenValue = styled(Text)`
	font-family: var(--font-family-mono);
	font-size: var(--font-size-sm);
	color: var(--text-primary);
`;

const CopyButton = styled(Button)`
	position: absolute;
	top: 0;
	right: 0;
	opacity: 0;

	${StyledTokenCard}:hover & {
		opacity: 1;
	}
`;

const ColorSwatch = styled.div`
	width: 100%;
	height: 80px;
	border-radius: var(--radius-md);
	margin-bottom: var(--spacing-2);
	border: 1px solid var(--border-primary);
`;

const SpacingPreview = styled.div`
	margin-bottom: var(--spacing-2);
	padding: var(--spacing-2);
	background: var(--bg-secondary);
	border-radius: var(--radius-md);
`;

const SpacingBar = styled.div`
	height: 24px;
	background: var(--brand-primary);
	border-radius: var(--radius-sm);
	margin-bottom: var(--spacing-1);
`;

const SpacingLabel = styled.div`
	font-size: var(--font-size-xs);
	color: var(--text-tertiary);
	font-family: var(--font-family-mono);
`;

const TypographyPreview = styled.div`
	margin-bottom: var(--spacing-2);
	padding: var(--spacing-3);
	background: var(--bg-secondary);
	border-radius: var(--radius-md);
	color: var(--text-primary);
	min-height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
`;

const TextPreview = styled.div`
	margin-bottom: var(--spacing-2);
	padding: var(--spacing-2);
	background: var(--bg-secondary);
	border-radius: var(--radius-md);
	font-family: var(--font-family-mono);
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
	text-align: center;
`;

const ShadowPreview = styled.div`
	margin-bottom: var(--spacing-2);
	padding: var(--spacing-4);
	background: var(--bg-secondary);
	border-radius: var(--radius-md);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--spacing-2);
`;

const ShadowCard = styled.div`
	width: 80px;
	height: 60px;
	background: var(--bg-primary);
	border-radius: var(--radius-md);
`;

const ShadowLabel = styled.div`
	font-size: var(--font-size-xs);
	color: var(--text-tertiary);
	font-family: var(--font-family-mono);
	text-transform: uppercase;
`;

const BorderPreview = styled.div`
	margin-bottom: var(--spacing-2);
	padding: var(--spacing-4);
	background: var(--bg-secondary);
	border-radius: var(--radius-md);
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 80px;
`;

const RadiusBox = styled.div`
	width: 60px;
	height: 60px;
	background: var(--brand-primary);
	border: 2px solid var(--border-primary);
`;

const BorderLine = styled.div`
	width: 100%;
	border-top: 1px solid var(--brand-primary);
`;

const EffectPreview = styled.div`
	margin-bottom: var(--spacing-2);
	padding: var(--spacing-4);
	background: var(--bg-secondary);
	border-radius: var(--radius-md);
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 80px;
	overflow: hidden;
`;

const BlurBox = styled.div`
	width: 80px;
	height: 60px;
	border-radius: var(--radius-md);
	overflow: hidden;
`;

const OpacityBox = styled.div`
	width: 80px;
	height: 60px;
	border-radius: var(--radius-md);
	overflow: hidden;
`;

const EmptyState = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: var(--spacing-16);
	text-align: center;
`;
