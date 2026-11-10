import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { csvContent } = body;

    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid csvContent in request body" },
        { status: 400 }
      );
    }

    const imported = store.bulkImportEmployees(csvContent);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${imported.length} new employees into cohort.`,
      count: imported.length,
      employees: imported,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process bulk import" },
      { status: 500 }
    );
  }
}
