import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const anonymized = store.anonymizeEmployee(id);
    if (!anonymized) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "GDPR Article 17 erasure executed. Personal documents purged and PII scrubbed.",
      employee: anonymized,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to anonymize employee record" },
      { status: 500 }
    );
  }
}
