import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import type { EmployeeData } from "@/lib/types";

function sanitizeEmployee(emp: EmployeeData) {
  const { encryptedPii, ...rest } = emp;
  return {
    ...rest,
    encryptedPii: encryptedPii ? {
      ssnMasked: encryptedPii.ssnMasked,
      isEncrypted: encryptedPii.isEncrypted ?? true,
    } : undefined,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = store.getEmployeeById(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    const documents = store.getDocuments(id);
    const assets = store.getAssets().filter((a) => a.assignedToEmployeeId === id);

    return NextResponse.json({
      success: true,
      data: {
        ...sanitizeEmployee(employee),
        documents,
        assets,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve employee" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Prevent overwriting immutable keys
    const { id: _ignoredId, ...safeUpdates } = body;

    const updated = store.updateEmployee(id, safeUpdates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sanitizeEmployee(updated),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update employee" },
      { status: 500 }
    );
  }
}
