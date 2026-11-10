import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = store.deleteWebhook(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Webhook not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Webhook deleted successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete webhook" },
      { status: 500 }
    );
  }
}
