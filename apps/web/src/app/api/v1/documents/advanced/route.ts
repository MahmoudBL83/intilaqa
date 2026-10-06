import { NextRequest, NextResponse } from "next/server";
import { auth } from "@intilaqa/auth";
import { DocumentService } from "@/server/services/document-service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      filters,
      logic = "AND",
      companyId,
      take = 10,
      skip = 0,
    } = body as {
      filters?: Array<{
        field: string;
        operator: string;
        value: string | number | boolean;
      }>;
      logic?: "AND" | "OR";
      companyId?: string;
      take?: number;
      skip?: number;
    };

    // Validate pagination
    const pageSize = Math.min(Math.max(take, 1), 100);
    const pageSkip = Math.max(skip, 0);

    // Validate filters
    const validFields = [
      "type",
      "status",
      "expiryDateFrom",
      "expiryDateTo",
      "expiringSoon",
      "expired",
    ];

    if (filters) {
      for (const filter of filters) {
        if (!validFields.includes(filter.field)) {
          return NextResponse.json(
            { error: `Invalid filter field: ${filter.field}` },
            { status: 400 }
          );
        }
      }
    }

    // Query documents
    const result = await DocumentService.queryDocumentsAdvanced({
      filters,
      logic,
      companyId,
      take: pageSize,
      skip: pageSkip,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error querying documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
