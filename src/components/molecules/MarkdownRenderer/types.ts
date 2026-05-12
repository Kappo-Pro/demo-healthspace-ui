/**
 * MarkdownRenderer Component Types
 * EPIC-019-S2: Markdown Renderer Integration
 */

/**
 * MarkdownRenderer Props Interface
 *
 * @property {string} content - Markdown content to render
 * @property {string} [className] - Optional additional CSS classes
 *
 * @example
 * ```typescript
 * <MarkdownRenderer
 *   content="# Heading\n\nThis is **bold** text."
 *   className="custom-markdown"
 * />
 * ```
 */
export interface MarkdownRendererProps {
	/** Markdown content string to render */
	content: string;

	/** Optional additional CSS classes */
	className?: string;
}
