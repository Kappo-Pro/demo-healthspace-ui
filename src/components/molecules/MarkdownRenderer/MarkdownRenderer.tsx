/**
 * MarkdownRenderer Molecule Component
 * EPIC-019-S2: Markdown content renderer with GitHub Flavored Markdown support
 *
 * Features:
 * - GitHub Flavored Markdown (tables, strikethrough, task lists)
 * - Automatic XSS sanitization (built-in to react-markdown)
 * - Design system typography tokens
 * - Dark mode support
 * - Custom component renderers (links, images)
 * - Lazy loading images
 * - External links open in new tab
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import type { Components } from 'react-markdown';
import type { MarkdownRendererProps } from './types';
import './MarkdownRenderer.css';

/**
 * MarkdownRenderer Component
 *
 * Renders markdown content with GitHub Flavored Markdown extensions.
 * Automatically sanitizes content to prevent XSS attacks.
 *
 * @param {MarkdownRendererProps} props - Component props
 * @returns {JSX.Element} Rendered markdown content
 *
 * @example
 * ```typescript
 * <MarkdownRenderer
 *   content="# Exercise Guide\n\nPerform **10 reps** of this exercise."
 * />
 * ```
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
	content,
	className = '',
}) => {
	const { t } = useTranslation();

	/**
	 * Custom component renderers for markdown elements
	 * Enhances default rendering with best practices
	 */
	const markdownComponents: Components = {
		// Links: Open external links in new tab with security attributes
		a: ({ node: _node, ...props }) => (
			<a
				{...props}
				target="_blank"
				rel="noopener noreferrer"
				className="markdown-link"
			/>
		),

		// Images: Lazy load with proper alt text fallback
		img: ({ node: _node, ...props }) => (
			<img
				{...props}
				loading="lazy"
				alt={props.alt || t('common.markdown.imageAlt')}
				className="markdown-image"
			/>
		),

		// Code blocks: Add syntax highlighting class
		code: ({ node: _node, inline, ...props }) => {
			if (inline) {
				return <code className="markdown-inline-code" {...props} />;
			}
			return <code className="markdown-code-block" {...props} />;
		},

		// Blockquotes: Add custom styling class
		blockquote: ({ node: _node, ...props }) => (
			<blockquote className="markdown-blockquote" {...props} />
		),

		// Tables: Add responsive wrapper
		table: ({ node: _node, ...props }) => (
			<div className="markdown-table-wrapper">
				<table className="markdown-table" {...props} />
			</div>
		),
	};

	return (
		<div className={`markdown-renderer ${className}`.trim()}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={markdownComponents}>
				{content}
			</ReactMarkdown>
		</div>
	);
};

export default MarkdownRenderer;
