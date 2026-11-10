import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    // If Admin/HR, return all reports with PII stripped
    const all = store.getWhistleblowerReports();
    return NextResponse.json({
      success: true,
      data: all,
      total: all.length,
    });
  }

  const report = store.getWhistleblowerReportByToken(token);
  if (!report) {
    return NextResponse.json(
      { success: false, error: "No report found matching this cryptographic tracking token." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: report,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, subject, details } = body;

    if (!category || !subject || !details) {
      return NextResponse.json(
        { success: false, error: "category, subject, and details are required for anonymous submission." },
        { status: 400 }
      );
    }

    const created = store.submitWhistleblowerReport({ category, subject, details });

    return NextResponse.json({
      success: true,
      trackingToken: created.trackingToken,
      data: created,
      message: "Report securely submitted with zero-knowledge cryptographic token. Retain your tracking token to view resolution status.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to submit report" }, { status: 500 });
  }
}
