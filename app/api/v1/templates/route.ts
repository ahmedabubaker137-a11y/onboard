import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { TemplateData } from "@/lib/data/mock-db";

export async function GET() {
  const templates = store.getTemplates();
  return NextResponse.json({
    success: true,
    data: templates,
    total: templates.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, targetRole, department, tasks } = body;

    if (!title || !department) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title and department" },
        { status: 400 }
      );
    }

    const newTemplate: TemplateData = {
      id: `tpl_${Date.now()}`,
      title,
      description: description || "",
      targetRole: targetRole || "General Hire",
      department,
      tasksCount: tasks?.length || 3,
      tasks: tasks || [
        {
          id: `t_${Date.now()}_1`,
          title: "Sign Standard Employment Contract",
          description: "Review and e-sign company contract.",
          category: "LEGAL_DOCUMENT",
          assignedTo: "EMPLOYEE",
          dueDays: 1,
        },
        {
          id: `t_${Date.now()}_2`,
          title: "Provision Standard Laptop Workstation",
          description: "Ship hardware.",
          category: "IT_PROVISIONING",
          assignedTo: "IT",
          dueDays: 1,
        },
        {
          id: `t_${Date.now()}_3`,
          title: "Schedule Team Orientation 1-on-1",
          description: "Meet team lead.",
          category: "TEAM_ORIENTATION",
          assignedTo: "MANAGER",
          dueDays: 3,
        },
      ],
    };

    store.createTemplate(newTemplate);

    return NextResponse.json({
      success: true,
      data: newTemplate,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create template" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing template id" }, { status: 400 });
    }
    const success = store.deleteTemplate(id);
    return NextResponse.json({ success, data: store.getTemplates() });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete template" }, { status: 500 });
  }
}
