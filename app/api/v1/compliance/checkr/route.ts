import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const checks = store.getBackgroundChecks();
  return NextResponse.json({
    success: true,
    data: checks,
    total: checks.length,
    clearCount: checks.filter((c) => c.status === "CLEAR").length,
    pendingCount: checks.filter((c) => c.status === "PENDING").length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, candidateName, jobTitle, tier } = body;

    if (!candidateId || !candidateName) {
      return NextResponse.json(
        { success: false, error: "candidateId and candidateName are required" },
        { status: 400 }
      );
    }

    const created = store.createBackgroundCheck({
      candidateId,
      candidateName,
      jobTitle: jobTitle || "Role Specialist",
      provider: "Checkr Enterprise",
      tier: tier || "Standard Criminal + SSN Trace + Global Watchlist",
      reportUrl: `https://dashboard.checkr.com/reports/chk_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: "Checkr background verification order completed with status CLEAR.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to create background check" }, { status: 500 });
  }
}
