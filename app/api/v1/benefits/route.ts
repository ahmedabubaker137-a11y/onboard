import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const benefits = store.getBenefits();
  return NextResponse.json({
    success: true,
    data: benefits,
  });
}
