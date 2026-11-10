import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Standard Offboarding Protocol";

    const result = store.offboardEmployee(id, reason);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Employee offboarding protocol completed. ${result.reclaimedAssets} assets returned to inventory.`,
      employee: result.employee,
      reclaimedAssets: result.reclaimedAssets,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to complete offboarding protocol" },
      { status: 500 }
    );
  }
}
