/**
 * HtmlSanitizer Service
 * XSS Prevention for Rich-Text Content
 *
 * Provides defense-in-depth protection against XSS attacks by sanitizing
 * HTML content from rich-text editors and backend templates before rendering.
 *
 * Use Cases:
 * - Consent form templates (AdminConsentFormModal)
 * - Plan descriptions (PlansTab, UpgradePlan)
 * - Rich-text editor output (Quill)
 * - Animation card descriptions (FunctionalGoals)
 * - Feature card descriptions (PatientPainStatus)
 *
 * Security Features:
 * - Allows formatting tags for rich-text content
 * - Removes script tags and event handlers
 * - Blocks javascript: protocol in links
 * - Explicitly forbids dangerous tags and attributes
 * - Singleton pattern for consistent configuration
 *
 * @see https://github.com/cure53/DOMPurify
 */

import DOMPurify from 'dompurify';

/**
 * HTML Sanitizer for Rich-Text Content
 *
 * Separate from InputSanitizer to:
 * - Allow more tags for rich-text content (tables, images, headings)
 * - Avoid changing InputSanitizer's behavior (tuned for CommandPalette)
 * - Provide context-specific methods for different use cases
 */
class HtmlSanitizerService {
  private purify: typeof DOMPurify;

  constructor() {
    this.purify = DOMPurify;

    // Add hook to remove javascript: protocol from links (case-insensitive)
    this.purify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A') {
        const href = node.getAttribute('href');
        if (href && href.toLowerCase().startsWith('javascript:')) {
          node.removeAttribute('href');
        }
      }
      // Also check for javascript: in src attributes (images, iframes that slip through)
      if (node.hasAttribute('src')) {
        const src = node.getAttribute('src');
        if (src && src.toLowerCase().startsWith('javascript:')) {
          node.removeAttribute('src');
        }
      }
    });
  }

  /**
   * Sanitize rich-text HTML content
   * Allows formatting tags while blocking script execution
   *
   * @param input - Raw HTML string from backend or rich-text editor
   * @returns Sanitized HTML string safe for rendering with dangerouslySetInnerHTML
   *
   * @example
   * ```typescript
   * // In a React component:
   * const sanitizedHtml = HtmlSanitizer.sanitizeRichText(consentFormTemplate);
   * return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
   *
   * // Script tags removed:
   * HtmlSanitizer.sanitizeRichText('<script>alert("xss")</script>Hello');
   * // Returns: 'Hello'
   *
   * // Safe HTML preserved:
   * HtmlSanitizer.sanitizeRichText('<h1>Title</h1><p><strong>Bold</strong></p>');
   * // Returns: '<h1>Title</h1><p><strong>Bold</strong></p>'
   *
   * // Event handlers removed:
   * HtmlSanitizer.sanitizeRichText('<img src="photo.jpg" onerror="alert(\'xss\')">');
   * // Returns: '<img src="photo.jpg">'
   * ```
   */
  sanitizeRichText(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return this.purify.sanitize(input, {
      // Allowed tags for rich-text content
      ALLOWED_TAGS: [
        // Text formatting
        'p',
        'br',
        'strong',
        'em',
        'b',
        'i',
        'u',
        's',
        'span',
        // Headings
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        // Lists
        'ul',
        'ol',
        'li',
        // Links
        'a',
        // Tables (for consent forms)
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        // Block elements
        'div',
        'blockquote',
        'pre',
        // Media (images only, no embeds)
        'img',
        // Horizontal rule
        'hr',
      ],
      // Allowed attributes for formatting
      ALLOWED_ATTR: [
        'href',
        'target',
        'rel',
        'style',
        'class',
        'src',
        'alt',
        'width',
        'height',
        'colspan',
        'rowspan',
        'id',
      ],
      // Preserve text inside removed tags
      KEEP_CONTENT: true,
      // Return string, not TrustedHTML
      RETURN_TRUSTED_TYPE: false,
      // Explicitly forbid dangerous tags
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button'],
      // Explicitly forbid dangerous attributes (event handlers)
      FORBID_ATTR: [
        'onerror',
        'onclick',
        'onload',
        'onmouseover',
        'onfocus',
        'onblur',
        'onsubmit',
        'onkeydown',
        'onkeyup',
        'onkeypress',
        'onchange',
        'oninput',
        'ondblclick',
        'onmousedown',
        'onmouseup',
        'onmousemove',
        'onmouseout',
        'onmouseenter',
        'onmouseleave',
        'oncontextmenu',
        'ondrag',
        'ondragend',
        'ondragenter',
        'ondragleave',
        'ondragover',
        'ondragstart',
        'ondrop',
        'onscroll',
        'onwheel',
        'oncopy',
        'oncut',
        'onpaste',
      ],
    });
  }

  /**
   * Sanitize consent form HTML specifically
   *
   * Uses same configuration as sanitizeRichText.
   * Provided as a semantic alias for consent form use cases.
   *
   * @param input - Raw consent form HTML from backend
   * @returns Sanitized HTML safe for rendering
   *
   * @example
   * ```typescript
   * // In AdminConsentFormModal:
   * const template = consentFormTemplate || DEFAULT_CONSENT_FORM_TEMPLATE;
   * const sanitizedTemplate = HtmlSanitizer.sanitizeConsentForm(template);
   * return <div dangerouslySetInnerHTML={{ __html: sanitizedTemplate }} />;
   * ```
   */
  sanitizeConsentForm(input: string): string {
    return this.sanitizeRichText(input);
  }

  /**
   * Sanitize plan description HTML
   *
   * Uses same configuration as sanitizeRichText.
   * Provided as a semantic alias for plan description use cases.
   *
   * @param input - Raw plan description HTML
   * @returns Sanitized HTML safe for rendering
   *
   * @example
   * ```typescript
   * // In PlansTab or UpgradePlan:
   * const sanitizedDescription = HtmlSanitizer.sanitizePlanDescription(description);
   * return <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />;
   * ```
   */
  sanitizePlanDescription(input: string): string {
    return this.sanitizeRichText(input);
  }
}

// Export singleton instance
export const HtmlSanitizer = new HtmlSanitizerService();
