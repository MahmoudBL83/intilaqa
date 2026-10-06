# Encryption Service Setup Guide

This document describes how to set up and configure the AES-256-GCM encryption service for Intilaqa HRMS.

## Overview

The encryption service provides:
- **AES-256-GCM encryption** for sensitive data
- **PBKDF2 key derivation** for secure key generation
- **Helper methods** for encrypting common data types (IDs, bank accounts, salaries, etc.)
- **Masking utilities** for secure display of sensitive information
- **Database migration tools** for encrypting existing data

## Environment Setup

### 1. Generate Encryption Key

Generate a secure encryption key (32+ characters recommended):

```bash
# Option A: Using OpenSSL
openssl rand -base64 32

# Option B: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Set Environment Variable

Add the encryption key to your `.env.local` file:

```bash
ENCRYPTION_KEY=your-generated-key-here
```

For production environments, use a secrets manager:
- **AWS KMS** (AWS Key Management Service)
- **Azure Key Vault** (Microsoft Azure)
- **HashiCorp Vault** (Self-hosted or cloud)
- **Google Cloud KMS** (Google Cloud)

### 3. Verify Setup

Test the encryption service:

```bash
curl -X GET http://localhost:3000/api/v1/encryption \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

Response should show:
```json
{
  "supportedActions": [...],
  "algorithm": "AES-256-GCM",
  "status": "✓ Encryption service is active"
}
```

## Encrypted Fields by Model

### Employee
- `personalId` - Passport, National ID, etc.
- `nationalityId` - Country identification number
- `bankAccountNumber` - Bank account IBAN/number
- `iban` - International Bank Account Number
- `salary` - Base salary

### Document
- `url` - Document URL/file path
- `documentNumber` - Document reference number

### User
- `phone` - Phone number

## Usage Examples

### Encrypting Data

```typescript
import { EncryptionService } from "@/server/services";

// Encrypt personal ID
const encryptedId = EncryptionService.encryptPersonalId("1234567890123");

// Encrypt bank account
const encryptedAccount = EncryptionService.encryptBankAccount("SA9210000000000001234567890");

// Encrypt salary
const encryptedSalary = EncryptionService.encryptSalaryData(15000);

// Generic encryption
const encryptedData = EncryptionService.encryptToString("sensitive data");
```

### Decrypting Data

```typescript
// Decrypt personal ID
const personalId = EncryptionService.decryptPersonalId(encryptedId);

// Decrypt bank account
const bankAccount = EncryptionService.decryptBankAccount(encryptedAccount);

// Decrypt salary
const salary = EncryptionService.decryptSalaryData(encryptedSalary);

// Generic decryption
const plaintext = EncryptionService.decryptFromString(encryptedData);
```

### Masking Data (for Display)

```typescript
// Show last 4 characters only
const maskedId = EncryptionService.maskPersonalId(personalId);
// Output: "***1234"

const maskedBank = EncryptionService.maskAccountNumber(bankAccount);
// Output: "****567890"

const maskedEmail = EncryptionService.maskEmail("user@example.com");
// Output: "****@example.com"

const maskedPhone = EncryptionService.maskPhoneNumber("+966501234567");
// Output: "***4567"
```

### Working with Objects

```typescript
import { EncryptedField } from "@/server/services";

// Encrypt specific fields
const employee = {
  id: "emp-1",
  name: "Ahmed Al-Saud",
  personalId: "1234567890123",
  bankAccount: "SA9210000000000001234567890",
  salary: 15000,
};

const encrypted = EncryptedField.encrypt(employee, [
  "personalId",
  "bankAccount",
  "salary",
]);

// Decrypt specific fields
const decrypted = EncryptedField.decrypt(encrypted, [
  "personalId",
  "bankAccount",
  "salary",
]);

// Mask specific fields for display
const display = EncryptedField.mask(encrypted, [
  "personalId",
  "bankAccount",
  "salary",
]);
```

## Database Migration

### Initial Setup (Encrypting Existing Data)

If you have existing unencrypted data, run the migration:

```typescript
import { prisma } from "@intilaqa/db";
import { EncryptionMigration } from "@/server/services";

async function migrateToEncryption() {
  const result = await EncryptionMigration.migrateEmployeeData(prisma);
  console.log(`Encrypted ${result.processed} records, ${result.errors} errors`);
}
```

### Rollback (Decrypt All Data)

To reverse encryption (emergency only):

```typescript
async function rollbackEncryption() {
  const result = await EncryptionMigration.rollbackEmployeeEncryption(prisma);
  console.log(`Decrypted ${result.processed} records, ${result.errors} errors`);
}
```

## API Endpoints

### Encrypt/Decrypt Data

```bash
# Encrypt data
curl -X POST http://localhost:3000/api/v1/encryption \
  -H "Content-Type: application/json" \
  -d '{
    "action": "encrypt",
    "data": "sensitive information"
  }'

# Decrypt data
curl -X POST http://localhost:3000/api/v1/encryption \
  -H "Content-Type: application/json" \
  -d '{
    "action": "decrypt",
    "data": "encrypted_base64_string"
  }'

# Encrypt personal ID
curl -X POST http://localhost:3000/api/v1/encryption \
  -H "Content-Type: application/json" \
  -d '{
    "action": "encryptPersonalId",
    "data": "1234567890123"
  }'

# Mask personal ID
curl -X POST http://localhost:3000/api/v1/encryption \
  -H "Content-Type: application/json" \
  -d '{
    "action": "maskPersonalId",
    "data": "1234567890123"
  }'

# Generate secure token
curl -X POST http://localhost:3000/api/v1/encryption \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generateToken",
    "data": "32"
  }'
```

## Security Best Practices

### ✓ Do's
- Store encryption keys in secure vaults (AWS KMS, Azure Key Vault, etc.)
- Rotate encryption keys periodically
- Use strong, randomly generated keys
- Log encryption/decryption operations for audit trails
- Test encryption setup before deploying to production
- Backup encrypted data separately from encryption keys

### ✗ Don'ts
- Don't hardcode encryption keys in source code
- Don't share encryption keys via email or chat
- Don't store encryption keys in git repositories
- Don't commit `.env.local` files to version control
- Don't use weak or predictable keys
- Don't forget to backup your encryption keys

## Troubleshooting

### Error: "ENCRYPTION_KEY environment variable not set"
- Ensure `.env.local` includes `ENCRYPTION_KEY=...`
- Check file permissions on `.env.local`
- Verify environment is being loaded

### Error: "Decryption failed"
- Verify you're using the correct encryption key
- Ensure encrypted data wasn't modified
- Check that data was encrypted with the same algorithm

### Performance Issues
- Encryption is CPU-intensive; consider caching unencrypted data in memory
- Use database-level indexing on encrypted fields (use hashes for comparison)
- Batch encrypt/decrypt operations when possible

## Algorithm Details

- **Algorithm**: AES-256-GCM
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 128 bits (16 bytes)
- **Auth Tag Size**: 128 bits (16 bytes)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Hash Function**: SHA-256

GCM (Galois/Counter Mode) provides both confidentiality and authenticity, protecting against tampering.

## Compliance

This encryption implementation supports:
- **GDPR**: Encryption for personal data
- **PCI DSS**: Encryption for payment card data
- **HIPAA**: Encryption for health information
- **SOC 2**: Encryption for sensitive data
- **ISO 27001**: Encryption standards

## Further Reading

- [OWASP: Sensitive Data Exposure](https://owasp.org/www-project-top-ten/)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [AES-256-GCM Explanation](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [Key Management Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
