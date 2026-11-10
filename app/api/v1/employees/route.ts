import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { EmployeeData } from "@/lib/data/mock-db";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dept = searchParams.get("department");
  let employees = store.getEmployees();

  if (dept && dept !== "ALL") {
    employees = employees.filter((e) => e.department === dept);
  }

  return NextResponse.json({
    success: true,
    data: employees.map(sanitizeEmployee),
    total: employees.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, jobTitle, department, templateId, startDate } = body;

    if (!firstName || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: firstName and email" },
        { status: 400 }
      );
    }

    const templates = store.getTemplates();
    const tpl = templates.find((t) => t.id === templateId) || templates[0];

    const newEmp: EmployeeData = {
      id: `emp_${Date.now()}`,
      firstName,
      lastName: lastName || "",
      email,
      jobTitle: jobTitle || "Staff Engineer",
      department: department || "Engineering",
      managerName: "Sofia Calderon",
      startDate: startDate || new Date().toISOString().split("T")[0],
      status: "INVITED",
      progress: 0,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      phone: "+1 (555) 000-0000",
      tasks: tpl.tasks.map((task, idx) => ({
        ...task,
        id: `t_${Date.now()}_${idx}`,
        status: "PENDING",
      })),
    };

    store.addEmployee(newEmp);

    return NextResponse.json({
      success: true,
      data: sanitizeEmployee(newEmp),
      message: "Employee provisioned and onboarding template workflows initiated.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
