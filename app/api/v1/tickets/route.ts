import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const tickets = store.getTickets();
  return NextResponse.json({
    success: true,
    data: tickets,
    total: tickets.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, employeeName, title, description, category, priority } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title and description" },
        { status: 400 }
      );
    }

    const ticket = store.createTicket({
      employeeId: employeeId || "emp_kaelen_01",
      employeeName: employeeName || "Kaelen Chen",
      title,
      description,
      category: category || "GENERAL",
      priority: priority || "HIGH",
    });

    return NextResponse.json({
      success: true,
      message: "IT Support rapid ticket dispatched to Devon Reed.",
      ticket,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to dispatch support ticket" },
      { status: 500 }
    );
  }
}
