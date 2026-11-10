import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const logs = store.getAuditLogs();
  return NextResponse.json({
    success: true,
    data: logs,
    total: logs.length,
  });
}
