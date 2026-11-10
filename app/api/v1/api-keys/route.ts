import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const keys = store.getApiKeys();
  return NextResponse.json({
    success: true,
    data: keys,
    total: keys.length,
  });
}

const ALLOWED_ROLES = ["HR_INTEGRATION", "IT_PROVISIONER", "COMPLIANCE_AUDITOR", "ADMIN", "READ_ONLY"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      return NextResponse.json(
        { success: false, error: "Valid key name is required (max 100 characters)." },
        { status: 400 }
      );
    }

    const assignedRole = ALLOWED_ROLES.includes(role) ? role : "HR_INTEGRATION";
    const key = store.createApiKey(name.trim(), assignedRole);

    return NextResponse.json({
      success: true,
      message: "API Key created successfully. Store this secret safely as it will not be shown again.",
      apiKey: key,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate API Key securely." },
      { status: 500 }
    );
  }
}
