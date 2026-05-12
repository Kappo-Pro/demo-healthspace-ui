import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
	Select,
	Collapse,
	ColorPicker,
	Button,
	Input,
	Space,
	Typography,
	Badge,
	Modal,
	message} from 'antd';
import {
	CheckOutlined,
	CopyOutlined,
	ShareAltOutlined,
	ExportOutlined,
	ReloadOutlined,
	BgColorsOutlined} from '@ant-design/icons';
import styled from 'styled-components';
import { useTheme } from '@providers/ThemeProvider';
import {
	getTokensByCategory,
	updateTokenValue,
	resetTokens,
	getModifiedTokens,
	type ParsedToken,
	type TokenCategory} from '../utils/tokenHelpers';

const { Title, Text } = Typography;
const { Panel } = Collapse;

/**
 * Props interface for ThemeControls component
 */
interface ThemeControlsProps {
	onExport: () => void;
	modifiedTokens: Set<string>;
	onTokenChange: (tokenName: string, value: string) => void;
}

/**
 * Theme metadata for theme selector
 */
interface ThemeMetadata {
	value: string;
	label: string;
	colors: string[];
	description: string;
}

/**
 * Available themes with their metadata
 */
const THEMES: ThemeMetadata[] = [
	{
		value: 'default',
		label: 'Default (Purple)',
		colors: ['#6941c6', '#9e77ed', '#f9f5ff'],
		description: 'Professional purple brand',
	},
	{
		value: 'light',
		label: 'Light',
		colors: ['#6941c6', '#ffffff', '#fafafa'],
		description: 'Clean light theme',
	},
	{
		value: 'dark',
		label: 'Dark',
		colors: ['#bdff00', '#0a0a0a', '#1f1f1f'],
		description: 'True dark mode with lime accent',
	},
	{
		value: 'vibrant',
		label: 'Vibrant (Orange)',
		colors: ['#ff8533', '#000000', '#ffffff'],
		description: 'Bold Harley Davidson inspired',
	},
];

/**
 * Category display names
 */
const CATEGORY_LABELS: Record<TokenCategory, string> = {
	colors: 'Brand Colors',
	semantic: 'Semantic Colors',
	spacing: 'Spacing',
	typography: 'Typography',
	shadows: 'Shadows',
	borders: 'Borders',
	effects: 'Effects',
	layout: 'Layout',
	other: 'Other',
};

/**
 * Styled Components
 */
const ControlsContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	background: var(--surface-elevated);
	border-right: 1px solid var(--border-primary);
`;

const Section = styled.div`
	padding: var(--spacing-4);
	border-bottom: 1px solid var(--border-primary);
`;

const SectionTitle = styled(Title)`
	&& {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		margin: 0 0 var(--spacing-3) 0;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
`;

const ScrollableSection = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: var(--spacing-4);
`;

const QuickActionsSection = styled(Section)`
	position: sticky;
	bottom: 0;
	background: var(--surface-elevated);
	border-top: 1px solid var(--border-primary);
	border-bottom: none;
	padding: var(--spacing-4);
	box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
`;

const ThemeOption = styled.div`
	display: flex;
	align-items: center;
	gap: var(--spacing-2);
`;

const ColorSwatchGroup = styled.div`
	display: flex;
	gap: var(--spacing-1);
`;

const ColorSwatchPreview = styled.div<{ color: string }>`
	width: 16px;
	height: 16px;
	border-radius: var(--radius-sm);
	background: ${(props) => props.color};
	border: 1px solid var(--border-primary);
`;

const ThemeLabel = styled.div`
	flex: 1;
`;

const ThemeName = styled.div`
	font-weight: var(--font-weight-medium);
	color: var(--text-primary);
	font-size: var(--font-size-sm);
`;

const ThemeDescription = styled.div`
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
`;

const ActiveCheck = styled(CheckOutlined)`
	color: var(--brand-primary);
	font-size: 16px;
`;

const TokenRow = styled.div`
	display: flex;
	align-items: center;
	gap: var(--spacing-2);
	padding: var(--spacing-2) 0;
	min-height: 44px;

	&:not(:last-child) {
		border-bottom: 1px solid var(--border-secondary);
	}
`;

const TokenName = styled(Text)`
	flex: 0 0 140px;
	font-family: var(--font-family-mono);
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const ColorSwatch = styled.div<{ color: string }>`
	width: 32px;
	height: 32px;
	border-radius: var(--radius-md);
	background: ${(props) => props.color};
	border: 2px solid var(--border-primary);
	cursor: pointer;
	transition: all var(--transition-fast);
	flex-shrink: 0;

	&:hover {
		transform: scale(1.1);
		box-shadow: var(--shadow-md);
	}

	&:active {
		transform: scale(0.95);
	}
`;

const HexInput = styled(Input)`
	&& {
		flex: 1;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
	}
`;

const StyledCollapse = styled(Collapse)`
	&& {
		background: transparent;
		border: none;

		.ant-collapse-item {
			border-bottom: 1px solid var(--border-primary);
		}

		.ant-collapse-header {
			padding: var(--spacing-3) var(--spacing-4);
			font-weight: var(--font-weight-semibold);
			font-size: var(--font-size-sm);
			color: var(--text-primary);
		}

		.ant-collapse-content-box {
			padding: var(--spacing-3) var(--spacing-4);
		}
	}
`;

/**
 * ThemeControls Component
 *
 * Left panel for theme selection and color token editing.
 * Provides real-time theme switching and token customization.
 */
const ThemeControls: React.FC<ThemeControlsProps> = ({
	onExport,
	modifiedTokens,
	onTokenChange,
}) => {
	const { theme, setTheme } = useTheme();
	const [tokens, setTokens] = useState<ParsedToken[]>([]);
	const [localValues, setLocalValues] = useState<Record<string, string>>({});
	const [debounceTimers, setDebounceTimers] = useState<Record<string, NodeJS.Timeout>>({});

	/**
	 * Load color tokens from computed styles
	 *
	 * This approach reads CSS variables directly from the browser's computed styles
	 * instead of fetching the CSS file, which doesn't work in the browser environment.
	 */
	useEffect(() => {
		const loadTokens = () => {
			try {
				const styles = getComputedStyle(document.documentElement);
				const allTokens: ParsedToken[] = [];

				// Define all color token names from primitives.css
				const colorTokenNames: Array<{ name: string; category: TokenCategory }> = [
					// Purple scale
					{ name: '--color-purple-25', category: 'colors' },
					{ name: '--color-purple-50', category: 'colors' },
					{ name: '--color-purple-100', category: 'colors' },
					{ name: '--color-purple-200', category: 'colors' },
					{ name: '--color-purple-300', category: 'colors' },
					{ name: '--color-purple-400', category: 'colors' },
					{ name: '--color-purple-500', category: 'colors' },
					{ name: '--color-purple-600', category: 'colors' },
					{ name: '--color-purple-700', category: 'colors' },
					{ name: '--color-purple-800', category: 'colors' },
					{ name: '--color-purple-900', category: 'colors' },

					// Orange scale
					{ name: '--color-orange-25', category: 'colors' },
					{ name: '--color-orange-50', category: 'colors' },
					{ name: '--color-orange-100', category: 'colors' },
					{ name: '--color-orange-200', category: 'colors' },
					{ name: '--color-orange-300', category: 'colors' },
					{ name: '--color-orange-400', category: 'colors' },
					{ name: '--color-orange-500', category: 'colors' },
					{ name: '--color-orange-600', category: 'colors' },
					{ name: '--color-orange-700', category: 'colors' },
					{ name: '--color-orange-800', category: 'colors' },
					{ name: '--color-orange-900', category: 'colors' },

					// Lime scale
					{ name: '--color-lime-25', category: 'colors' },
					{ name: '--color-lime-50', category: 'colors' },
					{ name: '--color-lime-100', category: 'colors' },
					{ name: '--color-lime-200', category: 'colors' },
					{ name: '--color-lime-300', category: 'colors' },
					{ name: '--color-lime-400', category: 'colors' },
					{ name: '--color-lime-500', category: 'colors' },
					{ name: '--color-lime-600', category: 'colors' },
					{ name: '--color-lime-700', category: 'colors' },
					{ name: '--color-lime-800', category: 'colors' },
					{ name: '--color-lime-900', category: 'colors' },

					// Gray scale
					{ name: '--color-gray-25', category: 'colors' },
					{ name: '--color-gray-50', category: 'colors' },
					{ name: '--color-gray-100', category: 'colors' },
					{ name: '--color-gray-200', category: 'colors' },
					{ name: '--color-gray-300', category: 'colors' },
					{ name: '--color-gray-400', category: 'colors' },
					{ name: '--color-gray-500', category: 'colors' },
					{ name: '--color-gray-600', category: 'colors' },
					{ name: '--color-gray-700', category: 'colors' },
					{ name: '--color-gray-800', category: 'colors' },
					{ name: '--color-gray-900', category: 'colors' },

					// Black/White
					{ name: '--color-black', category: 'colors' },
					{ name: '--color-white', category: 'colors' },

					// Success
					{ name: '--color-success-25', category: 'semantic' },
					{ name: '--color-success-50', category: 'semantic' },
					{ name: '--color-success-100', category: 'semantic' },
					{ name: '--color-success-200', category: 'semantic' },
					{ name: '--color-success-300', category: 'semantic' },
					{ name: '--color-success-400', category: 'semantic' },
					{ name: '--color-success-500', category: 'semantic' },
					{ name: '--color-success-600', category: 'semantic' },
					{ name: '--color-success-700', category: 'semantic' },
					{ name: '--color-success-800', category: 'semantic' },
					{ name: '--color-success-900', category: 'semantic' },

					// Error
					{ name: '--color-error-25', category: 'semantic' },
					{ name: '--color-error-50', category: 'semantic' },
					{ name: '--color-error-100', category: 'semantic' },
					{ name: '--color-error-200', category: 'semantic' },
					{ name: '--color-error-300', category: 'semantic' },
					{ name: '--color-error-400', category: 'semantic' },
					{ name: '--color-error-500', category: 'semantic' },
					{ name: '--color-error-600', category: 'semantic' },
					{ name: '--color-error-700', category: 'semantic' },
					{ name: '--color-error-800', category: 'semantic' },
					{ name: '--color-error-900', category: 'semantic' },

					// Warning
					{ name: '--color-warning-25', category: 'semantic' },
					{ name: '--color-warning-50', category: 'semantic' },
					{ name: '--color-warning-100', category: 'semantic' },
					{ name: '--color-warning-200', category: 'semantic' },
					{ name: '--color-warning-300', category: 'semantic' },
					{ name: '--color-warning-400', category: 'semantic' },
					{ name: '--color-warning-500', category: 'semantic' },
					{ name: '--color-warning-600', category: 'semantic' },
					{ name: '--color-warning-700', category: 'semantic' },
					{ name: '--color-warning-800', category: 'semantic' },
					{ name: '--color-warning-900', category: 'semantic' },

					// Info
					{ name: '--color-info-25', category: 'semantic' },
					{ name: '--color-info-50', category: 'semantic' },
					{ name: '--color-info-100', category: 'semantic' },
					{ name: '--color-info-200', category: 'semantic' },
					{ name: '--color-info-300', category: 'semantic' },
					{ name: '--color-info-400', category: 'semantic' },
					{ name: '--color-info-500', category: 'semantic' },
					{ name: '--color-info-600', category: 'semantic' },
					{ name: '--color-info-700', category: 'semantic' },
					{ name: '--color-info-800', category: 'semantic' },
					{ name: '--color-info-900', category: 'semantic' },

					// Brand tokens
					{ name: '--brand-primary', category: 'semantic' },
					{ name: '--brand-secondary', category: 'semantic' },
					{ name: '--brand-tertiary', category: 'semantic' },
					{ name: '--brand-primary-hover', category: 'semantic' },
				];

				// Read values from computed styles and create ParsedToken objects
				colorTokenNames.forEach(({ name, category }) => {
					const value = styles.getPropertyValue(name).trim();
					if (value) {
						allTokens.push({
							name,
							value,
							type: 'color',
							category,
							originalValue: value,
							isModified: false,
						});
					}
				});

				setTokens(allTokens);
			} catch (error) {
				message.error('Failed to load design tokens');
			}
		};

		loadTokens();
	}, []);

	/**
	 * Group tokens by category
	 */
	const groupedTokens = useMemo(() => {
		return getTokensByCategory(tokens);
	}, [tokens]);

	/**
	 * Filter color-related categories for editing
	 */
	const editableCategories: TokenCategory[] = useMemo(() => {
		return ['colors', 'semantic'];
	}, []);

	/**
	 * Handle theme change
	 */
	const handleThemeChange = useCallback(
		(newTheme: string) => {
			setTheme(newTheme as 'light' | 'dark' | 'default' | 'vibrant');
		},
		[setTheme]
	);

	/**
	 * Handle color change with debounce
	 */
	const handleColorChange = useCallback(
		(tokenName: string, newValue: string) => {
			// Update local state immediately
			setLocalValues((prev) => ({ ...prev, [tokenName]: newValue }));

			// Clear existing timer
			if (debounceTimers[tokenName]) {
				clearTimeout(debounceTimers[tokenName]);
			}

			// Set new debounced timer
			const timer = setTimeout(() => {
				updateTokenValue(tokenName, newValue);
				onTokenChange(tokenName, newValue);
			}, 300);

			setDebounceTimers((prev) => ({ ...prev, [tokenName]: timer }));
		},
		[debounceTimers, onTokenChange]
	);

	/**
	 * Handle hex input change
	 */
	const handleHexInputChange = useCallback(
		(tokenName: string, value: string) => {
			// Validate hex format
			if (/^#[0-9a-fA-F]{0,6}$/.test(value) || value === '') {
				handleColorChange(tokenName, value);
			}
		},
		[handleColorChange]
	);

	/**
	 * Handle color picker change
	 */
	const handleColorPickerChange = useCallback(
		(tokenName: string, color: { toHexString: () => string }) => {
			handleColorChange(tokenName, color.toHexString());
		},
		[handleColorChange]
	);

	/**
	 * Reset all tokens
	 */
	const handleReset = useCallback(() => {
		Modal.confirm({
			title: 'Reset All Customizations?',
			content: 'This will restore all tokens to their original values. This action cannot be undone.',
			okText: 'Reset',
			okType: 'danger',
			cancelText: 'Cancel',
			onOk: () => {
				resetTokens();
				setLocalValues({});
				message.success('All tokens reset to defaults');
				window.location.reload();
			},
		});
	}, []);

	/**
	 * Copy CSS to clipboard
	 */
	const handleCopyCSS = useCallback(async () => {
		try {
			const modifications = getModifiedTokens();
			const cssLines = modifications.map((mod) => `  ${mod.token}: ${mod.newValue};`);
			const css = `:root {\n${cssLines.join('\n')}\n}`;

			await navigator.clipboard.writeText(css);
			message.success('CSS copied to clipboard');
		} catch (error) {
			message.error('Failed to copy CSS');
		}
	}, []);

	/**
	 * Share URL with modifications
	 */
	const handleShareURL = useCallback(async () => {
		try {
			const modifications = getModifiedTokens();
			const params = new URLSearchParams();
			params.set('theme', theme);
			modifications.forEach((mod) => {
				params.set(mod.token, mod.newValue);
			});

			const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
			await navigator.clipboard.writeText(url);
			message.success('URL copied to clipboard');
		} catch (error) {
			message.error('Failed to copy URL');
		}
	}, [theme]);

	/**
	 * Get current token value (local or computed)
	 */
	const getTokenDisplayValue = useCallback(
		(token: ParsedToken) => {
			if (localValues[token.name]) {
				return localValues[token.name];
			}
			const computed = getComputedStyle(document.documentElement).getPropertyValue(token.name).trim();
			return computed || token.value;
		},
		[localValues]
	);

	/**
	 * Render theme selector option
	 */
	const renderThemeOption = (themeData: ThemeMetadata) => {
		const isActive = theme === themeData.value;

		return (
			<ThemeOption>
				<ColorSwatchGroup>
					{themeData.colors.map((color, index) => (
						<ColorSwatchPreview key={index} color={color} />
					))}
				</ColorSwatchGroup>
				<ThemeLabel>
					<ThemeName>{themeData.label}</ThemeName>
					<ThemeDescription>{themeData.description}</ThemeDescription>
				</ThemeLabel>
				{isActive && <ActiveCheck />}
			</ThemeOption>
		);
	};

	/**
	 * Render token row with color picker
	 */
	const renderTokenRow = (token: ParsedToken) => {
		const isModified = modifiedTokens.has(token.name);
		const currentValue = getTokenDisplayValue(token);

		return (
			<TokenRow key={token.name}>
				<Badge dot={isModified} color="var(--brand-primary)">
					<TokenName>{token.name}</TokenName>
				</Badge>
				<ColorPicker
					value={currentValue}
					onChange={(color) => handleColorPickerChange(token.name, color)}
					trigger="click"
					placement="rightTop"
					showText={false}
				>
					<ColorSwatch color={currentValue} />
				</ColorPicker>
				<HexInput
					value={currentValue}
					onChange={(e) => handleHexInputChange(token.name, e.target.value)}
					placeholder="#000000"
					maxLength={7}
				/>
			</TokenRow>
		);
	};

	/**
	 * Render category panel
	 */
	const renderCategoryPanel = (category: TokenCategory) => {
		const categoryTokens = groupedTokens[category].filter((token) => token.type === 'color');

		if (categoryTokens.length === 0) return null;

		return (
			<Panel
				key={category}
				header={
					<Space>
						<BgColorsOutlined />
						{CATEGORY_LABELS[category]}
						<Badge count={categoryTokens.filter((t) => modifiedTokens.has(t.name)).length} />
					</Space>
				}
			>
				{categoryTokens.map(renderTokenRow)}
			</Panel>
		);
	};

	return (
		<ControlsContainer>
			{/* Theme Selector Section */}
			<Section>
				<SectionTitle level={5}>Theme</SectionTitle>
				<Select
					value={theme}
					onChange={handleThemeChange}
					style={{ width: '100%' }}
					size="large"
					optionLabelProp="label"
				>
					{THEMES.map((themeData) => (
						<Select.Option
							key={themeData.value}
							value={themeData.value}
							label={themeData.label}
						>
							{renderThemeOption(themeData)}
						</Select.Option>
					))}
				</Select>
			</Section>

			{/* Color Token Editor Section */}
			<ScrollableSection>
				<SectionTitle level={5}>Color Tokens</SectionTitle>
				<StyledCollapse defaultActiveKey={['colors']} ghost>
					{editableCategories.map(renderCategoryPanel)}
				</StyledCollapse>
			</ScrollableSection>

			{/* Quick Actions Section */}
			<QuickActionsSection>
				<SectionTitle level={5}>Quick Actions</SectionTitle>
				<Space direction="vertical" style={{ width: '100%' }} size="small">
					<Button
						icon={<ReloadOutlined />}
						onClick={handleReset}
						block
						danger
						disabled={modifiedTokens.size === 0}
					>
						Reset All ({modifiedTokens.size})
					</Button>
					<Button
						icon={<CopyOutlined />}
						onClick={handleCopyCSS}
						block
						disabled={modifiedTokens.size === 0}
					>
						Copy CSS
					</Button>
					<Button
						icon={<ShareAltOutlined />}
						onClick={handleShareURL}
						block
						disabled={modifiedTokens.size === 0}
					>
						Share URL
					</Button>
					<Button icon={<ExportOutlined />} onClick={onExport} block type="primary">
						Export Theme
					</Button>
				</Space>
			</QuickActionsSection>
		</ControlsContainer>
	);
};

export default ThemeControls;
