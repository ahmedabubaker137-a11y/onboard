import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { employeeId, status = "COMPLETED" } = body;

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: "employeeId is required in request body" },
        { status: 400 }
      );
    }

    const result = store.updateTaskStatus(employeeId, taskId, status);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Task or employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Task marked as ${status}. New employee progress: ${result.employee.progress}%`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update task status" },
      { status: 500 }
    );
  }
}
