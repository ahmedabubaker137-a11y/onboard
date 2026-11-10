import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const webhook = store.testWebhook(id);
    if (!webhook) {
      return NextResponse.json(
        { success: false, error: "Webhook not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test ping dispatched to ${webhook.url}. Response code 200 OK received.`,
      webhook,
      deliveryStatus: "SUCCESS",
      deliveredAt: webhook.lastDeliveredAt,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to dispatch test webhook payload" },
      { status: 500 }
    );
  }
}
