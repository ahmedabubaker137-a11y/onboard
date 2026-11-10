import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { DocumentTemplateItem } from "@/lib/data/mock-db";

export async function GET() {
  const templates = store.getDocumentTemplates();
  return NextResponse.json({
    success: true,
    data: templates,
    total: templates.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, version, content } = body;

    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title and category" },
        { status: 400 }
      );
    }

    const tpl: DocumentTemplateItem = {
      id: `dt_${Date.now()}`,
      title,
      category,
      version: version || "v1.0",
      content: content || "Standard agreement text.",
      updatedAt: new Date().toISOString().split("T")[0],
    };

    store.createDocumentTemplate(tpl);

    return NextResponse.json({
      success: true,
      message: `Document template "${tpl.title}" created.`,
      template: tpl,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create document template" },
      { status: 500 }
    );
  }
}
