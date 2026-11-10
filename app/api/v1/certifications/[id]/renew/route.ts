import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newExpiryDate } = body;

    if (!newExpiryDate) {
      return NextResponse.json(
        { success: false, error: "newExpiryDate is required" },
        { status: 400 }
      );
    }

    const updated = store.renewCertification(id, newExpiryDate);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Certification record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Certification successfully renewed and compliance tracking updated.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to renew certification" }, { status: 500 });
  }
}
