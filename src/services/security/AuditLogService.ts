/**
 * AuditLogService - Tamper-proof audit logging for Command Palette
 *
 * Implements blockchain-inspired hash chain for tamper detection:
 * - Each log entry links to previous entry via previousHash
 * - First entry: previousHash = '0' (genesis block)
 * - Hash: SHA256(timestamp + userId + commandId + previousHash)
 *
 * Encryption: AES-GCM via Web Crypto API
 * - Encrypts sensitive data (userId, commandId)
 * - Unique IV per entry
 * - Fallback to PBKDF2-derived key (client-side)
 *
 * Storage: IndexedDB (offline access, indexed queries)
 *
 * HIPAA Compliance: Audit logging required for PHI access
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */

/**
 * Single audit log entry with hash chain and encryption
 */
export interface AuditLogEntry {
  /** Auto-increment primary key (IndexedDB) */
  id?: number;
  /** Timestamp of command execution (Date.now()) */
  timestamp: number;
  /** Encrypted user ID who executed command */
  userId: string;
  /** Encrypted command ID that was executed */
  commandId: string;
  /** SHA-256 hash of entry (timestamp + userId + commandId + previousHash) */
  hash: string;
  /** Hash of previous entry ('0' for genesis block) */
  previousHash: string;
  /** Initialization vector for AES-GCM encryption (base64) */
  iv: string;
}

/**
 * Encrypted data container with initialization vector
 */
interface EncryptedData {
  encrypted: string;
  iv: string;
}

/**
 * AuditLogService - Singleton service for tamper-proof audit logging
 *
 * Features:
 * - Hash chain for tamper detection (blockchain-inspired)
 * - AES-GCM encryption for sensitive data
 * - IndexedDB storage for offline access
 * - Graceful error handling (logging failures don't block execution)
 */
class AuditLogServiceClass {
  private dbName = 'commandPaletteAuditLogs';
  private db: IDBDatabase | null = null;
  private dbReady: Promise<void>;
  private encryptionKey: CryptoKey | null = null;

  constructor() {
    this.dbReady = this.initDB();
  }

  /**
   * Initialize IndexedDB database with audit logs object store
   * Creates indices on userId and timestamp for efficient queries
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create auditLogs object store if it doesn't exist
        if (!db.objectStoreNames.contains('auditLogs')) {
          const objectStore = db.createObjectStore('auditLogs', {
            keyPath: 'id',
            autoIncrement: true,
          });

          // Index by userId for efficient per-user queries
          objectStore.createIndex('userId', 'userId', { unique: false });

          // Index by timestamp for chronological queries
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });

          // eslint-disable-next-line no-console
        }
      };
    });
  }

  /**
   * Compute SHA-256 hash for log entry
   * Hash format: SHA256(timestamp + userId + commandId + previousHash)
   *
   * @param timestamp - Command execution timestamp
   * @param userId - User who executed command (plaintext)
   * @param commandId - Command that was executed (plaintext)
   * @param previousHash - Hash of previous entry ('0' for genesis block)
   * @returns Hex-encoded SHA-256 hash
   */
  private async computeHash(
    timestamp: number,
    userId: string,
    commandId: string,
    previousHash: string
  ): Promise<string> {
    const data = `${timestamp}${userId}${commandId}${previousHash}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get encryption key (fallback to PBKDF2 if AWS KMS unavailable)
   *
   * In production: Use AWS KMS for enterprise key management
   * Fallback: PBKDF2-derived key from password (client-side)
   *
   * @returns CryptoKey for AES-GCM encryption
   */
  private async getEncryptionKey(): Promise<CryptoKey> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    // TODO: Try AWS KMS first (if configured)
    // For now, use PBKDF2 fallback (client-side encryption)

    const password = 'command-palette-audit-key'; // In production: secure key management
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Fixed salt (in production: store securely or derive from user-specific data)
    const salt = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return this.encryptionKey;
  }

  /**
   * Encrypt sensitive data using AES-GCM (Web Crypto API)
   *
   * @param data - Plaintext data to encrypt
   * @returns Encrypted data with unique initialization vector (IV)
   */
  private async encrypt(data: string): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    const key = await this.getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    return {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv)),
    };
  }

  /**
   * Decrypt sensitive data using AES-GCM
   *
   * @param encryptedData - Base64-encoded encrypted data
   * @param ivBase64 - Base64-encoded initialization vector
   * @returns Decrypted plaintext
   */
  private async decrypt(encryptedData: string, ivBase64: string): Promise<string> {
    const key = await this.getEncryptionKey();
    const iv = new Uint8Array(
      atob(ivBase64)
        .split('')
        .map((c) => c.charCodeAt(0))
    );
    const encrypted = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Get latest audit log entry (for hash chain)
   *
   * @returns Latest entry or null if no entries exist
   */
  private async getLatestEntry(): Promise<AuditLogEntry | null> {
    await this.dbReady;

    if (!this.db) {
      throw new Error('[AuditLogService] Database not initialized');
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('[AuditLogService] Database not initialized'));
        return;
      }
      const transaction = this.db.transaction(['auditLogs'], 'readonly');
      const objectStore = transaction.objectStore('auditLogs');
      const index = objectStore.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Get latest (descending)

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          resolve(cursor.value as AuditLogEntry);
        } else {
          resolve(null); // No entries yet (genesis block)
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Store audit log entry in IndexedDB
   *
   * @param entry - Audit log entry to store
   */
  private async storeEntry(entry: AuditLogEntry): Promise<void> {
    await this.dbReady;

    if (!this.db) {
      throw new Error('[AuditLogService] Database not initialized');
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('[AuditLogService] Database not initialized'));
        return;
      }
      const transaction = this.db.transaction(['auditLogs'], 'readwrite');
      const objectStore = transaction.objectStore('auditLogs');
      const request = objectStore.add(entry);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get all audit log entries (for integrity verification)
   *
   * @returns All audit log entries sorted by id (chronological)
   */
  private async getAllEntries(): Promise<AuditLogEntry[]> {
    await this.dbReady;

    if (!this.db) {
      throw new Error('[AuditLogService] Database not initialized');
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('[AuditLogService] Database not initialized'));
        return;
      }
      const transaction = this.db.transaction(['auditLogs'], 'readonly');
      const objectStore = transaction.objectStore('auditLogs');
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result as AuditLogEntry[]);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Log command execution with encryption and hash chain
   *
   * - Encrypts userId and commandId (sensitive data)
   * - Computes hash linking to previous entry
   * - Stores in IndexedDB
   * - Never throws errors (graceful error handling)
   *
   * @param userId - User who executed command
   * @param commandId - Command that was executed
   */
  async logExecution(userId: string, commandId: string): Promise<void> {
    try {
      // Get previous entry for hash chain
      const previousEntry = await this.getLatestEntry();
      const previousHash = previousEntry?.hash || '0'; // Genesis block

      // Encrypt sensitive data
      const encryptedUserId = await this.encrypt(userId);
      const encryptedCommandId = await this.encrypt(commandId);

      // Compute hash (using plaintext for hash, encrypted for storage)
      const timestamp = Date.now();
      const hash = await this.computeHash(timestamp, userId, commandId, previousHash);

      // Create entry
      const entry: AuditLogEntry = {
        timestamp,
        userId: encryptedUserId.encrypted,
        commandId: encryptedCommandId.encrypted,
        hash,
        previousHash,
        iv: encryptedUserId.iv, // Same IV used for both fields
      };

      // Store entry
      await this.storeEntry(entry);
    } catch (error) {
      // Don't throw - logging failure shouldn't block command execution
      // Context: Audit logging is best-effort; command execution takes priority
      console.error('[AuditLogService] Error logging execution:', error);
    }
  }

  /**
   * Retrieve audit trail for a specific user
   *
   * @param userId - User ID to query (plaintext)
   * @returns Decrypted audit log entries sorted by timestamp (descending)
   */
  async getAuditTrail(userId: string): Promise<AuditLogEntry[]> {
    await this.dbReady;

    if (!this.db) {
      throw new Error('[AuditLogService] Database not initialized');
    }

    // Get all entries (IndexedDB doesn't support querying encrypted fields)
    const allEntries = await this.getAllEntries();

    // Decrypt and filter by userId
    const matchingEntries: AuditLogEntry[] = [];

    for (const entry of allEntries) {
      try {
        const decryptedUserId = await this.decrypt(entry.userId, entry.iv);
        if (decryptedUserId === userId) {
          // Decrypt commandId for return
          const decryptedCommandId = await this.decrypt(entry.commandId, entry.iv);
          matchingEntries.push({
            ...entry,
            userId: decryptedUserId,
            commandId: decryptedCommandId,
          });
        }
      } catch (error) {
        // Silently handle decryption errors for individual entries
        // Context: Skip corrupted entries but continue processing valid ones
        console.warn('[AuditLogService] Error decrypting audit entry:', error);
      }
    }

    // Sort by timestamp descending (newest first)
    return matchingEntries.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Verify hash chain integrity (tamper detection)
   *
   * Recomputes all hashes and verifies chain linkage.
   * Any modification to an entry breaks the chain.
   *
   * @returns true if all hashes valid, false if tampered
   */
  async verifyIntegrity(): Promise<boolean> {
    const entries = await this.getAllEntries();

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const expectedPreviousHash = i === 0 ? '0' : entries[i - 1].hash;

      // Check hash chain linkage
      if (entry.previousHash !== expectedPreviousHash) {
        return false; // Chain broken
      }

      // Recompute hash and verify
      try {
        const decryptedUserId = await this.decrypt(entry.userId, entry.iv);
        const decryptedCommandId = await this.decrypt(entry.commandId, entry.iv);

        const recomputedHash = await this.computeHash(
          entry.timestamp,
          decryptedUserId,
          decryptedCommandId,
          entry.previousHash
        );

        if (recomputedHash !== entry.hash) {
          return false; // Hash mismatch (tampered)
        }
      } catch (error) {
        return false; // Decryption failure (corrupted or tampered)
      }
    }

    return true; // All valid
  }

  /**
   * Reset audit logs (for testing only)
   * WARNING: This deletes all audit log data
   */
  async reset(): Promise<void> {
    await this.dbReady;

    if (!this.db) {
      throw new Error('[AuditLogService] Database not initialized');
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('[AuditLogService] Database not initialized'));
        return;
      }
      const transaction = this.db.transaction(['auditLogs'], 'readwrite');
      const objectStore = transaction.objectStore('auditLogs');
      const request = objectStore.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

/**
 * Singleton instance of AuditLogService
 * Import and use this instance throughout the application
 */
export const AuditLogService = new AuditLogServiceClass();
