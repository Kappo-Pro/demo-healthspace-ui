import { v4 as uuidv4 } from 'uuid';
import { Token, TokenRecord } from '../../models/sdk/Token';
import { JWTVerifier, JWTPayload } from '../../utils/jwt';

/**
 * Token Generation Parameters
 */
export interface GenerateTokenParams {
	customerId: string; // Customer ID (subject)
	userId: string; // User identifier
	assessmentType: 'posture' | 'rom' | 'gait'; // Assessment type
	expiresIn: number; // Expiration time in seconds (default: 1800 = 30 minutes)
	theme?: {
		primary_color?: string;
		logo_url?: string;
	};
	webhookUrl?: string;
	metadata?: Record<string, unknown>;
}

/**
 * Token Generation Response
 */
export interface GenerateTokenResponse {
	token: string; // JWT token
	tokenId: string; // Token ID (jti)
	expiresAt: string; // ISO 8601 expiration timestamp
}

/**
 * TokenService - Manages JWT token generation, verification, and lifecycle
 *
 * Implements HS256 (HMAC-SHA256) signing for JWT tokens used in SDK authentication.
 * Tokens contain standard claims (iss, sub, aud, exp, iat, jti) and custom claims
 * for assessment type, user ID, theme, and webhook configuration.
 *
 * @example
 * ```typescript
 * const tokenService = new TokenService();
 * const result = await tokenService.generateToken({
 *   customerId: 'cust_123',
 *   userId: 'user_456',
 *   assessmentType: 'posture',
 *   expiresIn: 1800,
 *   theme: { primary_color: '#0066CC' },
 * });
 *  // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * ```
 */
export class TokenService {
	private jwtSecret: string;
	private issuer: string;
	private audience: string;

	constructor() {
		// JWT_SECRET must be at least 32 characters for security
		this.jwtSecret =
			process.env.REACT_APP_JWT_SECRET ||
			process.env.JWT_SECRET ||
			this.throwError('JWT_SECRET not configured');

		if (this.jwtSecret.length < 32) {
			this.throwError('JWT_SECRET must be at least 32 characters');
		}

		this.issuer = 'vitalflow.com';
		this.audience = 'sdk.vitalflow.ai';
	}

	/**
	 * Generate JWT token with HS256 signature
	 *
	 * Creates a cryptographically signed JWT token with:
	 * - Standard claims: iss, sub, aud, exp, iat, jti
	 * - Custom claims: assessment_type, user_id, theme, webhook_url, metadata
	 *
	 * The token is also stored in the database for state tracking.
	 *
	 * @param params - Token generation parameters
	 * @returns Generated token with metadata
	 */
	async generateToken(
		params: GenerateTokenParams,
	): Promise<GenerateTokenResponse> {
		// Generate unique token ID with 'tok_' prefix
		const tokenId = `tok_${uuidv4().replace(/-/g, '')}`;

		// Calculate timestamps
		const now = Math.floor(Date.now() / 1000);
		const expiresAt = now + params.expiresIn;

		// Build JWT payload with all required claims
		const payload: JWTPayload = {
			// Standard claims (RFC 7519)
			iss: this.issuer,
			sub: params.customerId,
			aud: this.audience,
			exp: expiresAt,
			iat: now,
			jti: tokenId,

			// Custom claims (VitalFlow-specific)
			assessment_type: params.assessmentType,
			user_id: params.userId,
		};

		// Add optional claims
		if (params.theme) {
			payload.theme = params.theme;
		}

		if (params.webhookUrl) {
			payload.webhook_url = params.webhookUrl;
		}

		if (params.metadata) {
			payload.metadata = params.metadata;
		}

		// Sign JWT with HS256
		const token = JWTVerifier.sign(payload, this.jwtSecret);

		// Save to database (mock implementation)
		await Token.create({
			id: tokenId,
			customer_id: params.customerId,
			user_id: params.userId,
			assessment_type: params.assessmentType,
			status: 'pending',
			expires_at: new Date(expiresAt * 1000),
			webhook_url: params.webhookUrl,
			metadata: params.metadata,
		});

		return {
			token,
			tokenId,
			expiresAt: new Date(expiresAt * 1000).toISOString(),
		};
	}

	/**
	 * Verify JWT signature and decode payload
	 *
	 * Basic signature verification. Full validation (expiry, revocation, etc.)
	 * will be implemented in SDK-008.
	 *
	 * @param token - JWT token string
	 * @returns Decoded payload if signature is valid, null otherwise
	 */
	verifySignature(token: string): JWTPayload | null {
		return JWTVerifier.verify(token, this.jwtSecret);
	}

	/**
	 * Decode JWT without verification (for debugging)
	 *
	 * WARNING: Does not verify signature! Use only for inspection.
	 *
	 * @param token - JWT token string
	 * @returns Decoded payload or null if malformed
	 */
	decode(token: string): JWTPayload | null {
		return JWTVerifier.decode(token);
	}

	/**
	 * Check if token is expired
	 *
	 * @param token - JWT token string
	 * @returns true if expired, false otherwise
	 */
	isExpired(token: string): boolean {
		const payload = this.decode(token);
		return JWTVerifier.isExpired(payload);
	}

	/**
	 * Get token record from database
	 *
	 * @param tokenId - Token ID (jti)
	 * @returns Token record or null if not found
	 */
	async getTokenRecord(tokenId: string): Promise<TokenRecord | null> {
		return Token.findById(tokenId);
	}

	/**
	 * Update token status
	 *
	 * @param tokenId - Token ID (jti)
	 * @param status - New status
	 * @returns Updated token record or null if not found
	 */
	async updateTokenStatus(
		tokenId: string,
		status: TokenRecord['status'],
	): Promise<TokenRecord | null> {
		return Token.updateStatus(tokenId, status);
	}

	/**
	 * Throw configuration error
	 *
	 * @param message - Error message
	 */
	private throwError(message: string): never {
		throw new Error(`[TokenService] ${message}`);
	}
}
