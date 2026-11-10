import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = store.getEmployeeById(id);

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee record not found" }, { status: 404 });
    }

    const definitions = store.getCustomFields();

    return NextResponse.json({
      success: true,
      data: {
        employeeId: id,
        definitions,
        values: employee.customFieldValues || {},
        encryptedPii: employee.encryptedPii ? {
          ssnMasked: employee.encryptedPii.ssnMasked,
          isEncrypted: employee.encryptedPii.isEncrypted,
        } : undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to retrieve custom fields" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { values, actorEmail } = body;

    if (!values || typeof values !== "object") {
      return NextResponse.json(
        { success: false, error: "Values payload must be a key-value dictionary object" },
        { status: 400 }
      );
    }

    const updatedEmp = store.updateEmployeeCustomFields(
      id,
      values,
      actorEmail || "marcus.thorne@acme-enterprises.com"
    );

    if (!updatedEmp) {
      return NextResponse.json({ success: false, error: "Employee record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        employeeId: id,
        customFieldValues: updatedEmp.customFieldValues,
      },
      message: "Employee custom attributes updated and cryptographically audited.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to update custom fields" }, { status: 500 });
  }
}
