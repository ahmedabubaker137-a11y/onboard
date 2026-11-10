import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const chart = store.getOrgChart();
  return NextResponse.json({
    success: true,
    data: chart,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { managerId, member } = body;

    if (!managerId || !member || !member.name) {
      return NextResponse.json(
        { success: false, error: "managerId and member details are required" },
        { status: 400 }
      );
    }

    const newMember = {
      id: member.id || `node_${Date.now()}`,
      name: member.name,
      role: member.role || "Team Member",
      department: member.department || "Engineering",
      email: member.email || `${member.name.toLowerCase().replace(/\s+/g, ".")}@acme.com`,
      avatarUrl:
        member.avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };

    const added = store.addOrgMember(managerId, newMember);

    if (!added) {
      return NextResponse.json(
        { success: false, error: "Manager node not found in organization tree" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${newMember.name} added to organizational hierarchy under manager ${managerId}.`,
      data: store.getOrgChart(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update organizational structure" },
      { status: 500 }
    );
  }
}
