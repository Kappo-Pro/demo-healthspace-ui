import React, { useState, useMemo, useCallback } from 'react';
import {
	Modal,
	Tabs,
	Button,
	Checkbox,
	Typography,
	Space,
	Input,
	Alert,
	message} from 'antd';
import type { TabsProps } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import {
	exportAsCSS,
	exportAsJSON,
	copyToClipboard,
	downloadFile,
	importFromJSON,
	generateFilename,
	type ExportOptions} from '../utils/exportHelpers';
import { type ParsedToken, type TokenModification } from '../utils/tokenHelpers';
import sessionManager from '../utils/sessionManager';
import type { Theme } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * Props interface for ExportModal component
 */
interface ExportModalProps {
	/** Whether modal is visible */
	visible: boolean;
	/** Callback to close modal */
	onClose: () => void;
	/** Current theme name */
	currentTheme: Theme;
	/** Set of modified token names */
	modifiedTokens: Set<string>;
	/** Custom token values */
	customTokens: Record<string, string>;
	/** All parsed tokens (for full export) */
	allTokens?: ParsedToken[];
}

/**
 * ExportModal Component
 *
 * Modal dialog for exporting and importing design system theme customizations.
 * Supports CSS variables and JSON formats with various export options.
 *
 * @component
 * @example
 * <ExportModal
 *   visible={showExport}
 *   onClose={() => setShowExport(false)}
 *   currentTheme="default"
 *   modifiedTokens={modifiedSet}
 *   customTokens={customValues}
 * />
 */
export const ExportModal: React.FC<ExportModalProps> = ({
	visible,
	onClose,
	currentTheme,
	modifiedTokens,
	customTokens,
	allTokens: _allTokens = [],
}) => {
	// State
	const [format, setFormat] = useState<'css' | 'json'>('css');
	const [options, setOptions] = useState<string[]>([
		'includeComments',
		'includeMetadata',
		'prettify',
	]);
	const [importText, setImportText] = useState('');
	const [importError, setImportError] = useState('');
	const [loading, setLoading] = useState(false);

	/**
	 * Convert customTokens to TokenModification array
	 */
	const tokenModifications = useMemo((): TokenModification[] => {
		return Array.from(modifiedTokens).map((tokenName: string) => ({
			token: tokenName,
			originalValue: '', // Will be fetched if needed
			newValue: customTokens[tokenName] || '',
			timestamp: Date.now(),
		}));
	}, [modifiedTokens, customTokens]);

	/**
	 * Generate export options from checkbox selections
	 */
	const exportOptions = useMemo((): ExportOptions => {
		return {
			modifiedOnly: options.includes('modifiedOnly'),
			includeComments: options.includes('includeComments'),
			includeMetadata: options.includes('includeMetadata'),
			prettyPrint: options.includes('prettify'),
			groupByCategory: true,
		};
	}, [options]);

	/**
	 * Generate export content based on format
	 */
	const generatedCode = useMemo(() => {
		setLoading(true);
		try {
			if (format === 'css') {
				return exportAsCSS(tokenModifications, exportOptions);
			} else {
				return exportAsJSON(tokenModifications, exportOptions);
			}
		} finally {
			setLoading(false);
		}
	}, [format, tokenModifications, exportOptions]);

	/**
	 * Calculate code statistics
	 */
	const { lineCount, charCount } = useMemo(() => {
		const lines = generatedCode.split('\n').length;
		const chars = generatedCode.length;
		return { lineCount: lines, charCount: chars };
	}, [generatedCode]);

	/**
	 * Handle copy to clipboard
	 */
	const handleCopy = useCallback(async () => {
		try {
			await copyToClipboard(generatedCode);
			message.success('Copied to clipboard!');
		} catch (error) {
			message.error('Failed to copy to clipboard');
		}
	}, [generatedCode]);

	/**
	 * Handle file download
	 */
	const handleDownload = useCallback(() => {
		try {
			const extension = format === 'css' ? 'css' : 'json';
			const mimeType = format === 'css' ? 'text/css' : 'application/json';
			const filename = generateFilename(`vitalflow-theme-${currentTheme}`, extension);

			downloadFile(generatedCode, filename, mimeType);
			message.success(`Downloaded ${filename}`);
		} catch (error) {
			message.error('Failed to download file');
		}
	}, [format, generatedCode, currentTheme]);

	/**
	 * Handle theme import from JSON
	 */
	const handleImport = useCallback(async () => {
		setImportError('');
		setLoading(true);

		try {
			// Validate and parse JSON
			const result = importFromJSON(importText);

			if (!result.success) {
				setImportError(result.errors?.join(', ') || 'Import failed');
				return;
			}

			if (!result.tokens || result.tokens.length === 0) {
				setImportError('No tokens found in import data');
				return;
			}

			// Apply tokens to document
			result.tokens.forEach(token => {
				document.documentElement.style.setProperty(token.token, token.newValue);
			});

			// Save to session storage
			const currentState = sessionManager.loadState();
			const newState = {
				...currentState,
				customCSS: importText,
			};
			sessionManager.saveState(newState);

			message.success(`Imported ${result.tokens.length} tokens successfully!`);
			setImportText('');
			onClose();

			// Refresh page to apply changes
			window.location.reload();
		} catch (error) {
			setImportError(error instanceof Error ? error.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	}, [importText, onClose]);

	/**
	 * Handle modal close
	 */
	const handleClose = useCallback(() => {
		setImportText('');
		setImportError('');
		onClose();
	}, [onClose]);

	/**
	 * Footer buttons
	 */
	const footerButtons = useMemo(
		() => [
			<Button key="cancel" onClick={handleClose}>
				Cancel
			</Button>,
			<Button
				key="copy"
				icon={<UntitledIcon name="copy" />}
				onClick={handleCopy}
				disabled={loading}
			>
				Copy to Clipboard
			</Button>,
			<Button
				key="download"
				type="primary"
				icon={<UntitledIcon name="download" />}
				onClick={handleDownload}
				disabled={loading}
			>
				Download File
			</Button>,
		],
		[handleClose, handleCopy, handleDownload, loading]
	);

	/**
	 * Tab items for Ant Design v5 Tabs component
	 */
	const tabItems: TabsProps['items'] = useMemo(
		() => [
			{
				key: 'css',
				label: 'CSS Variables',
				children: (
					<TabContent>
						<OptionsSection>
							<Title level={5}>Export Options</Title>
							<Checkbox.Group
								value={options}
								onChange={values => setOptions(values as string[])}
							>
								<Space direction="vertical">
									<Checkbox value="includeComments">
										Include comments
									</Checkbox>
									<Checkbox value="includeMetadata">
										Include metadata
									</Checkbox>
									<Checkbox value="modifiedOnly">
										Export modified tokens only ({modifiedTokens.size} tokens)
									</Checkbox>
									<Checkbox value="prettify">Prettify output</Checkbox>
								</Space>
							</Checkbox.Group>
						</OptionsSection>

						<PreviewSection>
							<PreviewHeader>
								<Title level={5}>Preview</Title>
								<StatsWrapper>
									<Text type="secondary">{lineCount} lines</Text>
									<Divider />
									<Text type="secondary">{charCount} characters</Text>
								</StatsWrapper>
							</PreviewHeader>
							<CodePreview>
								<pre
									style={{
										margin: 0,
										padding: 'var(--spacing-4)',
										borderRadius: 'var(--radius-sm)',
										fontSize: '13px',
										fontFamily: 'var(--font-family-mono)',
										backgroundColor: '#1e1e1e',
										color: '#d4d4d4',
										overflowX: 'auto',
										maxHeight: '400px',
										lineHeight: '1.6',
									}}
								>
									<code>{generatedCode}</code>
								</pre>
							</CodePreview>
						</PreviewSection>
					</TabContent>
				),
			},
			{
				key: 'json',
				label: 'JSON',
				children: (
					<TabContent>
						<OptionsSection>
							<Title level={5}>Export Options</Title>
							<Checkbox.Group
								value={options}
								onChange={values => setOptions(values as string[])}
							>
								<Space direction="vertical">
									<Checkbox value="includeMetadata">
										Include metadata
									</Checkbox>
									<Checkbox value="modifiedOnly">
										Export modified tokens only ({modifiedTokens.size} tokens)
									</Checkbox>
									<Checkbox value="prettify">Prettify output</Checkbox>
								</Space>
							</Checkbox.Group>
						</OptionsSection>

						<PreviewSection>
							<PreviewHeader>
								<Title level={5}>Preview</Title>
								<StatsWrapper>
									<Text type="secondary">{lineCount} lines</Text>
									<Divider />
									<Text type="secondary">{charCount} characters</Text>
								</StatsWrapper>
							</PreviewHeader>
							<CodePreview>
								<pre
									style={{
										margin: 0,
										padding: 'var(--spacing-4)',
										borderRadius: 'var(--radius-sm)',
										fontSize: '13px',
										fontFamily: 'var(--font-family-mono)',
										backgroundColor: '#1e1e1e',
										color: '#d4d4d4',
										overflowX: 'auto',
										maxHeight: '400px',
										lineHeight: '1.6',
									}}
								>
									<code>{generatedCode}</code>
								</pre>
							</CodePreview>
						</PreviewSection>

						<ImportSection>
							<Title level={5}>Import Theme</Title>
							<Text type="secondary" style={{ marginBottom: 'var(--spacing-3)', display: 'block' }}>
								Paste JSON theme data below to import and apply custom tokens.
							</Text>
							<TextArea
								placeholder="Paste JSON to import theme..."
								rows={6}
								value={importText}
								onChange={e => setImportText(e.target.value)}
								disabled={loading}
							/>
							{importError && (
								<Alert
									type="error"
									message={importError}
									style={{ marginTop: 'var(--spacing-3)' }}
									closable
									onClose={() => setImportError('')}
								/>
							)}
							<Button
								icon={<UntitledIcon name="download" />}
								onClick={handleImport}
								disabled={!importText || loading}
								loading={loading}
								style={{ marginTop: 'var(--spacing-3)' }}
							>
								Import Theme
							</Button>
						</ImportSection>
					</TabContent>
				),
			},
		],
		[options, modifiedTokens.size, lineCount, charCount, generatedCode, importText, importError, loading, handleImport]
	);

	return (
		<StyledModal
			title="Export Design System Theme"
			open={visible}
			onCancel={handleClose}
			width={800}
			footer={footerButtons}
		>
			<ContentWrapper>
				<Tabs
					activeKey={format}
					onChange={key => setFormat(key as 'css' | 'json')}
					items={tabItems}
				/>
			</ContentWrapper>
		</StyledModal>
	);
};

/**
 * Styled Components
 */

const StyledModal = styled(Modal)`
	.ant-modal-body {
		max-height: 70vh;
		overflow-y: auto;
	}
`;

const ContentWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
`;

const TabContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
	padding-top: 16px;
`;

const OptionsSection = styled.div`
	padding: 16px;
	background: var(--color-gray-50);
	border-radius: 8px;

	.ant-typography {
		margin-bottom: 12px;
	}

	.ant-checkbox-group {
		width: 100%;
	}

	.ant-space-vertical {
		width: 100%;
	}
`;

const PreviewSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const PreviewHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;

	.ant-typography {
		margin-bottom: 0;
	}
`;

const StatsWrapper = styled.div`
	display: flex;
	gap: 12px;
	align-items: center;
`;

const Divider = styled.span`
	width: 1px;
	height: 16px;
	background: var(--color-gray-300);
`;

const CodePreview = styled.div`
	border: 1px solid var(--color-gray-300);
	border-radius: 8px;
	overflow: hidden;
	max-height: 400px;
	overflow-y: auto;

	pre {
		margin: 0 !important;
	}
`;

const ImportSection = styled.div`
	padding: 16px;
	background: var(--color-gray-50);
	border-radius: 8px;
	margin-top: 24px;

	.ant-typography {
		margin-bottom: 0;
	}

	.ant-input-textarea {
		font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
		font-size: 13px;
	}
`;

export default ExportModal;
