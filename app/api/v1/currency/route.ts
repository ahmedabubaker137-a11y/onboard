import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";
import { CURRENCY_RATES, CurrencyCode } from "@/lib/data/mock-db";

export async function GET() {
  const currentCurrency = store.getCurrency();
  const rateObj = CURRENCY_RATES[currentCurrency] || { symbol: "$", rate: 1, label: "US Dollar" };
  return NextResponse.json({
    currentCurrency,
    currency: currentCurrency,
    rate: rateObj.rate,
    symbol: rateObj.symbol,
    label: rateObj.label,
    rates: CURRENCY_RATES,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currency } = body;

    if (!currency || !CURRENCY_RATES[currency as CurrencyCode]) {
      return NextResponse.json({ error: "Invalid or unsupported currency" }, { status: 400 });
    }

    const updated = store.setCurrency(currency as CurrencyCode);
    const rateObj = CURRENCY_RATES[updated] || { symbol: "$", rate: 1, label: "US Dollar" };
    return NextResponse.json({
      success: true,
      message: `Active payroll prep currency changed to ${updated}`,
      currentCurrency: updated,
      currency: updated,
      rate: rateObj.rate,
      symbol: rateObj.symbol,
      label: rateObj.label,
      rates: CURRENCY_RATES,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to set currency" }, { status: 500 });
  }
}
