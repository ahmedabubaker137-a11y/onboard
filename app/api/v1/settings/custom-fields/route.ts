import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const fields = store.getCustomFields();
  return NextResponse.json({ fields });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, label, type, options, required, defaultValue } = body;

    if (!name || !label || !type) {
      return NextResponse.json({ error: "name, label, and type are required" }, { status: 400 });
    }

    const newField = store.addCustomField({
      name,
      label,
      type,
      options: options || undefined,
      required: !!required,
      defaultValue: defaultValue || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Custom attribute '${label}' added to employee profile schema`,
      field: newField,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create custom field" }, { status: 500 });
  }
}
