import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const floor = searchParams.get("floor");
  let desks = store.getOfficeDesks();
  if (floor) {
    desks = desks.filter((d) => String(d.floor).toLowerCase().includes(floor.toLowerCase()));
  }
  return NextResponse.json({ desks });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deskId, employeeId, employeeName } = body;

    if (!deskId) {
      return NextResponse.json({ error: "deskId is required" }, { status: 400 });
    }

    const updatedDesk = store.assignOfficeDesk(deskId, employeeId || null, employeeName || null);
    if (!updatedDesk) {
      return NextResponse.json({ error: "Desk not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: employeeId ? `Desk ${deskId} assigned to ${employeeName}` : `Desk ${deskId} released`,
      desk: updatedDesk,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update desk assignment" }, { status: 500 });
  }
}
