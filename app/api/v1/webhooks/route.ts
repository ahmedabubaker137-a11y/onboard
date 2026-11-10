import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const webhooks = store.getWebhooks();
  return NextResponse.json({
    success: true,
    data: webhooks,
    total: webhooks.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, events } = body;

    if (!url || !events) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: url and events" },
        { status: 400 }
      );
    }

    const created = store.addWebhook({
      url,
      events,
      active: true,
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to register webhook" },
      { status: 500 }
    );
  }
}
