import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  try {
    const metrics = store.getDiversityMetrics();
    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load DEI analytics" }, { status: 500 });
  }
}
