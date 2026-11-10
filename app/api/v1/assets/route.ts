import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const assets = store.getAssets();
  return NextResponse.json({
    success: true,
    data: assets,
    total: assets.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, model, serialNumber, category, specs } = body;

    if (!name || !serialNumber) {
      return NextResponse.json(
        { success: false, error: "name and serialNumber are required" },
        { status: 400 }
      );
    }

    const created = store.addAsset({
      id: `asset_${Date.now()}`,
      name,
      model: model || "Standard Edition",
      serialNumber,
      category: category || "LAPTOP",
      status: "AVAILABLE",
      specs: specs || "Enterprise Managed Hardware",
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: `Asset ${created.name} registered into inventory.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to register asset" },
      { status: 500 }
    );
  }
}
