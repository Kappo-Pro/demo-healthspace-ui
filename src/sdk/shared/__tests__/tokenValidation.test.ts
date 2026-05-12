/**
 * Token Validation Tests
 */

import {
	decodeToken,
	isTokenExpired,
	hasRequiredScope,
	validateTokenLocally,
	generateMockToken,
	isDevelopmentMode,
} from '../tokenValidation';

describe('tokenValidation', () => {
	describe('decodeToken', () => {
		it('should decode a valid JWT token', () => {
			// Create a mock JWT token (header.payload.signature)
			const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
			const payload = btoa(
				JSON.stringify({
					sub: 'user_123',
					customerId: 'customer_456',
					scope: ['posture'],
					exp: Math.floor(Date.now() / 1000) + 3600,
					iat: Math.floor(Date.now() / 1000),
				}),
			);
			const signature = 'mock_signature';
			const token = `${header}.${payload}.${signature}`;

			const decoded = decodeToken(token);

			expect(decoded).not.toBeNull();
			expect(decoded?.sub).toBe('user_123');
			expect(decoded?.customerId).toBe('customer_456');
			expect(decoded?.scope).toEqual(['posture']);
		});

		it('should return null for invalid token format', () => {
			const decoded = decodeToken('invalid_token');
			expect(decoded).toBeNull();
		});

		it('should return null for malformed JWT', () => {
			const decoded = decodeToken('part1.part2');
			expect(decoded).toBeNull();
		});
	});

	describe('isTokenExpired', () => {
		it('should return false for valid (non-expired) token', () => {
			const payload = {
				sub: 'user_123',
				customerId: 'customer_456',
				scope: ['posture'],
				iss: 'https://api.vitalflow.ai',
				aud: 'https://sdk.vitalflow.ai',
				exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
				iat: Math.floor(Date.now() / 1000),
				jti: 'token_id',
			};

			expect(isTokenExpired(payload)).toBe(false);
		});

		it('should return true for expired token', () => {
			const payload = {
				sub: 'user_123',
				customerId: 'customer_456',
				scope: ['posture'],
				iss: 'https://api.vitalflow.ai',
				aud: 'https://sdk.vitalflow.ai',
				exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
				iat: Math.floor(Date.now() / 1000) - 7200,
				jti: 'token_id',
			};

			expect(isTokenExpired(payload)).toBe(true);
		});
	});

	describe('hasRequiredScope', () => {
		it('should return true when token has required scope', () => {
			const payload = {
				sub: 'user_123',
				customerId: 'customer_456',
				scope: ['posture', 'rom'],
				iss: 'https://api.vitalflow.ai',
				aud: 'https://sdk.vitalflow.ai',
				exp: Math.floor(Date.now() / 1000) + 3600,
				iat: Math.floor(Date.now() / 1000),
				jti: 'token_id',
			};

			expect(hasRequiredScope(payload, 'posture')).toBe(true);
			expect(hasRequiredScope(payload, 'rom')).toBe(true);
		});

		it('should return false when token does not have required scope', () => {
			const payload = {
				sub: 'user_123',
				customerId: 'customer_456',
				scope: ['posture'],
				iss: 'https://api.vitalflow.ai',
				aud: 'https://sdk.vitalflow.ai',
				exp: Math.floor(Date.now() / 1000) + 3600,
				iat: Math.floor(Date.now() / 1000),
				jti: 'token_id',
			};

			expect(hasRequiredScope(payload, 'rom')).toBe(false);
		});
	});

	describe('validateTokenLocally', () => {
		it('should validate a mock token in development mode', () => {
			// Mock development mode
			Object.defineProperty(window, 'location', {
				value: { hostname: 'localhost' },
				writable: true,
			});

			const mockToken = generateMockToken('test_user', 'posture');
			const result = validateTokenLocally(mockToken, 'posture');

			expect(result.valid).toBe(true);
			expect(result.payload?.sub).toBe('test_user');
			expect(result.payload?.scope).toContain('posture');
		});

		it('should reject expired token', () => {
			const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
			const payload = btoa(
				JSON.stringify({
					sub: 'user_123',
					customerId: 'customer_456',
					scope: ['posture'],
					iss: 'https://api.vitalflow.ai',
					aud: 'https://sdk.vitalflow.ai',
					exp: Math.floor(Date.now() / 1000) - 3600, // Expired
					iat: Math.floor(Date.now() / 1000) - 7200,
					jti: 'token_id',
				}),
			);
			const signature = 'mock_signature';
			const token = `${header}.${payload}.${signature}`;

			const result = validateTokenLocally(token, 'posture');

			expect(result.valid).toBe(false);
			expect(result.error?.code).toBe('TOKEN_EXPIRED');
		});

		it('should reject token with insufficient scope', () => {
			const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
			const payload = btoa(
				JSON.stringify({
					sub: 'user_123',
					customerId: 'customer_456',
					scope: ['rom'], // Missing 'posture'
					iss: 'https://api.vitalflow.ai',
					aud: 'https://sdk.vitalflow.ai',
					exp: Math.floor(Date.now() / 1000) + 3600,
					iat: Math.floor(Date.now() / 1000),
					jti: 'token_id',
				}),
			);
			const signature = 'mock_signature';
			const token = `${header}.${payload}.${signature}`;

			const result = validateTokenLocally(token, 'posture');

			expect(result.valid).toBe(false);
			expect(result.error?.code).toBe('INSUFFICIENT_SCOPE');
		});

		it('should reject token with invalid audience', () => {
			const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
			const payload = btoa(
				JSON.stringify({
					sub: 'user_123',
					customerId: 'customer_456',
					scope: ['posture'],
					iss: 'https://api.vitalflow.ai',
					aud: 'https://wrong-audience.com', // Wrong audience
					exp: Math.floor(Date.now() / 1000) + 3600,
					iat: Math.floor(Date.now() / 1000),
					jti: 'token_id',
				}),
			);
			const signature = 'mock_signature';
			const token = `${header}.${payload}.${signature}`;

			const result = validateTokenLocally(token, 'posture');

			expect(result.valid).toBe(false);
			expect(result.error?.code).toBe('INVALID_AUDIENCE');
		});
	});

	describe('generateMockToken', () => {
		it('should generate a mock token with default values', () => {
			const token = generateMockToken();
			expect(token).toBe('mock_dev_user_posture');
		});

		it('should generate a mock token with custom values', () => {
			const token = generateMockToken('custom_user', 'rom');
			expect(token).toBe('mock_custom_user_rom');
		});
	});

	describe('isDevelopmentMode', () => {
		it('should return true for localhost', () => {
			Object.defineProperty(window, 'location', {
				value: { hostname: 'localhost' },
				writable: true,
			});

			expect(isDevelopmentMode()).toBe(true);
		});

		it('should return true for 127.0.0.1', () => {
			Object.defineProperty(window, 'location', {
				value: { hostname: '127.0.0.1' },
				writable: true,
			});

			expect(isDevelopmentMode()).toBe(true);
		});

		it('should return false for production domain', () => {
			Object.defineProperty(window, 'location', {
				value: { hostname: 'sdk.vitalflow.ai' },
				writable: true,
			});

			expect(isDevelopmentMode()).toBe(false);
		});
	});
});
