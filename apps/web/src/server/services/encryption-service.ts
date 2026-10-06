import crypto from "crypto";

/**
 * Encryption Service
 * Provides AES-256-GCM encryption for sensitive data
 */

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export class EncryptionService {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly AUTH_TAG_LENGTH = 16; // 128 bits
  private static readonly SALT_LENGTH = 32;

  /**
   * Get encryption key from environment or derive it
   * IMPORTANT: In production, store keys in AWS KMS, Azure Key Vault, or HashiCorp Vault
   */
  private static getKey(): Buffer {
    const keyString = process.env.ENCRYPTION_KEY;

    if (!keyString) {
      throw new Error("ENCRYPTION_KEY environment variable not set");
    }

    // Key should be 32 bytes for AES-256
    if (keyString.length < 32) {
      // If key is shorter, derive a proper key using PBKDF2
      return crypto
        .pbkdf2Sync(keyString, "intilaqa-salt", 100000, 32, "sha256")
        .subarray(0, 32);
    }

    return Buffer.from(keyString.substring(0, 32));
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(plaintext: string): EncryptedData {
    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(this.IV_LENGTH);

      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      let encrypted = cipher.update(plaintext, "utf8", "hex");
      encrypted += cipher.final("hex");

      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex"),
      };
    } catch (error: any) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(data: EncryptedData): string {
    try {
      const key = this.getKey();
      const iv = Buffer.from(data.iv, "hex");
      const authTag = Buffer.from(data.authTag, "hex");

      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(data.encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error: any) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt and return as Base64 string for storage
   */
  static encryptToString(plaintext: string): string {
    const encrypted = this.encrypt(plaintext);
    const combined = JSON.stringify(encrypted);
    return Buffer.from(combined).toString("base64");
  }

  /**
   * Decrypt from Base64 string
   */
  static decryptFromString(encryptedString: string): string {
    const combined = Buffer.from(encryptedString, "base64").toString("utf8");
    const data = JSON.parse(combined) as EncryptedData;
    return this.decrypt(data);
  }

  /**
   * Hash sensitive data (one-way, for comparison)
   */
  static hash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Generate a random token (for password resets, OTPs, etc.)
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Encrypt personal ID (passport, national ID, etc.)
   */
  static encryptPersonalId(personalId: string): string {
    return this.encryptToString(personalId);
  }

  /**
   * Decrypt personal ID
   */
  static decryptPersonalId(encryptedId: string): string {
    return this.decryptFromString(encryptedId);
  }

  /**
   * Encrypt bank account number
   */
  static encryptBankAccount(accountNumber: string): string {
    // Validate account number length (IBAN format)
    if (accountNumber.length < 15 || accountNumber.length > 34) {
      throw new Error("Invalid bank account number");
    }
    return this.encryptToString(accountNumber);
  }

  /**
   * Decrypt bank account number
   */
  static decryptBankAccount(encryptedAccount: string): string {
    return this.decryptFromString(encryptedAccount);
  }

  /**
   * Encrypt salary/financial data
   */
  static encryptSalaryData(amount: number): string {
    return this.encryptToString(amount.toString());
  }

  /**
   * Decrypt salary/financial data
   */
  static decryptSalaryData(encryptedAmount: string): number {
    const decrypted = this.decryptFromString(encryptedAmount);
    return parseFloat(decrypted);
  }

  /**
   * Encrypt document URL for secure sharing
   */
  static encryptDocumentUrl(url: string): string {
    return this.encryptToString(url);
  }

  /**
   * Decrypt document URL
   */
  static decryptDocumentUrl(encryptedUrl: string): string {
    return this.decryptFromString(encryptedUrl);
  }

  /**
   * Encrypt phone number
   */
  static encryptPhoneNumber(phoneNumber: string): string {
    // Basic validation
    if (phoneNumber.length < 7 || phoneNumber.length > 15) {
      throw new Error("Invalid phone number");
    }
    return this.encryptToString(phoneNumber);
  }

  /**
   * Decrypt phone number
   */
  static decryptPhoneNumber(encryptedPhone: string): string {
    return this.decryptFromString(encryptedPhone);
  }

  /**
   * Encrypt email address
   */
  static encryptEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email address");
    }
    return this.encryptToString(email);
  }

  /**
   * Decrypt email address
   */
  static decryptEmail(encryptedEmail: string): string {
    return this.decryptFromString(encryptedEmail);
  }

  /**
   * Mask sensitive data for display (show last 4 chars)
   */
  static maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) return "****";
    return "*".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  }

  /**
   * Mask personal ID (show last 4 chars)
   */
  static maskPersonalId(personalId: string): string {
    if (personalId.length <= 4) return "****";
    return "*".repeat(personalId.length - 4) + personalId.slice(-4);
  }

  /**
   * Mask email (show domain only)
   */
  static maskEmail(email: string): string {
    const [name, domain] = email.split("@");
    if (!name || !domain) return "****@****";
    return "*".repeat(Math.max(1, name.length - 2)) + name.slice(-2) + "@" + domain;
  }

  /**
   * Mask phone number (show last 4 digits)
   */
  static maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length <= 4) return "****";
    return "*".repeat(phoneNumber.length - 4) + phoneNumber.slice(-4);
  }

  /**
   * Verify encrypted data (for sensitive comparisons without decryption)
   * Usage: Compare hashes instead of decrypted values
   */
  static hashForComparison(data: string): string {
    const key = this.getKey();
    return crypto
      .createHmac("sha256", key)
      .update(data)
      .digest("hex");
  }

  /**
   * Secure data disposal (overwrite sensitive buffers)
   */
  static secureClear(buffer: Buffer): void {
    buffer.fill(0);
  }
}

export default EncryptionService;
