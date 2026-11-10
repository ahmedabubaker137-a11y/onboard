import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const ssoConfig = store.getSsoConfig();
  return NextResponse.json({ sso: ssoConfig });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = store.updateSsoConfig(body);
    return NextResponse.json({
      success: true,
      message: "SSO & Azure Active Directory federation settings updated",
      sso: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update SSO configuration" }, { status: 500 });
  }
}
