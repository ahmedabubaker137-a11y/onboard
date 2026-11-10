import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const revoked = store.revokeApiKey(id);
    if (!revoked) {
      return NextResponse.json(
        { success: false, error: "API Key not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "API Key revoked successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to revoke API key" },
      { status: 500 }
    );
  }
}
