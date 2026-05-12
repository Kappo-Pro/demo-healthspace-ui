import jwt from 'jsonwebtoken';

/**
 * JWT Test Helper - Utilities for testing JWT functionality
 *
 * Provides methods to create, decode, and tamper with JWT tokens
 * for comprehensive test coverage.
 *
 * @module tests/helpers/jwt
 */
export class JWTTestHelper {
	/**
	 * Create a test JWT token
	 *
	 * @param payload - Payload to sign
	 * @param secret - Secret key (default: 'test_secret_key_minimum_32_characters_long')
	 * @returns Signed JWT token
	 */
	static createTestToken(
		payload: Record<string, unknown>,
		secret = 'test_secret_key_minimum_32_characters_long',
	): string {
		return jwt.sign(payload, secret, { algorithm: 'HS256' });
	}

	/**
	 * Decode token with complete header and signature
	 *
	 * @param token - JWT token string
	 * @returns Decoded token with header, payload, signature
	 */
	static decodeToken(token: string): jwt.Jwt | null {
		return jwt.decode(token, { complete: true });
	}

	/**
	 * Tamper with token payload (invalidates signature)
	 *
	 * Modifies the payload to add a 'tampered' field, which breaks
	 * the signature verification. Used to test signature validation.
	 *
	 * @param token - Original valid token
	 * @returns Tampered token with invalid signature
	 */
	static tamperWithToken(token: string): string {
		const parts = token.split('.');
		if (parts.length !== 3) {
			throw new Error('Invalid JWT format');
		}

		// Decode payload
		const payloadBuffer = Buffer.from(parts[1], 'base64url');
		const payload = JSON.parse(payloadBuffer.toString());

		// Add tampered field
		payload.tampered = true;

		// Re-encode payload (signature will be invalid)
		parts[1] = Buffer.from(JSON.stringify(payload)).toString('base64url');

		return parts.join('.');
	}

	/**
	 * Create expired token (exp in the past)
	 *
	 * @param payload - Payload to sign
	 * @param secret - Secret key
	 * @returns Expired JWT token
	 */
	static createExpiredToken(
		payload: Record<string, unknown>,
		secret = 'test_secret_key_minimum_32_characters_long',
	): string {
		const now = Math.floor(Date.now() / 1000);
		const expiredPayload = {
			...payload,
			iat: now - 7200, // Issued 2 hours ago
			exp: now - 3600, // Expired 1 hour ago
		};

		return jwt.sign(expiredPayload, secret, { algorithm: 'HS256' });
	}

	/**
	 * Create token with custom expiry
	 *
	 * @param payload - Payload to sign
	 * @param expiresInSeconds - Seconds until expiration
	 * @param secret - Secret key
	 * @returns JWT token with custom expiry
	 */
	static createTokenWithExpiry(
		payload: Record<string, unknown>,
		expiresInSeconds: number,
		secret = 'test_secret_key_minimum_32_characters_long',
	): string {
		const now = Math.floor(Date.now() / 1000);
		const tokenPayload = {
			...payload,
			iat: now,
			exp: now + expiresInSeconds,
		};

		return jwt.sign(tokenPayload, secret, { algorithm: 'HS256' });
	}

	/**
	 * Create malformed token (invalid format)
	 *
	 * @returns Malformed token string
	 */
	static createMalformedToken(): string {
		return 'not.a.valid.jwt.token';
	}

	/**
	 * Extract header from token
	 *
	 * @param token - JWT token string
	 * @returns Decoded header or null
	 */
	static getHeader(token: string): Record<string, unknown> | null {
		const decoded = this.decodeToken(token);
		return decoded ? (decoded.header as Record<string, unknown>) : null;
	}

	/**
	 * Extract payload from token
	 *
	 * @param token - JWT token string
	 * @returns Decoded payload or null
	 */
	static getPayload(token: string): Record<string, unknown> | null {
		const decoded = this.decodeToken(token);
		return decoded ? (decoded.payload as Record<string, unknown>) : null;
	}
}
