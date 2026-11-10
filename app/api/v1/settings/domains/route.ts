import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const domains = store.getCustomDomains();
  return NextResponse.json({ domains });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json({ error: "domain is required" }, { status: 400 });
    }

    const newDomain = store.addCustomDomain(domain);
    return NextResponse.json({
      success: true,
      message: `Custom domain ${domain} registered. Point CNAME to cname.onboardx.io.`,
      domain: newDomain,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add domain" }, { status: 500 });
  }
}
