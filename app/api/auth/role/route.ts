import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEMO_USERS, RoleType, PERMISSIONS } from "@/lib/rbac";
import { store } from "@/lib/db";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("onboardx_current_role")?.value as RoleType;
  const activeRole: RoleType = roleCookie && DEMO_USERS[roleCookie] ? roleCookie : "HR_MANAGER";
  const user = DEMO_USERS[activeRole];

  return NextResponse.json({
    role: activeRole,
    user,
    permissions: Object.keys(PERMISSIONS).filter((p) =>
      PERMISSIONS[p as keyof typeof PERMISSIONS].includes(activeRole)
    ),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const role: RoleType = body.role;

    if (!role || !DEMO_USERS[role]) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set("onboardx_current_role", role, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    const user = DEMO_USERS[role];

    // Log security audit record
    store.addAuditLog(
      user.email,
      role,
      "USER_ROLE_SWITCHED",
      "AuthenticationSession",
      user.id,
      { newRole: role, userName: user.name, title: user.title }
    );

    return NextResponse.json({
      success: true,
      role,
      user,
      permissions: Object.keys(PERMISSIONS).filter((p) =>
        PERMISSIONS[p as keyof typeof PERMISSIONS].includes(role)
      ),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to switch role" }, { status: 500 });
  }
}
