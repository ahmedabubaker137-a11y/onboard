import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId") || undefined;
  const certs = store.getCertifications(employeeId);

  return NextResponse.json({
    success: true,
    data: certs,
    total: certs.length,
    expiringSoonCount: certs.filter((c) => c.status === "EXPIRING_SOON").length,
    expiredCount: certs.filter((c) => c.status === "EXPIRED").length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, employeeName, name, issuingAuthority, licenseNumber, issueDate, expiryDate } = body;

    if (!employeeId || !name || !expiryDate) {
      return NextResponse.json(
        { success: false, error: "Missing required certification attributes" },
        { status: 400 }
      );
    }

    const created = store.addCertification({
      employeeId,
      employeeName: employeeName || "Employee",
      name,
      issuingAuthority: issuingAuthority || "Accredited Body",
      licenseNumber: licenseNumber || `LIC-${Date.now()}`,
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      expiryDate,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: "Professional certification registered with automated expiration monitoring.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to register certification" }, { status: 500 });
  }
}
