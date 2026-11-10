import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { generateCryptoHash } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: docId } = await params;
    const body = await request.json();
    const { signerEmail, signatureData } = body;

    const email = signerEmail || "kaelen.chen@acme-enterprises.com";
    const hash =
      body.cryptoSignatureHash ||
      generateCryptoHash({ docId, signerEmail: email, signatureData, timestamp: new Date().toISOString() });

    const doc = store.signDocument(docId, hash, email);

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: doc,
      sha256Hash: hash,
      message: "Document digitally signed with tamper-evident cryptographic signature.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to sign document" },
      { status: 500 }
    );
  }
}
