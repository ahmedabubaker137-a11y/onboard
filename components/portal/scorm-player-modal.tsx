"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, ChevronRight, ChevronLeft, Award, ShieldAlert, BookOpen, Clock, RefreshCw, X } from "lucide-react";
import type { ScormCourseItem } from "@/lib/types";

interface ScormPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: ScormCourseItem;
  employeeId: string;
  onCourseComplete?: (courseId: string, score: number) => void;
}

export function ScormPlayerModal({
  isOpen,
  onClose,
  course,
  employeeId,
  onCourseComplete,
}: ScormPlayerModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quizSelection, setQuizSelection] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(course.status === "PASSED" || course.status === "COMPLETED");
  const [score, setScore] = useState<number>(course.score || 100);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const slides = [
    {
      title: "Module 1: Principles of Enterprise Security",
      content:
        "Every engineer and teammate at Acme is an active custodian of corporate data integrity. Our production and corporate networks are partitioned via Zero-Trust network architecture. All internal tools require FIDO2 hardware tokens or biometrics.",
      bulletPoints: [
        "Never paste customer PII or proprietary source code into unapproved public LLMs.",
        "Ensure full-disk FileVault or BitLocker encryption remains active on company laptops.",
        "Lock screens when stepping away from desks or public coffee shops.",
      ],
    },
    {
      title: "Module 2: Phishing & Social Engineering Vectors",
      content:
        "Modern threat actors use targeted spear-phishing over Slack, SMS, and email mimicking executive requests for urgent gift cards or credential resets.",
      bulletPoints: [
        "Inspect sender SPF/DKIM flags on high-urgency notifications.",
        "Never approve Okta/Duo push MFA notifications you did not initiate.",
        "Report suspicious activity immediately via the Anonymous Whistleblower or IT Security Slack channel.",
      ],
    },
    {
      title: "Knowledge Check: Interactive SCORM Quiz",
      question:
        "A message on Slack from someone with the CEO's profile picture asks you to urgently wire vendor funds or buy gift cards for a company milestone. What is the mandatory protocol?",
      options: [
        "Comply immediately because it is marked high priority.",
        "Verify identity through out-of-band communication with People Ops and flag as security incident.",
        "Reply with company credit card information.",
        "Ignore it and delete your Slack client.",
      ],
      correctIndex: 1,
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleCommitScorm = async () => {
    setIsSubmitting(true);
    const finalScore = quizSelection === 1 ? 100 : 80;
    setScore(finalScore);

    try {
      const res = await fetch("/api/v1/scorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          score: finalScore,
          status: "PASSED",
          progress: 100,
          timeSpentMinutes: (course.timeSpentMinutes || 0) + 15,
        }),
      });

      if (res.ok) {
        setIsCompleted(true);
        if (onCourseComplete) {
          onCourseComplete(course.id, finalScore);
        }
      }
    } catch (e) {
      console.error("SCORM runtime commit error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-graphite-surface border border-mist dark:border-graphite-muted/30 rounded-xl shadow-2xl max-w-3xl w-full p-6 text-graphite dark:text-ivory animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* SCORM LMS Runtime Header */}
        <div className="flex items-center justify-between border-b border-mist dark:border-graphite-muted/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pine text-ivory flex items-center justify-center font-bold shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-headline">{course.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-pine/10 text-pine dark:text-amberSignal border border-pine/20">
                  {course.standard} RUNTIME
                </span>
              </div>
              <p className="text-xs text-graphite-muted dark:text-gray-400">
                LMS Manifest: <code className="font-mono text-[11px]">{course.id}</code> • Passing Grade: 80%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-graphite-muted hover:text-graphite dark:hover:text-ivory transition-colors p-1.5 rounded-lg hover:bg-mist dark:hover:bg-graphite cursor-pointer"
            aria-label="Close SCORM Course"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Telemetry Bar */}
        <div className="mb-5 bg-mist/30 dark:bg-graphite-muted/15 p-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
            <span>Time Elapsed: 18m 42s</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Slide {currentSlide + 1} of {slides.length}</span>
            <div className="w-28 h-2 bg-mist dark:bg-graphite rounded-full overflow-hidden">
              <div
                className="h-full bg-forest transition-all"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Course Slide Content */}
        <div className="min-h-[260px] p-5 rounded-xl border border-mist/80 dark:border-graphite-muted/20 bg-warmIvory/30 dark:bg-graphite/30 space-y-4">
          <h4 className="text-base font-bold font-headline text-pine dark:text-amberSignal">
            {currentSlideData.title}
          </h4>

          {currentSlideData.content && (
            <p className="text-xs leading-relaxed text-graphite-muted dark:text-gray-300">
              {currentSlideData.content}
            </p>
          )}

          {currentSlideData.bulletPoints && (
            <ul className="space-y-2 text-xs text-graphite dark:text-gray-200">
              {currentSlideData.bulletPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-pine dark:bg-amberSignal mt-1.5 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          )}

          {currentSlideData.question && (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-graphite dark:text-ivory">
                {currentSlideData.question}
              </p>
              <div className="space-y-2">
                {currentSlideData.options?.map((opt, idx) => {
                  const isSelected = quizSelection === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setQuizSelection(idx)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-pine text-ivory border-pine font-medium shadow-xs"
                          : "bg-white dark:bg-graphite border-mist dark:border-graphite-muted/30 text-graphite dark:text-gray-300 hover:border-pine"
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="p-3 bg-forest/10 border border-forest/30 rounded-lg text-xs text-forest dark:text-[#38B38A] flex items-center gap-2">
              <Award className="w-5 h-5 shrink-0" />
              <div>
                <strong>Course Verified & Completed!</strong> Telemetry score: {score}%. SCORM manifest reported to employee records.
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation & Commit Actions */}
        <div className="mt-6 pt-4 border-t border-mist dark:border-graphite-muted/20 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-mist dark:border-graphite-muted/30 text-xs font-semibold text-graphite dark:text-ivory hover:bg-mist/40 disabled:opacity-30 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentSlide < slides.length - 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-pine hover:bg-pine/90 text-ivory text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-[0.98]"
              >
                <span>Next Module</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCommitScorm}
                disabled={isSubmitting || quizSelection === null}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-forest hover:bg-forest/90 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-colors cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Submit & Record SCORM Telemetry</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
