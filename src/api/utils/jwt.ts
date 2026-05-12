import * as jwt from 'jsonwebtoken';

/**
 * JWT Verification and Utility Functions
 *
 * Provides cryptographic signing, verification, and decoding for JWT tokens.
 * Uses HS256 (HMAC with SHA-256) algorithm for symmetric key signing.
 *
 * @module api/utils/jwt
 */

export interface JWTPayload {
	// Standard claims (RFC 7519)
	iss: string; // Issuer
	sub: string; // Subject (customer ID)
	aud: string; // Audience
	exp: number; // Expiration time (Unix timestamp)
	iat: number; // Issued at (Unix timestamp)
	jti: string; // JWT ID (token ID)

	// Custom claims (VitalFlow-specific)
	assessment_type: string;
	user_id: string;
	theme?: {
		primary_color?: string;
		logo_url?: string;
	};
	webhook_url?: string;
	metadata?: Record<string, unknown>;
}

/**
 * JWT Verifier - Handles verification, decoding, and validation of JWT tokens
 */
export class JWTVerifier {
	/**
	 * Verify JWT signature and return decoded payload
	 *
	 * @param token - JWT token string
	 * @param secret - Secret key for verification
	 * @returns Decoded payload if valid, null otherwise
	 */
	static verify(token: string, secret: string): JWTPayload | null {
		try {
			const decoded = jwt.verify(token, secret, {
				algorithms: ['HS256'],
			}) as JWTPayload;

			return decoded;
		} catch (error) {
			// Invalid signature, expired, malformed, etc.
			return null;
		}
	}

	/**
	 * Decode JWT without verifying signature (for debugging/inspection)
	 *
	 * WARNING: Does not verify signature! Use only for inspection.
	 *
	 * @param token - JWT token string
	 * @returns Decoded payload or null if malformed
	 */
	static decode(token: string): JWTPayload | null {
		try {
			return jwt.decode(token) as JWTPayload;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Check if JWT payload is expired
	 *
	 * @param payload - Decoded JWT payload
	 * @returns true if expired, false otherwise
	 */
	static isExpired(payload: JWTPayload | null): boolean {
		if (!payload || !payload.exp) return true;
		const now = Math.floor(Date.now() / 1000);
		return payload.exp < now;
	}

	/**
	 * Sign JWT with HS256 algorithm
	 *
	 * @param payload - Payload to sign
	 * @param secret - Secret key for signing
	 * @returns Signed JWT token
	 */
	static sign(payload: JWTPayload, secret: string): string {
		return jwt.sign(payload, secret, {
			algorithm: 'HS256',
		});
	}

	/**
	 * Get full decoded token with header and signature
	 *
	 * @param token - JWT token string
	 * @returns Complete decoded token or null
	 */
	static decodeComplete(token: string): jwt.JwtPayload | null {
		try {
			return jwt.decode(token, { complete: true });
		} catch (error) {
			return null;
		}
	}
}
