import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const reports = store.getScheduledReports();
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, frequency, recipients, reportType, exportFormat } = body;

    if (!title || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "Title and at least one recipient are required" }, { status: 400 });
    }

    const newReport = store.createScheduledReport({
      name: title,
      title,
      frequency: frequency || "WEEKLY",
      recipients: Array.isArray(recipients) ? recipients : [recipients],
      reportType: reportType || "ONBOARDING_VELOCITY",
      exportFormat: exportFormat || "CSV",
      status: "ACTIVE",
    });

    return NextResponse.json({
      success: true,
      message: `Scheduled report '${title}' registered successfully`,
      report: newReport,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to schedule report" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }
    const updated = store.runScheduledReportNow(id);
    if (!updated) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: `Scheduled report '${updated.title}' dispatched to recipients successfully`,
      report: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to run scheduled report" }, { status: 500 });
  }
}

