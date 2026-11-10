import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId") || undefined;
  const docs = store.getDocuments(employeeId);

  return NextResponse.json({
    success: true,
    data: docs,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, title, fileType, fileSize } = body;

    const newDoc = {
      id: `doc_${Date.now()}`,
      employeeId: employeeId || "emp_kaelen_01",
      title: title || "Uploaded Compliance Document",
      fileType: fileType || "application/pdf",
      fileSize: fileSize || "1.2 MB",
      status: "APPROVED" as const,
      verifiedAt: new Date().toISOString(),
    };

    const doc = store.addDocument(newDoc);

    return NextResponse.json({
      success: true,
      data: doc,
      message: "Document uploaded and verified.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
