import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateTitle, employeeId } = body;

    if (!templateTitle || !employeeId) {
      return NextResponse.json(
        { success: false, error: "templateTitle and employeeId are required" },
        { status: 400 }
      );
    }

    const result = store.assignDocument(templateTitle, employeeId);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Template "${templateTitle}" assigned to employee ${employeeId}.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to assign document" },
      { status: 500 }
    );
  }
}
