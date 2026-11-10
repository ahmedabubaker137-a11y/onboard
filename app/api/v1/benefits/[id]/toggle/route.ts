import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const benefit = store.toggleBenefit(id);

    if (!benefit) {
      return NextResponse.json(
        { success: false, error: "Benefit plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: benefit,
      message: `Benefit "${benefit.name}" election status toggled.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to toggle benefit election" },
      { status: 500 }
    );
  }
}
