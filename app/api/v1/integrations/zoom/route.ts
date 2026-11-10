import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    cohort: "Q3 Global Engineering & Product New Hires",
    topic: "Enterprise Orientation & Security Briefing",
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    durationMinutes: 60,
    meetingId: "849 2039 4812",
    passcode: "ONBOARDX-SECURE",
    joinUrl: "https://zoom.us/j/84920394812?pwd=ONBOARDX-SECURE",
    host: "Elena Rostova (VP of People)",
    status: "CONFIRMED",
    agenda: [
      "00:00 - Welcome & Cultural Architecture",
      "00:20 - IT Infrastructure & Hardware Setup",
      "00:40 - Security & Compliance Protocols",
      "00:55 - Q&A with Department Mentors",
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, durationMinutes = 60, host = "VP of People" } = body;

    const randomMeetingId = `${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const session = {
      cohort: "Live Orientation Session",
      topic: topic || "Company Orientation & Welcome",
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      durationMinutes,
      meetingId: randomMeetingId,
      passcode: "OX-" + Math.floor(100000 + Math.random() * 900000),
      joinUrl: `https://zoom.us/j/${randomMeetingId.replace(/\s/g, "")}`,
      host,
      status: "CONFIRMED",
    };

    return NextResponse.json({ success: true, session });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate Zoom orientation" }, { status: 500 });
  }
}
