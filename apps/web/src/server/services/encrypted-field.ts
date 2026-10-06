import { EncryptionService } from "./encryption-service";
import type { EncryptedData } from "./encryption-service";

/**
 * Encrypted Field Utilities
 * Helpers for encrypting/decrypting data fields in models
 */

export class EncryptedField {
  /**
   * Encrypt an object with specified encrypted fields
   * Usage: EncryptedField.encrypt(employee, ['personalId', 'bankAccount'])
   */
  static encrypt<T extends Record<string, any>>(
    data: T,
    fieldsToEncrypt: (keyof T)[]
  ): T {
    const encrypted = { ...data };

    fieldsToEncrypt.forEach((field) => {
      const value = encrypted[field];
      if (value !== null && value !== undefined) {
        (encrypted as any)[field] = EncryptionService.encryptToString(String(value));
      }
    });

    return encrypted;
  }

  /**
   * Decrypt an object with specified encrypted fields
   * Usage: EncryptedField.decrypt(employee, ['personalId', 'bankAccount'])
   */
  static decrypt<T extends Record<string, any>>(
    data: T,
    fieldsToDecrypt: (keyof T)[]
  ): T {
    const decrypted = { ...data };

    fieldsToDecrypt.forEach((field) => {
      const value = decrypted[field];
      if (value !== null && value !== undefined && typeof value === "string") {
        try {
          (decrypted as any)[field] = EncryptionService.decryptFromString(value);
        } catch (error) {
          // If decryption fails, return original value
          console.error(`Failed to decrypt field ${String(field)}:`, error);
        }
      }
    });

    return decrypted;
  }

  /**
   * Mask an object with specified fields (show last 4 chars)
   * Usage: EncryptedField.mask(employee, ['personalId', 'bankAccount'])
   */
  static mask<T extends Record<string, any>>(
    data: T,
    fieldsToMask: (keyof T)[],
    maskFunction?: (value: string) => string
  ): T {
    const masked = { ...data };

    fieldsToMask.forEach((field) => {
      const value = masked[field];
      if (value !== null && value !== undefined) {
        const stringValue = String(value);
        if (maskFunction) {
          (masked as any)[field] = maskFunction(stringValue);
        } else {
          // Default mask: show last 4 characters
          (masked as any)[field] =
            stringValue.length <= 4
              ? "****"
              : "*".repeat(stringValue.length - 4) + stringValue.slice(-4);
        }
      }
    });

    return masked;
  }

  /**
   * Partially mask sensitive fields (good for audit logs)
   */
  static partialMask<T extends Record<string, any>>(
    data: T,
    fieldsToMask: (keyof T)[]
  ): T {
    return this.mask(data, fieldsToMask, (value: string) => {
      const length = value.length;
      const visibleChars = Math.max(1, Math.ceil(length / 4));
      return "*".repeat(length - visibleChars) + value.slice(-visibleChars);
    });
  }

  /**
   * Create encrypted version for display (no decryption)
   */
  static asDisplayFormat<T extends Record<string, any>>(
    data: T,
    fieldsToMask: (keyof T)[]
  ): T {
    // For encrypted data in storage, we want to mask without decrypting
    return this.mask(data, fieldsToMask);
  }
}

/**
 * Type helpers for encrypted fields
 */
export interface EmployeeWithEncryptedSensitiveData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  personalId: string; // Encrypted
  nationalityId: string; // Encrypted
  bankAccountNumber: string; // Encrypted
  iban: string; // Encrypted
  salary: string; // Encrypted (stored as encrypted number)
}

export interface DocumentWithEncryptedData {
  id: string;
  name: string;
  type: string;
  url: string; // Encrypted
  documentNumber: string; // Encrypted (if applicable)
  expiryDate: Date;
}

/**
 * Database migration helper
 * Generates SQL to encrypt existing unencrypted data
 */
export class EncryptionMigration {
  /**
   * Generate migration for encrypting employee fields
   */
  static generateEmployeeMigration(): string {
    return `
-- Migration: Encrypt sensitive employee fields
-- CAUTION: This migration will encrypt existing data
-- Backup your database before running!

-- Note: In production, use a custom migration script
-- as SQL doesn't have direct AES-256-GCM support

-- Step 1: Create backup columns
ALTER TABLE "Employee" 
  ADD COLUMN "personalId_encrypted" VARCHAR(MAX),
  ADD COLUMN "bankAccount_encrypted" VARCHAR(MAX),
  ADD COLUMN "salary_encrypted" VARCHAR(MAX);

-- Step 2: Application-level encryption
-- Run EncryptionMigration.migrateEmployeeData() in Node.js

-- Step 3: Drop old columns
ALTER TABLE "Employee" 
  DROP COLUMN "personalId",
  DROP COLUMN "bankAccount", 
  DROP COLUMN "salary";

-- Step 4: Rename encrypted columns
ALTER TABLE "Employee"
  RENAME COLUMN "personalId_encrypted" TO "personalId",
  RENAME COLUMN "bankAccount_encrypted" TO "bankAccount",
  RENAME COLUMN "salary_encrypted" TO "salary";
    `;
  }

  /**
   * Encrypt existing employee data in the database
   */
  static async migrateEmployeeData(
    prisma: any,
    batchSize: number = 100
  ): Promise<{ processed: number; errors: number }> {
    let processed = 0;
    let errors = 0;

    try {
      const totalEmployees = await prisma.employee.count();
      console.log(`📊 Starting encryption migration for ${totalEmployees} employees`);

      for (let i = 0; i < totalEmployees; i += batchSize) {
        const employees = await prisma.employee.findMany({
          skip: i,
          take: batchSize,
        });

        for (const employee of employees) {
          try {
            const encryptedData = EncryptedField.encrypt(employee, [
              "personalId",
              "bankAccount",
            ]);

            // Also encrypt numeric fields as strings
            if (employee.salary) {
              encryptedData.salary = EncryptionService.encryptSalaryData(
                employee.salary
              );
            }

            await prisma.employee.update({
              where: { id: employee.id },
              data: encryptedData,
            });

            processed++;
          } catch (error) {
            console.error(
              `Failed to encrypt employee ${employee.id}:`,
              error
            );
            errors++;
          }
        }

        console.log(
          `✓ Processed ${Math.min(i + batchSize, totalEmployees)}/${totalEmployees} employees`
        );
      }

      console.log(
        `✅ Migration complete. Processed: ${processed}, Errors: ${errors}`
      );
      return { processed, errors };
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  }

  /**
   * Decrypt existing employee data (for rollback)
   */
  static async rollbackEmployeeEncryption(
    prisma: any,
    batchSize: number = 100
  ): Promise<{ processed: number; errors: number }> {
    let processed = 0;
    let errors = 0;

    console.log("⚠️  Starting rollback of encryption");

    const totalEmployees = await prisma.employee.count();

    for (let i = 0; i < totalEmployees; i += batchSize) {
      const employees = await prisma.employee.findMany({
        skip: i,
        take: batchSize,
      });

      for (const employee of employees) {
        try {
          const decryptedData = EncryptedField.decrypt(employee, [
            "personalId",
            "bankAccount",
          ]);

          // Decrypt salary if encrypted
          if (employee.salary && typeof employee.salary === "string") {
            try {
              decryptedData.salary = EncryptionService.decryptSalaryData(
                employee.salary
              );
            } catch {
              // Keep as is if not encrypted
            }
          }

          await prisma.employee.update({
            where: { id: employee.id },
            data: decryptedData,
          });

          processed++;
        } catch (error) {
          console.error(
            `Failed to decrypt employee ${employee.id}:`,
            error
          );
          errors++;
        }
      }

      console.log(
        `✓ Rolled back ${Math.min(i + batchSize, totalEmployees)}/${totalEmployees} employees`
      );
    }

    console.log(`✅ Rollback complete. Processed: ${processed}, Errors: ${errors}`);
    return { processed, errors };
  }
}

export default EncryptedField;
