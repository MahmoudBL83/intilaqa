import { NextRequest, NextResponse } from "next/server";
import { auth } from '@intilaqa/auth';
import { EncryptionService, EncryptedField } from "@/server/services";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, data, maskedFields } = await request.json();

    if (!action || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let result: any;

    switch (action) {
      case "encrypt":
        result = EncryptionService.encryptToString(data);
        break;

      case "decrypt":
        result = EncryptionService.decryptFromString(data);
        break;

      case "encryptPersonalId":
        result = EncryptionService.encryptPersonalId(data);
        break;

      case "decryptPersonalId":
        result = EncryptionService.decryptPersonalId(data);
        break;

      case "maskPersonalId":
        result = EncryptionService.maskPersonalId(data);
        break;

      case "encryptBankAccount":
        result = EncryptionService.encryptBankAccount(data);
        break;

      case "decryptBankAccount":
        result = EncryptionService.decryptBankAccount(data);
        break;

      case "maskBankAccount":
        result = EncryptionService.maskAccountNumber(data);
        break;

      case "encryptEmail":
        result = EncryptionService.encryptEmail(data);
        break;

      case "maskEmail":
        result = EncryptionService.maskEmail(data);
        break;

      case "encryptPhone":
        result = EncryptionService.encryptPhoneNumber(data);
        break;

      case "maskPhone":
        result = EncryptionService.maskPhoneNumber(data);
        break;

      case "hash":
        result = EncryptionService.hash(data);
        break;

      case "generateToken":
        result = EncryptionService.generateToken(parseInt(data) || 32);
        break;

      case "maskObject":
        if (!maskedFields || !Array.isArray(maskedFields)) {
          return NextResponse.json(
            { error: "maskedFields array required for maskObject" },
            { status: 400 }
          );
        }
        result = EncryptedField.mask(data, maskedFields);
        break;

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      action,
    });
  } catch (error: any) {
    console.error("Encryption operation error:", error);
    return NextResponse.json(
      { error: error.message || "Encryption operation failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      supportedActions: [
        "encrypt",
        "decrypt",
        "encryptPersonalId",
        "decryptPersonalId",
        "maskPersonalId",
        "encryptBankAccount",
        "decryptBankAccount",
        "maskBankAccount",
        "encryptEmail",
        "maskEmail",
        "encryptPhone",
        "maskPhone",
        "hash",
        "generateToken",
        "maskObject",
      ],
      encryptedFields: {
        employee: [
          "personalId",
          "nationalityId",
          "bankAccountNumber",
          "iban",
          "salary",
        ],
        document: ["url", "documentNumber"],
        user: ["phone"],
      },
      algorithm: "AES-256-GCM",
      status: "✓ Encryption service is active",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get encryption info" },
      { status: 500 }
    );
  }
}
