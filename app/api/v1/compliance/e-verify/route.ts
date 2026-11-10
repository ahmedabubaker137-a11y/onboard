import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const cases = store.getEVerifyCases();
  return NextResponse.json({
    success: true,
    data: cases,
    total: cases.length,
    authorizedCount: cases.filter((c) => c.status === "EMPLOYMENT_AUTHORIZED").length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, employeeName, documentType } = body;

    if (!employeeId || !employeeName) {
      return NextResponse.json(
        { success: false, error: "employeeId and employeeName are required" },
        { status: 400 }
      );
    }

    const created = store.verifyEVerifyCase(
      employeeId,
      employeeName,
      documentType || "US_PASSPORT"
    );

    return NextResponse.json({
      success: true,
      data: created,
      message: "DHS E-Verify Case Generated: Employment Authorized.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to process E-Verify request" }, { status: 500 });
  }
}
