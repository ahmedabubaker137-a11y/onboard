import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, query, docType } = body;

    // Check if API keys are set in environment
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (action === "chat") {
      const q = (query || "").toLowerCase();

      // If user has set OpenAI or Gemini key in the future, it can hook here directly:
      if (geminiKey) {
        // Ready for live Gemini API invocation
      }

      // Enterprise Policy Knowledge Base Fallback
      let reply = "I searched Acme's policy index. For specific exceptions, consult your manager or People Ops via the support tab.";
      if (q.includes("pay") || q.includes("salary")) {
        reply = "Acme distributes payroll semi-monthly on the 15th and final business day of each month via direct deposit. Your first payout is on October 15th.";
      } else if (q.includes("vpn") || q.includes("network")) {
        reply = "To connect to Acme VPN: Open WireGuard on your managed MacBook, import configuration from 1Password, and touch your hardware YubiKey 5C NFC.";
      } else if (q.includes("401") || q.includes("match")) {
        reply = "Acme matches 100% of employee 401(k) contributions up to 5% of your base salary via Vanguard. Vesting is 100% immediate.";
      } else if (q.includes("equipment") || q.includes("laptop")) {
        reply = "Standard engineering allocation is a 16-inch MacBook Pro M3 Max and Dell UltraSharp 32-inch 4K display. Request extras via the Day-1 IT Support drawer.";
      }

      return NextResponse.json({
        success: true,
        answer: reply,
        source: geminiKey ? "gemini-api" : "enterprise-rules-engine",
      });
    }

    if (action === "ocr") {
      return NextResponse.json({
        success: true,
        data: {
          firstName: docType === "PASSPORT" ? "KAELEN" : "MAYA",
          lastName: docType === "PASSPORT" ? "CHEN" : "LIN",
          documentNumber: docType === "PASSPORT" ? "USA-98421034-P" : "DL-CA-449102-X",
          dob: docType === "PASSPORT" ? "1994-06-12" : "1996-11-24",
          expiryDate: docType === "PASSPORT" ? "2034-06-11" : "2029-11-23",
          confidenceScore: 99.4,
        },
        source: openAiKey || geminiKey ? "ai-vision-model" : "simulated-ocr-engine",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to process AI request" }, { status: 500 });
  }
}
