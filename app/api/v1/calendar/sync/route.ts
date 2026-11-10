import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, managerEmail, date, time, title, durationMinutes = 45 } = body;

    const employee = store.getEmployees().find((e) => e.id === employeeId);
    const empName = employee ? `${employee.firstName} ${employee.lastName}` : "New Hire";
    const empEmail = employee?.email || "hire@acme.corp";

    const sessionTitle = title || `1-on-1 Onboarding Alignment: ${empName}`;
    const startIso = date && time ? `${date}T${time}:00Z` : new Date(Date.now() + 86400000).toISOString();
    
    // Generate Google Calendar & Outlook direct scheduling links
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(sessionTitle)}&dates=${startIso.replace(/[-:]/g, "").slice(0, 15)}Z/${startIso.replace(/[-:]/g, "").slice(0, 15)}Z&details=${encodeURIComponent("First week alignment 1-on-1 scheduled via OnboardX enterprise calendar sync.")}&add=${encodeURIComponent(empEmail)},${encodeURIComponent(managerEmail || "manager@acme.corp")}`;

    // Simple ICS file content generator
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//OnboardX Inc//Enterprise Calendar 1.0//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `SUMMARY:${sessionTitle}`,
      `DESCRIPTION:1-on-1 onboarding alignment session with manager. Auto-scheduled by OnboardX.`,
      `ORGANIZER;CN=OnboardX Bot:mailto:notifications@acme.corp`,
      `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${empName}:mailto:${empEmail}`,
      `DTSTART:${startIso.replace(/[-:]/g, "").slice(0, 15)}Z`,
      `DURATION:PT${durationMinutes}M`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    store.addAuditLog(
      empEmail,
      "EMPLOYEE",
      "CALENDAR_1ON1_SCHEDULED",
      "CalendarSync",
      `cal_${Date.now()}`,
      { title: sessionTitle, startTime: startIso, managerEmail: managerEmail || "manager@acme.corp" }
    );

    return NextResponse.json({
      success: true,
      message: `1-on-1 meeting scheduled for ${empName}`,
      meeting: {
        title: sessionTitle,
        startTime: startIso,
        durationMinutes,
        attendees: [empEmail, managerEmail || "manager@acme.corp"],
        googleCalendarUrl: gcalUrl,
        icsFileContent: icsContent,
        zoomLink: "https://zoom.us/j/9823418921?pwd=OnboardXPasscode2026",
      },
    });
  } catch (error) {
    console.error("Calendar Sync Error:", error);
    return NextResponse.json({ error: "Failed to schedule calendar 1-on-1" }, { status: 500 });
  }
}
