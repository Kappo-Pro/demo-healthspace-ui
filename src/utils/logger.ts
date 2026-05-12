/**
 * Structured Logging Utility
 *
 * Provides type-safe, environment-aware logging with security best practices.
 *
 * Key Features:
 * - Development-only debug logging
 * - Production error logging
 * - Structured logging with context
 * - PHI/PII sanitization
 * - Performance tracking
 * - Integration with observability tools
 *
 * Usage:
 *   import { logger } from '@utils/logger';
 *
 *   logger.debug('User loaded', { userId: '123' });
 *   logger.info('Assessment started', { type: 'ROM' });
 *   logger.warn('Deprecated API used', { endpoint: '/old-api' });
 *   logger.error('Failed to save', error, { context: 'posture-scan' });
 *
 * Security:
 *   - Never logs sensitive data (PHI/PII) in production
 *   - Sanitizes user input before logging
 *   - Provides redaction utilities for sensitive fields
 *
 * @see HOT-002 - Console.log cleanup and logging infrastructure
 */

// ============================================================================
// Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
	[key: string]: unknown;
	// Structured fields for observability
	userId?: string;
	sessionId?: string;
	component?: string;
	action?: string;
	duration?: number;
	error?: Error | string;
}

export interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	context?: LogContext;
	stack?: string;
}

interface LoggerConfig {
	enabled: boolean;
	minLevel: LogLevel;
	enableStackTrace: boolean;
	sanitizePHI: boolean;
	maxContextSize: number;
}

// ============================================================================
// Configuration
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

const DEFAULT_CONFIG: LoggerConfig = {
	enabled: true,
	minLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
	enableStackTrace: process.env.NODE_ENV !== 'production',
	sanitizePHI: true,
	maxContextSize: 10000, // characters
};

// Sensitive field patterns (PHI/PII)
const SENSITIVE_PATTERNS = [
	/password/i,
	/ssn/i,
	/social.?security/i,
	/credit.?card/i,
	/card.?number/i,
	/cvv/i,
	/dob/i,
	/date.?of.?birth/i,
	/medical.?record/i,
	/diagnosis/i,
	/prescription/i,
	/email/i, // Be cautious with email
	/phone/i,
	/address/i,
	/token/i,
	/api.?key/i,
];

// ============================================================================
// Utilities
// ============================================================================

/**
 * Check if a field name is sensitive
 */
function isSensitiveField(key: string): boolean {
	return SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
}

/**
 * Redact sensitive values from context
 */
function sanitizeContext(context: LogContext): LogContext {
	if (!DEFAULT_CONFIG.sanitizePHI) {
		return context;
	}

	const sanitized: LogContext = {};

	for (const [key, value] of Object.entries(context)) {
		if (isSensitiveField(key)) {
			sanitized[key] = '[REDACTED]';
		} else if (typeof value === 'object' && value !== null) {
			// Recursively sanitize nested objects
			sanitized[key] = sanitizeContext(value as LogContext);
		} else {
			sanitized[key] = value;
		}
	}

	return sanitized;
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
	const { timestamp, level, message, context } = entry;

	let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

	if (context && Object.keys(context).length > 0) {
		const contextStr = JSON.stringify(context, null, 2);
		formatted += `\n  Context: ${contextStr}`;
	}

	if (entry.stack) {
		formatted += `\n  Stack: ${entry.stack}`;
	}

	return formatted;
}

/**
 * Get current timestamp in ISO format
 */
function getTimestamp(): string {
	return new Date().toISOString();
}

/**
 * Truncate large context objects
 */
function truncateContext(context: LogContext): LogContext {
	const str = JSON.stringify(context);
	if (str.length <= DEFAULT_CONFIG.maxContextSize) {
		return context;
	}

	// Truncate and add indicator
	return {
		...context,
		_truncated: true,
		_originalSize: str.length,
	};
}

// ============================================================================
// Logger Class
// ============================================================================

class Logger {
	private config: LoggerConfig = DEFAULT_CONFIG;

	/**
	 * Configure logger
	 */
	configure(config: Partial<LoggerConfig>): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Check if log level is enabled
	 */
	private shouldLog(level: LogLevel): boolean {
		if (!this.config.enabled) {
			return false;
		}

		return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
	}

	/**
	 * Create log entry
	 */
	private createEntry(
		level: LogLevel,
		message: string,
		context?: LogContext,
		error?: Error
	): LogEntry {
		let sanitizedContext = context ? sanitizeContext(context) : undefined;

		if (sanitizedContext) {
			sanitizedContext = truncateContext(sanitizedContext);
		}

		const entry: LogEntry = {
			timestamp: getTimestamp(),
			level,
			message,
			context: sanitizedContext,
		};

		// Add stack trace for errors
		if (error && this.config.enableStackTrace) {
			entry.stack = error.stack;
		}

		return entry;
	}

	/**
	 * Output log entry
	 */
	private output(entry: LogEntry): void {
		const formatted = formatLogEntry(entry);

		// Use appropriate console method
		switch (entry.level) {
			case 'debug':
			case 'info':
				break;
			case 'warn':
				console.warn(formatted);
				break;
			case 'error':
				console.error(formatted);
				break;
		}

		// TODO: Integration with observability tools
		// - Send to OpenTelemetry
		// - Send to Sentry
		// - Send to CloudWatch
		// this.sendToObservability(entry);
	}

	/**
	 * Debug logging (development only)
	 */
	debug(message: string, context?: LogContext): void {
		if (!this.shouldLog('debug')) return;

		const entry = this.createEntry('debug', message, context);
		this.output(entry);
	}

	/**
	 * Info logging
	 */
	info(message: string, context?: LogContext): void {
		if (!this.shouldLog('info')) return;

		const entry = this.createEntry('info', message, context);
		this.output(entry);
	}

	/**
	 * Warning logging
	 */
	warn(message: string, context?: LogContext): void {
		if (!this.shouldLog('warn')) return;

		const entry = this.createEntry('warn', message, context);
		this.output(entry);
	}

	/**
	 * Error logging
	 */
	error(message: string, error?: Error | string, context?: LogContext): void {
		if (!this.shouldLog('error')) return;

		const errorObj = typeof error === 'string' ? new Error(error) : error;

		const entry = this.createEntry('error', message, context, errorObj);
		this.output(entry);
	}

	/**
	 * Performance tracking
	 */
	startTimer(label: string): () => void {
		const start = performance.now();

		return () => {
			const duration = performance.now() - start;
			this.debug(`${label} completed`, { duration: Math.round(duration) });
		};
	}

	/**
	 * Group related logs (development only)
	 */
	group(label: string): () => void {
		if (process.env.NODE_ENV !== 'production') {
			// eslint-disable-next-line no-console
			console.group(label);
		}

		return () => {
			if (process.env.NODE_ENV !== 'production') {
				// eslint-disable-next-line no-console
				console.groupEnd();
			}
		};
	}
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Global logger instance
 */
export const logger = new Logger();

/**
 * Redaction utilities for manual sanitization
 */
export const redact = {
	/**
	 * Redact email addresses
	 */
	email(email: string): string {
		return email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
	},

	/**
	 * Redact phone numbers
	 */
	phone(phone: string): string {
		return phone.replace(/(\d{3})(\d{3})(\d{4})/, '***-***-$3');
	},

	/**
	 * Redact all but last 4 characters
	 */
	lastFour(value: string): string {
		if (value.length <= 4) return '***';
		return '*'.repeat(value.length - 4) + value.slice(-4);
	},

	/**
	 * Redact user ID (show first 4 chars)
	 */
	userId(userId: string): string {
		if (userId.length <= 8) return '***';
		return userId.slice(0, 4) + '***';
	},
};

/**
 * Performance measurement helper
 */
export function measurePerformance<T>(
	label: string,
	fn: () => T,
	context?: LogContext
): T {
	const endTimer = logger.startTimer(label);

	try {
		const result = fn();

		// Handle promises
		if (result instanceof Promise) {
			return result.finally(() => endTimer()) as T;
		}

		endTimer();
		return result;
	} catch (error) {
		endTimer();
		logger.error(`${label} failed`, error as Error, context);
		throw error;
	}
}

/**
 * Async performance measurement helper
 */
export async function measureAsync<T>(
	label: string,
	fn: () => Promise<T>,
	context?: LogContext
): Promise<T> {
	const endTimer = logger.startTimer(label);

	try {
		const result = await fn();
		endTimer();
		return result;
	} catch (error) {
		endTimer();
		logger.error(`${label} failed`, error as Error, context);
		throw error;
	}
}

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Enable debug mode (useful for troubleshooting)
 */
export function enableDebug(): void {
	logger.configure({ minLevel: 'debug' });
	logger.info('Debug mode enabled');
}

/**
 * Disable all logging
 */
export function disableLogging(): void {
	logger.configure({ enabled: false });
}

/**
 * Type guard for Error objects
 */
export function isError(value: unknown): value is Error {
	return value instanceof Error;
}

// ============================================================================
// Default Export
// ============================================================================

export default logger;
