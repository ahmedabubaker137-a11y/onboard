import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, taskId, employeeId, approverName, note } = body;

    if (!action || !taskId) {
      return NextResponse.json({ error: "Missing action or taskId" }, { status: 400 });
    }

    if (action === "approve") {
      const updated = store.updateTaskStatus(taskId, "COMPLETED");
      if (!updated) {
        store.addAuditLog(
          "slack-bot@acme-enterprises.com",
          "SYSTEM",
          "SLACK_BOT_TASK_APPROVED",
          "Task",
          taskId,
          { approver: approverName || "HR Manager", channel: "#onboarding-approvals" }
        );
      }
      return NextResponse.json({
        success: true,
        message: updated
          ? `Task "${updated.task.title}" approved via bot. ${updated.employee.firstName}'s onboarding progress is now ${updated.employee.progress}%.`
          : `Task ${taskId} approved via Slack / Teams Bot by ${approverName || "Manager"}.`,
        task: updated,
        notificationSent: true,
        channel: "#onboarding-approvals",
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "reject") {
      const updated = store.updateTaskStatus(taskId, "REJECTED");
      if (!updated) {
        store.addAuditLog(
          "slack-bot@acme-enterprises.com",
          "SYSTEM",
          "SLACK_BOT_TASK_REJECTED",
          "Task",
          taskId,
          { note: note || "Verification required", channel: "#onboarding-approvals" }
        );
      }
      return NextResponse.json({
        success: true,
        message: `Revision requested for ${taskId}: "${note || "Please resubmit with valid details."}"`,
        task: updated,
        notificationSent: true,
        channel: "#onboarding-approvals",
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "remind") {
      return NextResponse.json({
        success: true,
        message: `Reminder nudge dispatched to employee ${employeeId || "new hire"} on Slack/Teams`,
        channel: "@newhire",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Slack Bot Action Error:", error);
    return NextResponse.json({ error: "Failed to process Slack action" }, { status: 500 });
  }
}
