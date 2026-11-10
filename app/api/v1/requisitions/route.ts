import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const department = searchParams.get("department");
  const status = searchParams.get("status");

  let reqs = store.getJobRequisitions();
  if (department) {
    reqs = reqs.filter((r) => r.department.toLowerCase() === department.toLowerCase());
  }
  if (status) {
    reqs = reqs.filter((r) => r.status === status);
  }

  return NextResponse.json({ requisitions: reqs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, department, hiringManager, targetStartDate, salaryRange, headcount = 1, priority = "MEDIUM" } = body;

    if (!title || !department || !hiringManager) {
      return NextResponse.json({ error: "Missing required requisition fields" }, { status: 400 });
    }

    const newReq = store.createJobRequisition({
      title,
      department,
      hiringManager,
      targetStartDate: targetStartDate || new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
      salaryRange: salaryRange || "$140,000 - $170,000",
      headcount: Number(headcount),
      priority,
      status: "PENDING_APPROVAL",
    });

    return NextResponse.json({
      success: true,
      message: `Job requisition ${newReq.id} created for ${title}`,
      requisition: newReq,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create job requisition" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { requisitionId, status } = body;

    if (!requisitionId || !status) {
      return NextResponse.json({ error: "requisitionId and status are required" }, { status: 400 });
    }

    const updated = store.updateJobRequisitionStatus(requisitionId, status);
    if (!updated) {
      return NextResponse.json({ error: "Requisition not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Requisition ${requisitionId} status transitioned to ${status}`,
      requisition: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update requisition status" }, { status: 500 });
  }
}
