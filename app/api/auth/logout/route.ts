import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { store } from "@/lib/db";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const currentRole = cookieStore.get("onboardx_current_role")?.value || "UNKNOWN";
  
  cookieStore.delete("onboardx_current_role");

  // Record audit log
  store.addAuditLog(
    "auth@acme-enterprises.com",
    "ADMIN",
    "USER_LOGOUT_EXECUTED",
    "AuthenticationSession",
    "session_current",
    { previousRole: currentRole, timestamp: new Date().toISOString() }
  );

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
