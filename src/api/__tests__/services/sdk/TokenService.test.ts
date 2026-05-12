// Mock uuid module - MUST be first
jest.mock('uuid', () => ({
	v4: () => 'testuuid12345678901234563456',
}));

import jwt from 'jsonwebtoken';
import { TokenService } from '../../../services/sdk/TokenService';
import { Token } from '../../../models/sdk/Token';
import { JWTTestHelper } from '../../helpers/jwt';

/**
 * TokenService Test Suite - JWT Structure and HS256 Signing
 *
 * Tests cover:
 * - JWT header structure (alg: HS256, typ: JWT)
 * - Standard claims (iss, sub, aud, exp, iat, jti)
 * - Custom claims (assessment_type, user_id, theme, webhook_url, metadata)
 * - Signature verification (valid, tampered, wrong secret)
 * - Token expiration
 * - Edge cases (malformed, expired, invalid)
 */
describe('TokenService - JWT Signing', () => {
	let tokenService;
	const testSecret = 'test_secret_key_minimum_32_characters_long';

	beforeAll(() => {
		// Set test JWT secret
		process.env.REACT_APP_JWT_SECRET = testSecret;
	});

	beforeEach(() => {
		tokenService = new TokenService();
		// Clear token database before each test
		Token.clear();
	});

	afterEach(async () => {
		await Token.clear();
	});

	describe('JWT Header', () => {
		it('should generate JWT with correct header (alg: HS256, typ: JWT)', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const decoded = JWTTestHelper.decodeToken(result.token);
			expect(decoded).not.toBeNull();
			expect(decoded?.header).toMatchObject({
				alg: 'HS256',
				typ: 'JWT',
			});
		});
	});

	describe('Standard Claims (RFC 7519)', () => {
		it('should include all required standard claims', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const decoded = jwt.decode(result.token);

			// Standard claims
			expect(decoded.iss).toBe('vitalflow.com');
			expect(decoded.sub).toBe('cust_123');
			expect(decoded.aud).toBe('sdk.vitalflow.ai');
			expect(decoded.exp).toBeDefined();
			expect(decoded.iat).toBeDefined();
			expect(decoded.jti).toBeDefined();
			expect(decoded.jti).toBe('tok_testuuid12345678901234563456');
		});

		it('should have correct expiration timestamp', async () => {
			const beforeTime = Math.floor(Date.now() / 1000);

			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const afterTime = Math.floor(Date.now() / 1000);
			const decoded = jwt.decode(result.token);

			// exp should be iat + expiresIn (1800 seconds)
			expect(decoded.exp).toBeGreaterThanOrEqual(beforeTime + 1800);
			expect(decoded.exp).toBeLessThanOrEqual(afterTime + 1800);
			expect(decoded.exp - decoded.iat).toBe(1800);
		});

		it('should have correct issued-at timestamp', async () => {
			const beforeTime = Math.floor(Date.now() / 1000);

			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const afterTime = Math.floor(Date.now() / 1000);
			const decoded = jwt.decode(result.token);

			expect(decoded.iat).toBeGreaterThanOrEqual(beforeTime);
			expect(decoded.iat).toBeLessThanOrEqual(afterTime);
		});
	});

	describe('Custom Claims', () => {
		it('should include custom claims (assessment_type, user_id)', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const decoded = jwt.decode(result.token);

			expect(decoded.assessment_type).toBe('posture');
			expect(decoded.user_id).toBe('user_456');
		});

		it('should include optional theme claim when provided', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
				theme: {
					primary_color: '#0066CC',
					logo_url: 'https://example.com/logo.png',
				},
			});

			const decoded = jwt.decode(result.token);

			expect(decoded.theme).toMatchObject({
				primary_color: '#0066CC',
				logo_url: 'https://example.com/logo.png',
			});
		});

		it('should include optional webhook_url claim when provided', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
				webhookUrl: 'https://example.com/webhook',
			});

			const decoded = jwt.decode(result.token);

			expect(decoded.webhook_url).toBe('https://example.com/webhook');
		});

		it('should include optional metadata claim when provided', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
				metadata: {
					patient_name: 'John Doe',
					session_id: 'session_789',
				},
			});

			const decoded = jwt.decode(result.token);

			expect(decoded.metadata).toMatchObject({
				patient_name: 'John Doe',
				session_id: 'session_789',
			});
		});

		it('should omit optional claims when not provided', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const decoded = jwt.decode(result.token);

			expect(decoded.theme).toBeUndefined();
			expect(decoded.webhook_url).toBeUndefined();
			expect(decoded.metadata).toBeUndefined();
		});

		it('should support all assessment types', async () => {
			const assessmentTypes: Array<'posture' | 'rom' | 'gait'> = [
				'posture',
				'rom',
				'gait',
			];

			for (const assessmentType of assessmentTypes) {
				const result = await tokenService.generateToken({
					customerId: 'cust_123',
					userId: 'user_456',
					assessmentType,
					expiresIn: 1800,
				});

				const decoded = jwt.decode(result.token);
				expect(decoded.assessment_type).toBe(assessmentType);
			}
		});
	});

	describe('Signature Verification', () => {
		it('should verify valid signature', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const payload = tokenService.verifySignature(result.token);

			expect(payload).not.toBeNull();
			expect(payload?.sub).toBe('cust_123');
			expect(payload?.user_id).toBe('user_456');
		});

		it('should reject tampered signature', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const tamperedToken = JWTTestHelper.tamperWithToken(result.token);
			const payload = tokenService.verifySignature(tamperedToken);

			expect(payload).toBeNull();
		});

		it('should reject token with wrong secret', async () => {
			const wrongSecret = 'wrong_secret_key_minimum_32_characters';
			const token = JWTTestHelper.createTestToken(
				{
					sub: 'test',
					iss: 'vitalflow.com',
					aud: 'sdk.vitalflow.ai',
				},
				wrongSecret,
			);

			const payload = tokenService.verifySignature(token);

			expect(payload).toBeNull();
		});

		it('should reject malformed token', () => {
			const malformedToken = JWTTestHelper.createMalformedToken();
			const payload = tokenService.verifySignature(malformedToken);

			expect(payload).toBeNull();
		});

		it('should reject expired token', async () => {
			const expiredToken = JWTTestHelper.createExpiredToken(
				{
					sub: 'cust_123',
					iss: 'vitalflow.com',
					aud: 'sdk.vitalflow.ai',
				},
				testSecret,
			);

			const payload = tokenService.verifySignature(expiredToken);

			// verifySignature rejects expired tokens
			expect(payload).toBeNull();
		});
	});

	describe('Token Decoding', () => {
		it('should decode token without verification', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const decoded = tokenService.decode(result.token);

			expect(decoded).not.toBeNull();
			expect(decoded?.sub).toBe('cust_123');
		});

		it('should decode tampered token (without verifying)', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const tamperedToken = JWTTestHelper.tamperWithToken(result.token);
			const decoded = tokenService.decode(tamperedToken);

			// decode() doesn't verify signature, so it succeeds
			expect(decoded).not.toBeNull();
			expect((decoded as any).tampered).toBe(true);
		});

		it('should return null for malformed token', () => {
			const malformedToken = JWTTestHelper.createMalformedToken();
			const decoded = tokenService.decode(malformedToken);

			expect(decoded).toBeNull();
		});
	});

	describe('Token Expiration', () => {
		it('should correctly identify expired token', async () => {
			const expiredToken = JWTTestHelper.createExpiredToken(
				{
					sub: 'cust_123',
					iss: 'vitalflow.com',
					aud: 'sdk.vitalflow.ai',
				},
				testSecret,
			);

			const isExpired = tokenService.isExpired(expiredToken);

			expect(isExpired).toBe(true);
		});

		it('should correctly identify non-expired token', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const isExpired = tokenService.isExpired(result.token);

			expect(isExpired).toBe(false);
		});

		it('should handle token without exp claim', () => {
			const tokenWithoutExp = JWTTestHelper.createTestToken(
				{
					sub: 'cust_123',
					// No exp claim
				},
				testSecret,
			);

			const isExpired = tokenService.isExpired(tokenWithoutExp);

			expect(isExpired).toBe(true); // Should be treated as expired
		});
	});

	describe('Database Integration', () => {
		it('should save token to database', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const record = await tokenService.getTokenRecord(result.tokenId);

			expect(record).not.toBeNull();
			expect(record?.id).toBe(result.tokenId);
			expect(record?.customer_id).toBe('cust_123');
			expect(record?.user_id).toBe('user_456');
			expect(record?.assessment_type).toBe('posture');
			expect(record?.status).toBe('pending');
		});

		it('should save optional fields to database', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
				webhookUrl: 'https://example.com/webhook',
				metadata: { session_id: 'session_789' },
			});

			const record = await tokenService.getTokenRecord(result.tokenId);

			expect(record?.webhook_url).toBe('https://example.com/webhook');
			expect(record?.metadata).toMatchObject({ session_id: 'session_789' });
		});

		it('should update token status', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const updated = await tokenService.updateTokenStatus(
				result.tokenId,
				'active',
			);

			expect(updated).not.toBeNull();
			expect(updated?.status).toBe('active');
		});
	});

	describe('Error Handling', () => {
		it('should throw error if JWT_SECRET not configured', () => {
			delete process.env.REACT_APP_JWT_SECRET;
			delete process.env.JWT_SECRET;

			expect(() => new TokenService()).toThrow('JWT_SECRET not configured');

			// Restore
			process.env.REACT_APP_JWT_SECRET = testSecret;
		});

		it('should throw error if JWT_SECRET is too short', () => {
			process.env.REACT_APP_JWT_SECRET = 'short';

			expect(() => new TokenService()).toThrow(
				'JWT_SECRET must be at least 32 characters',
			);

			// Restore
			process.env.REACT_APP_JWT_SECRET = testSecret;
		});
	});

	describe('Response Format', () => {
		it('should return token, tokenId, and expiresAt', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			expect(result).toHaveProperty('token');
			expect(result).toHaveProperty('tokenId');
			expect(result).toHaveProperty('expiresAt');

			expect(typeof result.token).toBe('string');
			expect(result.tokenId).toBe('tok_testuuid12345678901234563456');
			expect(result.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO 8601
		});

		it('should have token parts in correct format (header.payload.signature)', async () => {
			const result = await tokenService.generateToken({
				customerId: 'cust_123',
				userId: 'user_456',
				assessmentType: 'posture',
				expiresIn: 1800,
			});

			const parts = result.token.split('.');
			expect(parts).toHaveLength(3);

			// Each part should be Base64URL encoded
			expect(parts[0]).toMatch(/^[A-Za-z0-9_-]+$/);
			expect(parts[1]).toMatch(/^[A-Za-z0-9_-]+$/);
			expect(parts[2]).toMatch(/^[A-Za-z0-9_-]+$/);
		});
	});
});
