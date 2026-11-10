import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const orders = store.getSwagOrders(employeeId || undefined);
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, shirtSize, items, shippingAddress } = body;

    if (!employeeId || !shirtSize || !shippingAddress) {
      return NextResponse.json({ error: "Missing required swag ordering details" }, { status: 400 });
    }

    const order = store.createSwagOrder({
      employeeId,
      shirtSize,
      items: items && items.length > 0 ? items : ["Welcome Hoodie", "Stainless Tumbler", "Sticker Pack", "Laptop Sleeve"],
      shippingAddress,
    });

    return NextResponse.json({
      success: true,
      message: "Swag order created and auto-dispatched to fulfillment queue",
      order,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to place swag order" }, { status: 500 });
  }
}
