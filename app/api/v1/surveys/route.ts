import { NextResponse } from "next/server";
import { store } from "@/lib/db";

export async function GET() {
  const surveys = store.getSurveys();
  const eNPS = store.getENPS();

  return NextResponse.json({
    success: true,
    data: surveys,
    eNPS,
    total: surveys.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, employeeName, surveyType, score, feedback } = body;

    if (!score || score < 1 || score > 10) {
      return NextResponse.json(
        { success: false, error: "Score must be an integer between 1 and 10" },
        { status: 400 }
      );
    }

    const created = store.submitSurvey({
      employeeId: employeeId || "emp_kaelen_01",
      employeeName: employeeName || "Kaelen Chen",
      surveyType: surveyType || "30_DAY",
      score: Number(score),
      feedback: feedback || "Onboarding was smooth and well structured.",
    });

    const currentENPS = store.getENPS();

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully! eNPS metrics recalculated.",
      survey: created,
      currentENPS,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to submit survey feedback" },
      { status: 500 }
    );
  }
}
