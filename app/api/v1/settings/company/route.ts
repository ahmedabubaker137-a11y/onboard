import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const company = store.getCompany();
  return NextResponse.json({
    success: true,
    data: company,
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const updated = store.updateCompany(body);

    return NextResponse.json({
      success: true,
      message: "Company branding preferences saved.",
      company: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update company branding" },
      { status: 500 }
    );
  }
}
