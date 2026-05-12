/**
 * Security Services Barrel Export
 *
 * Central export point for all security-related services.
 *
 * Services:
 * - HtmlSanitizer: XSS prevention for rich-text content (consent forms, descriptions)
 * - InputSanitizer: XSS prevention for command palette input
 * - AuditLogService: Tamper-proof audit logging for HIPAA compliance
 * - RateLimiter: DoS prevention for command registration
 */

// HTML Sanitizer - Rich-text content sanitization
export { HtmlSanitizer } from './HtmlSanitizer';

// Input Sanitizer - Command palette input sanitization
export { InputSanitizer } from './InputSanitizer';

// Audit Log Service - Tamper-proof logging with hash chain
export { AuditLogService } from './AuditLogService';
export type { AuditLogEntry } from './AuditLogService';

// Rate Limiter - DoS prevention
export { RateLimiter, RateLimitError, MaxCommandsError } from './RateLimiter';
export type { RateLimiterConfig } from './RateLimiter';
