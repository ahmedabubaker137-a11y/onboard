import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assetId, employeeId } = body;

    if (!assetId || !employeeId) {
      return NextResponse.json(
        { success: false, error: "assetId and employeeId are required" },
        { status: 400 }
      );
    }

    const assigned = store.assignAsset(assetId, employeeId);

    if (!assigned) {
      return NextResponse.json(
        { success: false, error: "Asset or employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assigned,
      message: `Hardware asset ${assigned.name} assigned to ${assigned.assignedToName}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to assign asset" },
      { status: 500 }
    );
  }
}
