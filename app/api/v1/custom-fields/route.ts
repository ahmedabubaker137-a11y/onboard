import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  try {
    const fields = store.getCustomFields();
    return NextResponse.json({
      success: true,
      data: fields,
      total: fields.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to retrieve custom fields" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, label, type, options, required, defaultValue, category } = body;

    if (!name || !label || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required attributes: name, label, and type are mandatory" },
        { status: 400 }
      );
    }

    const created = store.addCustomField({
      name: name.toLowerCase().replace(/\s+/g, "_"),
      label,
      type,
      options: options || [],
      required: Boolean(required),
      defaultValue: defaultValue || "",
      category: category || "PERSONAL",
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: "Custom field created successfully and propagated across enterprise employee schemas.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to create custom field" }, { status: 500 });
  }
}
