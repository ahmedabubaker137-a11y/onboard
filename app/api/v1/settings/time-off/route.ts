import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const policies = store.getTimeOffPolicies();
  return NextResponse.json({
    success: true,
    data: policies,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.name) {
      const pol = {
        id: body.id || `pol_${Date.now()}`,
        name: body.name,
        daysPerYear: Number(body.daysPerYear) || 15,
        accrualFrequency: body.accrualFrequency || "Monthly",
        rolloverAllowed: body.rolloverAllowed !== undefined ? body.rolloverAllowed : true,
      };
      const created = store.addTimeOffPolicy(pol);
      return NextResponse.json({
        success: true,
        message: `Time-off policy "${created.name}" created.`,
        data: created,
      });
    }

    const { policies } = body;
    if (!Array.isArray(policies)) {
      return NextResponse.json(
        { success: false, error: "Policies must be an array or provide policy name" },
        { status: 400 }
      );
    }

    const updated = store.updateTimeOffPolicies(policies);

    return NextResponse.json({
      success: true,
      message: "Time-off policies updated successfully.",
      policies: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update time-off policies" },
      { status: 500 }
    );
  }
}
