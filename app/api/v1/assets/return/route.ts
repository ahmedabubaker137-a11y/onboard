import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assetId } = body;

    if (!assetId) {
      return NextResponse.json(
        { success: false, error: "Missing assetId" },
        { status: 400 }
      );
    }

    const asset = store.returnAsset(assetId);
    if (!asset) {
      return NextResponse.json(
        { success: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Asset ${asset.name} returned to available inventory.`,
      asset,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to return asset" },
      { status: 500 }
    );
  }
}
