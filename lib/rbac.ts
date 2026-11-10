export type RoleType = "ADMIN" | "HR_MANAGER" | "IT_PROVISIONER" | "MANAGER" | "EMPLOYEE";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  title: string;
  companyId: string;
  avatarUrl?: string;
  employeeId?: string; // If role is EMPLOYEE
}

export const DEMO_USERS: Record<RoleType, CurrentUser> = {
  ADMIN: {
    id: "usr_admin_01",
    name: "Eleanor Vance",
    email: "eleanor.vance@acme-enterprises.com",
    role: "ADMIN",
    title: "Chief Operating Officer",
    companyId: "comp_acme_01",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  HR_MANAGER: {
    id: "usr_hr_01",
    name: "Marcus Thorne",
    email: "marcus.thorne@acme-enterprises.com",
    role: "HR_MANAGER",
    title: "Director of People & Culture",
    companyId: "comp_acme_01",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  IT_PROVISIONER: {
    id: "usr_it_01",
    name: "Devon Reed",
    email: "devon.reed@acme-enterprises.com",
    role: "IT_PROVISIONER",
    title: "Senior IT Systems Engineer",
    companyId: "comp_acme_01",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  MANAGER: {
    id: "usr_mgr_01",
    name: "Sofia Calderon",
    email: "sofia.calderon@acme-enterprises.com",
    role: "MANAGER",
    title: "VP of Product Engineering",
    companyId: "comp_acme_01",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  EMPLOYEE: {
    id: "usr_emp_01",
    name: "Kaelen Chen",
    email: "kaelen.chen@acme-enterprises.com",
    role: "EMPLOYEE",
    title: "Staff Distributed Systems Engineer",
    companyId: "comp_acme_01",
    employeeId: "emp_kaelen_01",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
};

export const PERMISSIONS = {
  CAN_MANAGE_COMPANY: ["ADMIN"],
  CAN_MANAGE_EMPLOYEES: ["ADMIN", "HR_MANAGER"],
  CAN_MANAGE_TEMPLATES: ["ADMIN", "HR_MANAGER"],
  CAN_PROVISION_ASSETS: ["ADMIN", "IT_PROVISIONER"],
  CAN_VIEW_AUDIT_LOGS: ["ADMIN", "HR_MANAGER"],
  CAN_SIGN_DOCUMENTS: ["EMPLOYEE"],
  CAN_ACCESS_PORTAL: ["EMPLOYEE", "ADMIN", "HR_MANAGER"],
};

export const ROLE_ROUTE_ACCESS: Record<RoleType, string[]> = {
  ADMIN: [
    "/dashboard",
    "/portal",
    "/employees",
    "/templates",
    "/assets",
    "/documents",
    "/compliance",
    "/requisitions",
    "/org-chart",
    "/ai",
    "/settings",
    "/whistleblower",
  ],
  HR_MANAGER: [
    "/dashboard",
    "/portal",
    "/employees",
    "/templates",
    "/assets",
    "/documents",
    "/compliance",
    "/requisitions",
    "/org-chart",
    "/ai",
    "/settings",
    "/whistleblower",
  ],
  IT_PROVISIONER: [
    "/dashboard",
    "/assets",
    "/employees",
    "/compliance",
    "/org-chart",
  ],
  EMPLOYEE: [
    "/portal",
    "/org-chart",
    "/compliance",
    "/whistleblower",
  ],
  MANAGER: [
    "/dashboard",
    "/employees",
    "/requisitions",
    "/compliance",
    "/org-chart",
  ],
};

export function hasPermission(role: RoleType, permissionKey: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[permissionKey].includes(role);
}

export function isRouteAllowedForRole(role: RoleType, pathname: string): boolean {
  if (pathname === "/" || pathname === "/login" || pathname === "/whistleblower" || pathname.startsWith("/whistleblower")) {
    return true;
  }
  const allowed = ROLE_ROUTE_ACCESS[role] || [];
  return allowed.some((route) => pathname === route || pathname.startsWith(route + "/"));
}
