/**
 * SDK Token Validation
 *
 * Validates JWT tokens for SDK routes.
 * In production, tokens are validated by the backend.
 * In development (localhost), we support mock tokens for testing.
 */

export interface TokenPayload {
	sub: string; // User ID
	customerId: string; // Customer organization ID
	scope: string[]; // Allowed SDK features
	iss: string; // Issuer (API URL)
	aud: string; // Audience (SDK URL)
	exp: number; // Expiration timestamp
	iat: number; // Issued at timestamp
	jti: string; // Token ID
}

export interface TokenValidationResult {
	valid: boolean;
	payload?: TokenPayload;
	error?: {
		code: string;
		message: string;
	};
}

/**
 * Check if we're in development mode (localhost)
 */
export function isDevelopmentMode(): boolean {
	return (
		window.location.hostname === 'localhost' ||
		window.location.hostname === '127.0.0.1'
	);
}

/**
 * Extract token from URL parameters or Authorization header
 */
export function extractToken(): string | null {
	// Check URL parameters first (for development/testing)
	const urlParams = new URLSearchParams(window.location.search);
	const tokenFromUrl = urlParams.get('token');

	if (tokenFromUrl) {
		return tokenFromUrl;
	}

	// In production, token would be passed via postMessage from parent
	// For now, we'll check sessionStorage (set by parent frame)
	const tokenFromStorage = sessionStorage.getItem('sdk_token');

	return tokenFromStorage;
}

/**
 * Decode JWT token (without verification - server will verify)
 */
export function decodeToken(token: string): TokenPayload | null {
	try {
		// JWT format: header.payload.signature
		const parts = token.split('.');

		if (parts.length !== 3) {
			return null;
		}

		// Decode base64url encoded payload
		const payload = parts[1];
		const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

		return JSON.parse(decoded);
	} catch (error) {
		return null;
	}
}

/**
 * Check if token is expired
 */
export function isTokenExpired(payload: TokenPayload): boolean {
	const now = Math.floor(Date.now() / 1000);
	return payload.exp < now;
}

/**
 * Check if token has required scope
 */
export function hasRequiredScope(
	payload: TokenPayload,
	requiredScope: string,
): boolean {
	return payload.scope.includes(requiredScope);
}

/**
 * Validate token locally (basic checks)
 * Note: Full cryptographic validation happens on the backend
 */
export function validateTokenLocally(
	token: string,
	requiredScope = 'posture',
): TokenValidationResult {
	// Development bypass: Allow mock tokens
	if (isDevelopmentMode() && token.startsWith('mock_')) {
		return createMockValidationResult(token);
	}

	// Decode token
	const payload = decodeToken(token);

	if (!payload) {
		return {
			valid: false,
			error: {
				code: 'INVALID_TOKEN_FORMAT',
				message: 'Invalid token format',
			},
		};
	}

	// Check expiration
	if (isTokenExpired(payload)) {
		return {
			valid: false,
			error: {
				code: 'TOKEN_EXPIRED',
				message: 'Token has expired',
			},
		};
	}

	// Check scope
	if (!hasRequiredScope(payload, requiredScope)) {
		return {
			valid: false,
			error: {
				code: 'INSUFFICIENT_SCOPE',
				message: `Token does not have required scope: ${requiredScope}`,
			},
		};
	}

	// Check audience (should be SDK URL)
	const expectedAudience = isDevelopmentMode()
		? 'http://localhost:3000'
		: 'https://sdk.vitalflow.ai';

	if (payload.aud !== expectedAudience) {
		return {
			valid: false,
			error: {
				code: 'INVALID_AUDIENCE',
				message: 'Token audience does not match SDK URL',
			},
		};
	}

	return {
		valid: true,
		payload,
	};
}

/**
 * Create mock validation result for development
 */
function createMockValidationResult(mockToken: string): TokenValidationResult {
	// Extract user ID from mock token: mock_userId_scope
	// Example: mock_user123_posture
	const parts = mockToken.replace('mock_', '').split('_');
	const userId = parts[0] || 'dev_user';
	const scope = parts[1] || 'posture';

	const now = Math.floor(Date.now() / 1000);

	return {
		valid: true,
		payload: {
			sub: userId,
			customerId: 'dev_customer',
			scope: [scope],
			iss: 'http://localhost:4000',
			aud: 'http://localhost:3000',
			exp: now + 3600, // 1 hour from now
			iat: now,
			jti: `mock_${Date.now()}`,
		},
	};
}

/**
 * Store token in sessionStorage for SDK routes
 */
export function storeToken(token: string): void {
	sessionStorage.setItem('sdk_token', token);
}

/**
 * Clear stored token
 */
export function clearToken(): void {
	sessionStorage.removeItem('sdk_token');
}

/**
 * Get stored token
 */
export function getStoredToken(): string | null {
	return sessionStorage.getItem('sdk_token');
}

/**
 * Generate mock token for development/testing
 */
export function generateMockToken(
	userId = 'dev_user',
	scope = 'posture',
): string {
	return `mock_${userId}_${scope}`;
}

/**
 * Refresh token (placeholder - actual implementation depends on backend)
 */
export async function refreshToken(
	currentToken: string,
): Promise<string | null> {
	// In development, just generate a new mock token
	if (isDevelopmentMode() && currentToken.startsWith('mock_')) {
		const payload = decodeToken(currentToken);
		if (payload) {
			return generateMockToken(payload.sub, payload.scope[0]);
		}
	}

	// In production, this would call the backend API to refresh the token
	// For now, return null (not implemented)
	console.warn('Token refresh not implemented yet');
	return null;
}
