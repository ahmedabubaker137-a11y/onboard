import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const courses = store.getScormCourses();
  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, score, status, progress, timeSpentMinutes } = body;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const updated = store.updateScormProgress(courseId, {
      score: score !== undefined ? score : undefined,
      status: status || undefined,
      progress: progress !== undefined ? progress : undefined,
      timeSpentMinutes: timeSpentMinutes !== undefined ? timeSpentMinutes : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `SCORM runtime data committed. Course status is now ${updated.status}`,
      course: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record SCORM telemetry" }, { status: 500 });
  }
}
