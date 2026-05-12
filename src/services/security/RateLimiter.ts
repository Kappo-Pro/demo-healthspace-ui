/**
 * RateLimiter Service
 *
 * Prevents DoS attacks via command registration flooding using a sliding window
 * rate limiting algorithm.
 *
 * Features:
 * - Sliding window rate limiting (50 registrations per 100ms)
 * - Maximum total commands limit (500)
 * - Automatic window cleanup
 * - Clear error messages for rate limit violations
 *
 * @module RateLimiter
 */

/**
 * Configuration interface for RateLimiter
 */
export interface RateLimiterConfig {
  /** Maximum registrations allowed per window */
  maxPerWindow: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Maximum total commands allowed */
  maxTotal: number;
}

/**
 * Custom error thrown when rate limit is exceeded
 */
export class RateLimitError extends Error {
  constructor(count: number, windowMs: number) {
    super(`Rate limit exceeded: ${count} registrations in ${windowMs}ms`);
    this.name = 'RateLimitError';
  }
}

/**
 * Custom error thrown when maximum commands limit is reached
 */
export class MaxCommandsError extends Error {
  constructor(max: number) {
    super(`Maximum commands limit reached: ${max} commands`);
    this.name = 'MaxCommandsError';
  }
}

/**
 * RateLimiter service implementation using sliding window algorithm
 */
class RateLimiterService {
  private config: RateLimiterConfig;
  private registrations: number[] = []; // Timestamps of registrations in current window
  private totalRegistrations = 0; // Total number of registrations

  /**
   * Initialize RateLimiter with configuration
   * @param config - Rate limiter configuration (defaults: 50/100ms, 500 max)
   */
  constructor(config: RateLimiterConfig = {
    maxPerWindow: 50,
    windowMs: 100,
    maxTotal: 500,
  }) {
    this.config = config;
  }

  /**
   * Clean expired timestamps from sliding window
   * Removes timestamps older than the current window
   * @private
   */
  private cleanExpiredTimestamps(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    this.registrations = this.registrations.filter(
      timestamp => timestamp > windowStart
    );
  }

  /**
   * Check if registration is within rate limits
   * @returns true if registration is allowed, false otherwise
   */
  checkLimit(): boolean {
    this.cleanExpiredTimestamps();

    // Check window limit
    if (this.registrations.length >= this.config.maxPerWindow) {
      return false;
    }

    // Check total limit
    if (this.totalRegistrations >= this.config.maxTotal) {
      return false;
    }

    return true;
  }

  /**
   * Register a new command with rate limiting
   * @throws {RateLimitError} if window rate limit is exceeded
   * @throws {MaxCommandsError} if total commands limit is exceeded
   */
  register(): void {
    this.cleanExpiredTimestamps();

    // Check window limit
    if (this.registrations.length >= this.config.maxPerWindow) {
      throw new RateLimitError(this.registrations.length, this.config.windowMs);
    }

    // Check total limit
    if (this.totalRegistrations >= this.config.maxTotal) {
      throw new MaxCommandsError(this.config.maxTotal);
    }

    // Register
    this.registrations.push(Date.now());
    this.totalRegistrations++;
  }

  /**
   * Get remaining registration slots in current window
   * @returns Number of remaining slots (0 if total limit reached)
   */
  getRemainingSlots(): number {
    this.cleanExpiredTimestamps();

    if (this.totalRegistrations >= this.config.maxTotal) {
      return 0;
    }

    return this.config.maxPerWindow - this.registrations.length;
  }

  /**
   * Reset rate limiter state
   * Primarily used for testing purposes
   */
  reset(): void {
    this.registrations = [];
    this.totalRegistrations = 0;
  }
}

/**
 * Singleton instance of RateLimiter service
 * Export this instance to ensure consistent rate limiting across the application
 */
export const RateLimiter = new RateLimiterService();
