/**
 * Data sanitization service for ImageAnnotation component
 * Provides secure text processing and input sanitization
 */

import { validateAnnotationText, sanitizeText } from '../utils/validation';
import { logger } from './logger';

export interface SanitizationOptions {
  maxLength?: number;
  allowedTags?: string[];
  allowNewlines?: boolean;
  preserveSpaces?: boolean;
  encodeHtml?: boolean;
}

export interface SanitizationResult {
  sanitized: string;
  wasModified: boolean;
  originalLength: number;
  sanitizedLength: number;
  warnings: string[];
}

/**
 * Comprehensive text sanitization service
 */
export class TextSanitizer {
  private static readonly DEFAULT_OPTIONS: Required<SanitizationOptions> = {
    maxLength: 1000,
    allowedTags: [],
    allowNewlines: true,
    preserveSpaces: true,
    encodeHtml: true
  };

  private static readonly DANGEROUS_PATTERNS = [
    /(<script[^>]*>.*?<\/script>)/gi,
    /(javascript\s*:)/gi,
    /(on\w+\s*=)/gi,
    /(<iframe[^>]*>.*?<\/iframe>)/gi,
    /(<object[^>]*>.*?<\/object>)/gi,
    /(<embed[^>]*>.*?<\/embed>)/gi,
    /(<form[^>]*>.*?<\/form>)/gi,
    /(data\s*:\s*text\/html)/gi,
    /(vbscript\s*:)/gi,
    /(expression\s*\()/gi
  ];

  private static readonly XSS_PATTERNS = [
    /(<.*?on\w+.*?=.*?>)/gi,
    /(<.*?href\s*=\s*["']?\s*javascript:.*?>)/gi,
    /(<.*?src\s*=\s*["']?\s*javascript:.*?>)/gi,
    /(<.*?style\s*=.*?expression\s*\(.*?>)/gi
  ];

  /**
   * Sanitize text input for annotation purposes
   */
  public static sanitizeAnnotationText(
    input: string,
    options: SanitizationOptions = {}
  ): SanitizationResult {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const originalLength = input.length;
    const warnings: string[] = [];
    let sanitized = input;
    let wasModified = false;

    // Validate input first
    const validation = validateAnnotationText(input);
    if (!validation.isValid) {
      logger.logValidationError('annotationText', validation.error || 'Invalid text', input);
      throw new Error(validation.error || 'Invalid annotation text');
    }

    // 1. Length check and truncation
    if (sanitized.length > opts.maxLength) {
      sanitized = sanitized.substring(0, opts.maxLength);
      wasModified = true;
      warnings.push(`Text truncated to ${opts.maxLength} characters`);
    }

    // 2. Remove dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '');
        wasModified = true;
        warnings.push('Removed potentially dangerous content');
        logger.logSecurityEvent('dangerous_pattern_detected', { pattern: pattern.toString() });
      }
    }

    // 3. Check for XSS attempts
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '');
        wasModified = true;
        warnings.push('Removed potential XSS content');
        logger.logSecurityEvent('xss_attempt_detected', { pattern: pattern.toString() });
      }
    }

    // 4. HTML tag handling
    if (opts.allowedTags.length === 0) {
      // Remove all HTML tags
      const htmlTagPattern = /<[^>]*>/g;
      if (htmlTagPattern.test(sanitized)) {
        sanitized = sanitized.replace(htmlTagPattern, '');
        wasModified = true;
        warnings.push('Removed HTML tags');
      }
    } else {
      // Remove only disallowed tags
      const tagPattern = /<\/?(?!(?:\/?)(?:${opts.allowedTags.join('|')})\b)[^>]*>/gi;
      if (tagPattern.test(sanitized)) {
        sanitized = sanitized.replace(tagPattern, '');
        wasModified = true;
        warnings.push('Removed disallowed HTML tags');
      }
    }

    // 5. Newline handling
    if (!opts.allowNewlines) {
      sanitized = sanitized.replace(/\n/g, ' ').replace(/\r/g, ' ');
      wasModified = true;
    }

    // 6. Space handling
    if (!opts.preserveSpaces) {
      sanitized = sanitized.replace(/\s+/g, ' ').trim();
      wasModified = true;
    }

    // 7. HTML encoding
    if (opts.encodeHtml) {
      const encoded = this.htmlEncode(sanitized);
      if (encoded !== sanitized) {
        sanitized = encoded;
        wasModified = true;
      }
    }

    // 8. Final validation
    const finalValidation = validateAnnotationText(sanitized);
    if (!finalValidation.isValid) {
      logger.logValidationError('sanitizedText', finalValidation.error || 'Invalid sanitized text', sanitized);
      throw new Error('Text could not be safely sanitized');
    }

    return {
      sanitized,
      wasModified,
      originalLength,
      sanitizedLength: sanitized.length,
      warnings
    };
  }

  /**
   * HTML encode special characters
   */
  private static htmlEncode(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };

    return text.replace(/[&<>"'\/]/g, (char) => map[char]);
  }

  /**
   * Sanitize filename for safe file operations
   */
  public static sanitizeFilename(filename: string): string {
    // Remove path traversal attempts
    let sanitized = filename.replace(/\.\./g, '');
    
    // Remove or replace invalid characters
    sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
    
    // Limit length
    if (sanitized.length > 255) {
      const ext = sanitized.match(/\.[^.]+$/);
      const name = sanitized.substring(0, 255 - (ext ? ext[0].length : 0));
      sanitized = name + (ext ? ext[0] : '');
    }
    
    // Ensure not empty
    if (!sanitized.trim()) {
      sanitized = 'untitled';
    }
    
    return sanitized;
  }

  /**
   * Sanitize JSON data for export
   */
  public static sanitizeJsonData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return this.sanitizeAnnotationText(data).sanitized;
    }

    if (typeof data === 'number' || typeof data === 'boolean') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeJsonData(item));
    }

    if (typeof data === 'object') {
      const sanitized: unknown = {};
      for (const [key, value] of Object.entries(data)) {
        // Sanitize both key and value
        const sanitizedKey = this.sanitizeAnnotationText(key, { maxLength: 100 }).sanitized;
        sanitized[sanitizedKey] = this.sanitizeJsonData(value);
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Check if text contains potentially dangerous content
   */
  public static containsDangerousContent(text: string): boolean {
    return this.DANGEROUS_PATTERNS.some(pattern => pattern.test(text)) ||
           this.XSS_PATTERNS.some(pattern => pattern.test(text));
  }

  /**
   * Create safe preview of text for logging
   */
  public static createSafePreview(text: string, maxLength = 100): string {
    const preview = text.substring(0, maxLength);
    const sanitized = this.sanitizeAnnotationText(preview, { 
      maxLength,
      encodeHtml: true,
      allowedTags: []
    }).sanitized;
    
    return sanitized + (text.length > maxLength ? '...' : '');
  }
}

/**
 * React hook for text sanitization
 */
export function useSanitization() {
  const sanitizeText = (text: string, options?: SanitizationOptions): SanitizationResult => {
    return TextSanitizer.sanitizeAnnotationText(text, options);
  };

  const sanitizeFilename = (filename: string): string => {
    return TextSanitizer.sanitizeFilename(filename);
  };

  const sanitizeJsonData = (data: unknown): unknown => {
    return TextSanitizer.sanitizeJsonData(data);
  };

  const checkDangerousContent = (text: string): boolean => {
    return TextSanitizer.containsDangerousContent(text);
  };

  return {
    sanitizeText,
    sanitizeFilename,
    sanitizeJsonData,
    checkDangerousContent
  };
}

// TextSanitizer class is already exported above