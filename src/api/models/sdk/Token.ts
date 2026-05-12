/**
 * Token Model - Data structure for SDK authentication tokens
 *
 * Represents a JWT token with associated metadata stored in the database.
 * Tokens are used for authenticating SDK sessions and tracking assessment state.
 *
 * @module api/models/sdk/Token
 */

export interface TokenRecord {
	id: string; // Token ID (jti claim)
	customer_id: string; // Customer identifier (sub claim)
	user_id: string; // User identifier (custom claim)
	assessment_type: 'posture' | 'rom' | 'gait'; // Assessment type
	status: 'pending' | 'active' | 'completed' | 'expired' | 'revoked'; // Token status
	expires_at: Date; // Expiration timestamp
	webhook_url?: string; // Optional webhook URL
	metadata?: Record<string, unknown>; // Optional custom metadata
	created_at?: Date; // Creation timestamp
	updated_at?: Date; // Last update timestamp
}

/**
 * Token Model - Database operations for tokens
 *
 * TODO: Replace with actual database implementation
 * This is a mock implementation for SDK-006
 */
export class Token {
	private static tokens: Map<string, TokenRecord> = new Map();

	/**
	 * Create a new token record
	 *
	 * @param data - Token data
	 * @returns Created token record
	 */
	static async create(
		data: Omit<TokenRecord, 'created_at' | 'updated_at'>,
	): Promise<TokenRecord> {
		const now = new Date();
		const record: TokenRecord = {
			...data,
			created_at: now,
			updated_at: now,
		};

		this.tokens.set(data.id, record);
		return record;
	}

	/**
	 * Find token by ID
	 *
	 * @param id - Token ID
	 * @returns Token record or null if not found
	 */
	static async findById(id: string): Promise<TokenRecord | null> {
		return this.tokens.get(id) || null;
	}

	/**
	 * Update token status
	 *
	 * @param id - Token ID
	 * @param status - New status
	 * @returns Updated token record or null if not found
	 */
	static async updateStatus(
		id: string,
		status: TokenRecord['status'],
	): Promise<TokenRecord | null> {
		const token = this.tokens.get(id);
		if (!token) return null;

		token.status = status;
		token.updated_at = new Date();
		this.tokens.set(id, token);
		return token;
	}

	/**
	 * Delete token (for testing)
	 *
	 * @param id - Token ID
	 */
	static async delete(id: string): Promise<void> {
		this.tokens.delete(id);
	}

	/**
	 * Clear all tokens (for testing)
	 */
	static async clear(): Promise<void> {
		this.tokens.clear();
	}
}
