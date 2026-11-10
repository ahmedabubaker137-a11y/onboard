"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import type { EmployeeData, TaskItem, BenefitPlan, AssetData, CurrencyCode } from "@/lib/types";
import { useRole } from "@/lib/use-role";
import { addNotification } from "@/lib/notifications";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";
import { formatCurrency } from "@/lib/currency";
import { CurrencySwitcher } from "@/components/dashboard/currency-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { SignaturePad } from "@/components/ui/signature-pad";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  CheckCircle2,
  Circle,
  Clock,
  Play,
  FileText,
  Laptop,
  Heart,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  ArrowRight,
  Eye,
  Calendar,
  MapPin,
  Package,
  Award,
} from "lucide-react";
import { SwagStore } from "@/components/portal/swag-store";
import { InteractiveOfficeMap } from "@/components/portal/interactive-office-map";
import { ScormPlayerModal } from "@/components/portal/scorm-player-modal";
import { CalendarScheduleModal } from "@/components/portal/calendar-schedule-modal";
import { ZoomOrientationBanner } from "@/components/portal/zoom-orientation-banner";

export default function NewHirePortalPage() {
  const { currentRole, currentUser, switchRole } = useRole();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [activeTab, setActiveTab] = useState<"TASKS" | "BENEFITS" | "EQUIPMENT" | "TRAINING" | "SWAG" | "OFFICEMAP">("TASKS");
  const [benefits, setBenefits] = useState<BenefitPlan[]>([]);
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>("USD");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportCategory, setSupportCategory] = useState<"GENERAL" | "VPN" | "HARDWARE" | "ACCESS">("GENERAL");
  const [supportPriority, setSupportPriority] = useState<"MEDIUM" | "HIGH" | "URGENT">("HIGH");
  
  // Interactive Quiz State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // 30-Day Survey State
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [surveyScore, setSurveyScore] = useState<number>(10);
  const [surveyFeedback, setSurveyFeedback] = useState("");

  // Equipment Request State
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [equipType, setEquipType] = useState("Ergonomic Split Keyboard");
  const [equipNotes, setEquipNotes] = useState("");

  // Enterprise Modules State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isScormModalOpen, setIsScormModalOpen] = useState(false);
  const [selectedScormCourse, setSelectedScormCourse] = useState<any | null>(null);
  const [scormCourses, setScormCourses] = useState<any[]>([]);

  const [employeeAssets, setEmployeeAssets] = useState<AssetData[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPortalData = async () => {
    const targetEmpId = (currentUser as any)?.employeeId || "emp_kaelen_01";
    try {
      const res = await fetch(`/api/v1/employees/${targetEmpId}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setEmployee(json.data);
        }
      }
    } catch (e) {
      console.error("Failed to load portal data from server:", e);
    }

    try {
      const benRes = await fetch("/api/v1/benefits", { cache: "no-store" });
      if (benRes.ok) {
        const benJson = await benRes.json();
        if (benJson.data) setBenefits(benJson.data);
      }
    } catch (e) {
      console.error("Failed to load benefits:", e);
    }

    try {
      const scormRes = await fetch("/api/v1/scorm", { cache: "no-store" });
      if (scormRes.ok) {
        const scormData = await scormRes.json();
        if (scormData.courses) setScormCourses(scormData.courses);
      }
    } catch (e) {
      console.error("Failed to load SCORM courses:", e);
    }

    try {
      const assetRes = await fetch("/api/v1/assets", { cache: "no-store" });
      if (assetRes.ok) {
        const assetJson = await assetRes.json();
        if (assetJson.data) {
          const myAssets = assetJson.data.filter((a: AssetData) => a.assignedToEmployeeId === targetEmpId);
          setEmployeeAssets(myAssets);
        }
      }
    } catch (e) {
      console.error("Failed to load employee assets:", e);
    }
  };

  const fetchCurrency = async () => {
    try {
      const res = await fetch("/api/v1/currency", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.currency) setActiveCurrency(json.currency);
      }
    } catch (e) {
      console.error("Failed to load currency:", e);
    }
  };

  useEffect(() => {
    fetchPortalData();
    fetchCurrency();
    const unsubscribe = subscribeToDataChanges((event) => {
      fetchPortalData();
      if (!event || !event.type || event.type === "settings" || event.type === "focus") {
        fetchCurrency();
      }
    });
    return unsubscribe;
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    if (!employee) return;
    const task = employee.tasks.find((t) => t.id === taskId);
    const newStatus: "COMPLETED" | "PENDING" = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";

    // Optimistic UI update
    const updatedTasks = employee.tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    const completedCount = updatedTasks.filter((t) => t.status === "COMPLETED").length;
    const newProgress = Math.round((completedCount / updatedTasks.length) * 100);
    setEmployee({
      ...employee,
      tasks: updatedTasks,
      progress: newProgress,
      status: newProgress === 100 ? "COMPLETED" : newProgress > 0 ? "IN_PROGRESS" : "INVITED",
    });

    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id, status: newStatus }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.employee) {
          setEmployee({ ...json.data.employee });
        }
      }
    } catch (err) {
      console.error("Failed to persist task update to server:", err);
    }

    addNotification(
      `Task ${newStatus === "COMPLETED" ? "Completed" : "Reopened"}`,
      `${employee.firstName} marked "${task?.title || "onboarding task"}" as ${newStatus.toLowerCase()}. Progress is now ${newProgress}%.`,
      "employee",
      "/portal"
    );

    notifyDataChanged("task", { employeeId: employee.id, taskId, status: newStatus });

    if (newProgress === 100) {
      triggerConfetti();
      addNotification(
        "Onboarding 100% Completed",
        `${employee.firstName} ${employee.lastName} finished all Day 1 compliance tasks and paperwork!`,
        "employee",
        "/dashboard"
      );
      showToast("Congratulations! You have completed 100% of your onboarding checklist!");
    } else {
      showToast(`Task marked as ${newStatus === "COMPLETED" ? "completed" : "pending"}`);
    }
  };

  const handleSignatureSuccess = async (hash: string) => {
    if (!employee) return;
    try {
      await fetch("/api/v1/documents/doc_01/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerEmail: employee.email,
          cryptoSignatureHash: hash,
        }),
      });
    } catch (e) {
      console.error("Signature sync error:", e);
    }
    await handleTaskToggle("tk1", "PENDING");
    setIsSignModalOpen(false);
    notifyDataChanged("document", { employeeId: employee.id, docId: "doc_01" });
    addNotification(
      "PIIA Cryptographically Executed",
      `${employee.firstName} ${employee.lastName} executed Proprietary Information & Inventions Agreement with SHA-256 seal.`,
      "document",
      "/documents"
    );
    showToast("Electronic signature cryptographically stamped and verified!");
  };

  const handleBenefitToggle = async (benefitId: string) => {
    try {
      const res = await fetch(`/api/v1/benefits/${benefitId}/toggle`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        const updated = json.data;
        const benRes = await fetch("/api/v1/benefits", { cache: "no-store" });
        if (benRes.ok) {
          const benJson = await benRes.json();
          if (benJson.data) setBenefits(benJson.data);
        }
        notifyDataChanged("benefit", { benefitId });
        addNotification(
          "Benefits Enrollment Updated",
          `${employee?.firstName} ${employee?.lastName} updated election for ${updated.name} (${updated.isElected ? "Elected" : "Waived"}).`,
          "employee",
          "/portal"
        );
        showToast(`Updated election for ${updated.name}`);
        return;
      }
    } catch (e) {
      console.error("Benefit toggle error:", e);
      showToast("Unable to update benefit election via server.");
    }
  };

  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !supportMessage.trim()) return;

    try {
      await fetch("/api/v1/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          title: supportMessage.slice(0, 40) + (supportMessage.length > 40 ? "..." : ""),
          description: supportMessage,
          category: supportCategory,
          priority: supportPriority,
        }),
      });
    } catch (e) {
      console.error("Support ticket server sync error:", e);
    }

    addNotification(
      "IT Support Ticket Dispatched",
      `Priority ${supportPriority} ticket opened by ${employee.firstName} ${employee.lastName} for ${supportCategory}.`,
      "hardware",
      "/assets"
    );

    setIsSupportModalOpen(false);
    setSupportMessage("");
    notifyDataChanged("ticket", { employeeId: employee.id });
    showToast("High-priority IT ticket dispatched to Devon Reed with SLA tracking.");
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const correctCount = [quizAnswers[0] === 1, quizAnswers[1] === 2, quizAnswers[2] === 0].filter(Boolean).length;
    setQuizScore(correctCount);

    if (employee) {
      // Find security handbook task or mark second task complete
      const trainingTask = employee.tasks.find((t) => t.category === "TRAINING") || employee.tasks[1];
      if (trainingTask && trainingTask.status !== "COMPLETED") {
        await handleTaskToggle(trainingTask.id, "PENDING");
      }
    }
    notifyDataChanged("task", { employeeId: employee?.id, category: "TRAINING" });
    addNotification(
      "Security Module Passed",
      `${employee?.firstName} ${employee?.lastName} scored ${correctCount}/3 on InfoSec & SOC2 training exam.`,
      "employee",
      "/portal"
    );
    showToast(`Security quiz submitted with score ${correctCount}/3 (100% pass mark). Module verified!`);
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    try {
      await fetch("/api/v1/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          surveyType: "30_DAY",
          score: surveyScore,
          feedback: surveyFeedback || "Great experience and streamlined tools.",
        }),
      });
    } catch (e) {
      console.error("Survey sync error:", e);
    }

    // Auto complete the survey task tk8 if present
    const sentimentTask = employee.tasks.find((t) => t.id === "tk8" || t.title.toLowerCase().includes("sentiment") || t.title.toLowerCase().includes("survey"));
    if (sentimentTask && sentimentTask.status !== "COMPLETED") {
      await handleTaskToggle(sentimentTask.id, "PENDING");
    }

    notifyDataChanged("survey", { employeeId: employee.id, score: surveyScore });
    addNotification(
      "eNPS Survey Submitted",
      `${employee.firstName} ${employee.lastName} rated onboarding ${surveyScore}/10. Feedback synced with People Ops.`,
      "employee",
      "/settings"
    );

    setIsSurveyModalOpen(false);
    showToast(`Thank you for submitting your eNPS rating (${surveyScore}/10)! Feedback synced with People Ops.`);
  };

  const handleEquipRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    try {
      await fetch("/api/v1/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          title: `Equipment Request: ${equipType}`,
          description: `New hire requested ${equipType}. Notes: ${equipNotes || "Standard home office workstation setup"}`,
          category: "HARDWARE",
          priority: "MEDIUM",
        }),
      });
    } catch (e) {
      console.error("Equipment ticket sync error:", e);
    }

    notifyDataChanged("asset", { employeeId: employee.id, equipType });
    addNotification(
      "Hardware Order Requested",
      `${employee.firstName} ${employee.lastName} requested ${equipType} for their workstation.`,
      "hardware",
      "/assets"
    );

    setIsEquipModalOpen(false);
    setEquipNotes("");
    showToast(`Equipment order for "${equipType}" sent to IT inventory lead Devon Reed.`);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#274C4A", "#D98A1E", "#1F7A5C", "#F8F6F2"],
    });
  };

  if (!employee) {
    return <div className="p-8 text-center text-xs text-graphite-muted dark:text-gray-400">Loading employee experience...</div>;
  }

  const completedTasksCount = employee.tasks.filter((t) => t.status === "COMPLETED").length;
  const isAllComplete = employee.progress === 100;

  return (
    <RoleGuard
      allowedRoles={["EMPLOYEE", "ADMIN", "HR_MANAGER"]}
      moduleName="New Hire Onboarding Experience"
      description="The candidate portal is personalized for active onboardees and People Operations auditors. IT Provisioners manage hardware and software in the IT Assets Console."
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-pine dark:bg-[#284E4C] text-ivory px-4 py-3 shadow-elevation flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-forest dark:text-[#38B38A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role Preview Banner */}
      {currentRole !== "EMPLOYEE" && (
        <div className="rounded-xl border border-pine/30 bg-pine/10 dark:bg-pine/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pine text-ivory shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-graphite dark:text-ivory">
                  Simulation Preview Mode
                </span>
                <Badge variant="mist">{currentRole.replace("_", " ")}</Badge>
              </div>
              <p className="text-[11px] text-graphite-muted dark:text-gray-300 mt-0.5">
                Logged in as <strong>{currentUser.name}</strong>. You are previewing New Hire Kaelen Chen's Day 1 onboarding experience. All actions here simulate candidate execution.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => switchRole("EMPLOYEE")} className="text-xs">
              Switch to Kaelen Chen
            </Button>
            <Link href="/dashboard">
              <Button size="sm" variant="primary" className="text-xs gap-1.5">
                <span>Back to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Live Zoom Orientation Integration Banner */}
      <ZoomOrientationBanner />

      {/* Hero Welcome Banner */}
      <div className="rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark bg-white dark:bg-[#1A1F22] p-6 sm:p-8 shadow-subtle relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-pine/5 dark:from-pine/10 to-transparent pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="pine">New Hire Portal</Badge>
              <span className="text-xs text-graphite-muted dark:text-gray-400">Start Date: {employee.startDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline text-graphite dark:text-ivory tracking-tight">
              Welcome to Acme, {employee.firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-graphite-muted dark:text-gray-300 leading-relaxed">
              We are thrilled to have you join our team as{" "}
              <span className="font-semibold text-graphite dark:text-ivory">{employee.jobTitle}</span>.
              Here is your interactive roadmap to set up your tools, sign required paperwork,
              and connect with your team.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsVideoModalOpen(true)}
                className="gap-2 text-xs shadow-subtle"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch Company Culture Video</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSupportModalOpen(true)}
                className="gap-2 text-xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-steelBlue dark:text-[#7FA6BF]" />
                <span>Day-1 IT Support</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCalendarModalOpen(true)}
                className="gap-2 text-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
                <span>Auto-Schedule 1-on-1</span>
              </Button>
            </div>
          </div>

          {/* Progress Ring Card */}
          <div className="flex items-center justify-center p-4 rounded-xl bg-ivory dark:bg-[#14181B] border border-graphite-border/40 dark:border-graphite-borderDark shadow-subtle min-w-[200px]">
            <div className="flex flex-col items-center text-center">
              <ProgressRing progress={employee.progress} size={110} />
              <div className="mt-2 text-xs font-semibold text-graphite dark:text-ivory">
                {completedTasksCount} of {employee.tasks.length} Completed
              </div>
              <div className="text-[11px] text-graphite-muted dark:text-gray-400">
                {isAllComplete ? "All workflows finished!" : "Next: Review benefits selection"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Banner if 100% */}
      {isAllComplete && (
        <div className="rounded-xl border border-forest/30 dark:border-forest/50 bg-forest/10 dark:bg-forest/20 p-4 flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-headline text-forest dark:text-[#38B38A]">
                Onboarding Certification Completed
              </h4>
              <p className="text-[11px] text-graphite-muted dark:text-gray-300">
                All legal documents signed, IT hardware assigned, and initial orientations scheduled.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={triggerConfetti} className="text-xs gap-1.5 cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 text-amberSignal" />
            <span>Celebrate Completion</span>
          </Button>
        </div>
      )}

      {/* Portal Navigation Tabs */}
      <div className="flex border-b border-[#D8DFDE] dark:border-graphite-borderDark gap-4 overflow-x-auto text-xs font-headline font-semibold">
        <button
          onClick={() => setActiveTab("TASKS")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "TASKS"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Interactive Checklist ({employee.tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("BENEFITS")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "BENEFITS"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Self-Serve Benefits ({benefits.filter((b) => b.isElected).length} elected)</span>
        </button>

        <button
          onClick={() => setActiveTab("EQUIPMENT")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "EQUIPMENT"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Hardware & Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab("TRAINING")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "TRAINING"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Handbook, SCORM & Surveys</span>
        </button>

        <button
          onClick={() => setActiveTab("SWAG")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "SWAG"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Welcome Swag Store</span>
        </button>

        <button
          onClick={() => setActiveTab("OFFICEMAP")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "OFFICEMAP"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Office Map & Desk</span>
        </button>
      </div>

      {/* Tab 1: Interactive Checklist */}
      {activeTab === "TASKS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-graphite-muted dark:text-gray-400">
            <span>Click any task to update completion status.</span>
            <span className="font-semibold text-pine dark:text-amberSignal">Phase: Active First 30 Days</span>
          </div>

          <div className="space-y-3">
            {employee.tasks.map((task) => {
              const isCompleted = task.status === "COMPLETED";

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border p-4 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCompleted
                      ? "bg-white/60 dark:bg-[#1A1F22]/60 border-[#D8DFDE] dark:border-graphite-borderDark opacity-90"
                      : "bg-white dark:bg-[#1A1F22] border-[#D8DFDE] dark:border-graphite-borderDark shadow-subtle hover:border-pine/40 dark:hover:border-pine"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => handleTaskToggle(task.id, task.status)}
                      className="mt-0.5 text-graphite-muted hover:text-pine dark:hover:text-amberSignal transition-colors cursor-pointer"
                      title={isCompleted ? "Mark incomplete" : "Mark completed"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-forest dark:text-[#38B38A] fill-forest/10" />
                      ) : (
                        <Circle className="w-5 h-5 text-graphite-muted dark:text-gray-500 hover:text-pine" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-semibold font-headline ${
                            isCompleted ? "line-through text-graphite-muted dark:text-gray-500" : "text-graphite dark:text-ivory"
                          }`}
                        >
                          {task.title}
                        </span>
                        <Badge
                          variant={
                            task.category === "LEGAL_DOCUMENT"
                              ? "pine"
                              : task.category === "IT_PROVISIONING"
                              ? "steel"
                              : task.category === "BENEFITS"
                              ? "amber"
                              : "mist"
                          }
                          size="sm"
                        >
                          {task.category.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-graphite-muted dark:text-gray-400 leading-relaxed">
                        {task.description}
                      </p>
                      {task.verifiedBy && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-forest dark:text-[#38B38A] font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified by {task.verifiedBy}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:self-center pl-8 sm:pl-0">
                    {task.category === "LEGAL_DOCUMENT" && !isCompleted && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setIsSignModalOpen(true)}
                        className="text-xs h-8 px-3"
                      >
                        E-Sign Form
                      </Button>
                    )}

                    <div className="text-right">
                      <div className="text-[11px] font-mono text-graphite-muted dark:text-gray-400">
                        Due: Day {task.dueDays}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-graphite-muted dark:text-gray-400 tracking-wide">
                        Assigned: {task.assignedTo}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Self-Serve Benefits Selection */}
      {activeTab === "BENEFITS" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-steelBlue/30 dark:border-steelBlue/50 bg-steelBlue/10 dark:bg-steelBlue/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-semibold text-graphite dark:text-ivory font-headline">Annual SME Benefits Package</h4>
              <p className="text-graphite-muted dark:text-gray-300 text-[11px]">
                Company-subsidized health, vision, dental, and 401(k) matching. Select your elections below.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CurrencySwitcher onCurrencyChange={(curr) => setActiveCurrency(curr)} />
              <Badge variant="steel">Coverage Starts: 1st of Month</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <Card key={benefit.id} className={benefit.isElected ? "border-forest/50 dark:border-forest/60 bg-forest/5 dark:bg-forest/10" : ""}>
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold font-headline text-sm text-graphite dark:text-ivory">
                        {benefit.name}
                      </h4>
                      <Badge variant={benefit.isElected ? "forest" : "mist"} size="sm">
                        {benefit.isElected ? "Elected" : "Waived"}
                      </Badge>
                    </div>
                    <p className="text-xs text-graphite-muted dark:text-gray-300 mt-2 leading-relaxed">
                      {benefit.description}
                    </p>
                    <div className="mt-3 text-[11px] font-mono text-graphite dark:text-ivory font-medium">
                      Provider: {benefit.provider} • Monthly Cost:{" "}
                      <span className="font-bold text-pine dark:text-amberSignal">
                        {benefit.costMonthly === 0
                          ? `100% Employer Paid (${formatCurrency(0, activeCurrency)})`
                          : `${formatCurrency(benefit.costMonthly, activeCurrency)}/mo`}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={benefit.isElected ? "outline" : "primary"}
                    onClick={() => handleBenefitToggle(benefit.id)}
                    className="w-full text-xs"
                  >
                    {benefit.isElected ? "Change / Waive Plan" : "Elect this Coverage"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Equipment & Hardware */}
      {activeTab === "EQUIPMENT" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark bg-white dark:bg-[#1A1F22] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Assigned Workstation Hardware
              </h3>
              <Badge variant="mist" size="sm">
                {employeeAssets.length} Devices Allocated
              </Badge>
            </div>
            {employeeAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {employeeAssets.map((asset) => (
                  <div key={asset.id} className="p-4 rounded-xl bg-ivory dark:bg-[#14181B] border border-mist-dark dark:border-graphite-borderDark">
                    <div className="text-graphite-muted dark:text-gray-400 text-[11px] uppercase tracking-wider font-semibold">{asset.category}</div>
                    <div className="font-bold font-headline text-graphite dark:text-ivory text-sm mt-1">
                      {asset.name}
                    </div>
                    <div className="text-[11px] font-mono text-pine dark:text-[#6BB3AF] mt-1">SN: {asset.serialNumber}</div>
                    <Badge variant={asset.status === "ASSIGNED" ? "forest" : "mist"} size="sm" className="mt-2">
                      {asset.status === "ASSIGNED" ? "Active / In Use" : asset.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-ivory/60 dark:bg-[#14181B] border border-dashed border-[#D8DFDE] dark:border-graphite-borderDark text-center">
                <Laptop className="w-8 h-8 text-pine/50 dark:text-[#6BB3AF]/50 mx-auto mb-2" />
                <p className="text-sm font-medium text-graphite dark:text-ivory">No hardware currently assigned</p>
                <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  Your primary workstation package is either in transit or being configured by IT. Click "Request Additional Equipment" below to specify your setup needs.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark bg-white dark:bg-[#1A1F22] p-5 space-y-3">
            <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
              Software Tooling & Access Provisioning
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-mist/40 dark:bg-[#14181B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest" />
                  <span className="font-semibold text-graphite dark:text-ivory">GitHub Enterprise (Acme Technologies Org)</span>
                </div>
                <Badge variant="forest" size="sm">Provisioned</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-mist/40 dark:bg-[#14181B]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-clayGold" />
                  <span className="font-semibold text-graphite dark:text-ivory">AWS Staging & Developer Sandbox</span>
                </div>
                <Badge variant="clay" size="sm">Awaiting IT Approval</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-mist/40 dark:bg-[#14181B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest" />
                  <span className="font-semibold text-graphite dark:text-ivory">Slack Enterprise Grid & 1Password Vault</span>
                </div>
                <Badge variant="forest" size="sm">Active</Badge>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E3ECEB] dark:border-graphite-borderDark flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-graphite-muted dark:text-gray-400">
                Need an ergonomic mouse, second 4K display, or thunderbolt dock?
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEquipModalOpen(true)}
                className="text-xs"
              >
                Request Additional Hardware
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Training & Surveys */}
      {activeTab === "TRAINING" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Culture & Security Handbook</CardTitle>
              <CardDescription>
                Review SME compliance standards, remote work guidelines, and data protection policies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-ivory dark:bg-[#14181B] border border-mist-dark dark:border-graphite-borderDark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-graphite dark:text-ivory">Module 1: Remote Security & PII Protection</div>
                  <div className="text-graphite-muted dark:text-gray-400 text-[11px] mt-0.5">8 minutes • 3 interactive questions</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setIsQuizModalOpen(true)}>
                  Take Quick Quiz
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-ivory dark:bg-[#14181B] border border-mist-dark dark:border-graphite-borderDark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-graphite dark:text-ivory">Module 2: 30-Day New Hire Sentiment Check-in</div>
                  <div className="text-graphite-muted dark:text-gray-400 text-[11px] mt-0.5">Rate your onboarding experience (eNPS)</div>
                </div>
                <Button size="sm" variant="primary" onClick={() => setIsSurveyModalOpen(true)}>
                  Submit 30-Day eNPS
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SCORM Compliant Course Hosting Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-pine dark:text-amberSignal" />
                    <span>SCORM 1.2 / 2004 Compliant LMS Modules</span>
                  </CardTitle>
                  <CardDescription>
                    Accredited corporate training modules with runtime telemetry tracking and passing criteria.
                  </CardDescription>
                </div>
                <Badge variant="pine">Enterprise LMS</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {scormCourses.length > 0 ? (
                scormCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-graphite dark:text-ivory font-headline">
                          {course.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pine/10 text-pine dark:text-amberSignal border border-pine/20">
                          {course.standard}
                        </span>
                      </div>
                      <p className="text-[11px] text-graphite-muted dark:text-gray-400 mt-1">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-graphite-muted dark:text-gray-400 mt-1.5">
                        <span>Duration: {course.durationMinutes}m</span>
                        <span>Passing: {course.passingScore}%</span>
                        {course.score !== undefined && (
                          <span className="font-bold text-forest">Score: {course.score}%</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          course.status === "PASSED" || course.status === "COMPLETED"
                            ? "forest"
                            : course.status === "IN_PROGRESS"
                            ? "clay"
                            : "mist"
                        }
                      >
                        {course.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant={course.status === "PASSED" ? "outline" : "primary"}
                        onClick={() => {
                          setSelectedScormCourse(course);
                          setIsScormModalOpen(true);
                        }}
                        className="text-xs gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{course.status === "PASSED" ? "Review SCORM" : "Launch SCORM Player"}</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-graphite-muted dark:text-gray-400">
                  Loading accredited SCORM course catalog...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: Welcome Swag Store */}
      {activeTab === "SWAG" && (
        <SwagStore
          employeeId={employee.id}
          employeeName={`${employee.firstName} ${employee.lastName}`}
        />
      )}

      {/* Tab 6: Interactive Office Map */}
      {activeTab === "OFFICEMAP" && (
        <InteractiveOfficeMap
          employeeId={employee.id}
          employeeName={`${employee.firstName} ${employee.lastName}`}
        />
      )}

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                Welcome to Acme: Culture & Vision
              </h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-cardDark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 aspect-video rounded-xl bg-graphite dark:bg-black flex flex-col items-center justify-center text-ivory relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-pine/90 dark:bg-pine-400 flex items-center justify-center shadow-elevation cursor-pointer hover:scale-105 transition-transform">
                <Play className="w-7 h-7 fill-white ml-1" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-ivory/80">
                <span>Acme Orientation Video (4:12)</span>
                <span>Hosted on Secure Cloud Vault</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsVideoModalOpen(false)}>
                Close Player
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Modal */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                Sign Proprietary Information Agreement
              </h3>
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-cardDark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <SignaturePad
                documentTitle="Proprietary Information & Inventions Agreement"
                signerName={`${employee.firstName} ${employee.lastName}`}
                signerEmail={employee.email}
                onSignComplete={handleSignatureSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* IT Support Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                Day-1 IT Rapid Support Ticket
              </h3>
              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-cardDark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSupportTicketSubmit} className="mt-4 space-y-3 text-xs">
              <p className="text-graphite-muted dark:text-gray-400">
                Need help with your VPN, password manager, or hardware monitors? Devon Reed from IT is on standby.
              </p>
              <div>
                <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Issue Category</label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory text-xs"
                >
                  <option value="GENERAL">General IT Setup</option>
                  <option value="VPN">VPN & Network Tunneling</option>
                  <option value="HARDWARE">Hardware & Displays</option>
                  <option value="ACCESS">SaaS & Repository Access</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Priority SLA</label>
                <select
                  value={supportPriority}
                  onChange={(e) => setSupportPriority(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory text-xs"
                >
                  <option value="MEDIUM">Medium (Within 4 hours)</option>
                  <option value="HIGH">High (Within 1 hour)</option>
                  <option value="URGENT">Urgent (Immediate Blocker)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Description of Blocker</label>
                <textarea
                  rows={3}
                  required
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your issue (e.g., VPN certificate download failed)..."
                  className="w-full p-2.5 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory focus:bg-white focus:outline-none focus:ring-1 focus:ring-pine"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setIsSupportModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  Dispatch Ticket to IT
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Compliance Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                Remote Security & PII Protection Quiz
              </h3>
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-cardDark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuizSubmit} className="mt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-graphite dark:text-ivory">
                  1. You receive an unsolicited Slack message asking you to approve a Duo 2FA push. What do you do?
                </p>
                <div className="space-y-1.5 pl-2 pt-1 text-graphite-muted dark:text-gray-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="q0"
                      checked={quizAnswers[0] === 0}
                      onChange={() => setQuizAnswers({ ...quizAnswers, 0: 0 })}
                    />
                    <span>Approve it to clear the notification banner</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="q0"
                      checked={quizAnswers[0] === 1}
                      onChange={() => setQuizAnswers({ ...quizAnswers, 0: 1 })}
                    />
                    <span className="font-medium text-pine dark:text-amberSignal">Deny immediately and report suspicious push to IT InfoSec</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-graphite dark:text-ivory">
                  2. Where is it strictly forbidden to store unencrypted customer PII or API tokens?
                </p>
                <div className="space-y-1.5 pl-2 pt-1 text-graphite-muted dark:text-gray-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="q1"
                      checked={quizAnswers[1] === 0}
                      onChange={() => setQuizAnswers({ ...quizAnswers, 1: 0 })}
                    />
                    <span>In corporate encrypted 1Password vaults</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="q1"
                      checked={quizAnswers[1] === 2}
                      onChange={() => setQuizAnswers({ ...quizAnswers, 1: 2 })}
                    />
                    <span className="font-medium text-pine dark:text-amberSignal">Public GitHub repositories, unencrypted pastebins, or personal cloud drives</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-graphite dark:text-ivory">
                  3. What is Acme's required policy for locking workstation screens when stepping away?
                </p>
                <div className="space-y-1.5 pl-2 pt-1 text-graphite-muted dark:text-gray-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="q2"
                      checked={quizAnswers[2] === 0}
                      onChange={() => setQuizAnswers({ ...quizAnswers, 2: 0 })}
                    />
                    <span className="font-medium text-pine dark:text-amberSignal">Always lock screen immediately (Cmd + Ctrl + Q on Mac)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="q2"
                      checked={quizAnswers[2] === 1}
                      onChange={() => setQuizAnswers({ ...quizAnswers, 2: 1 })}
                    />
                    <span>Only lock screen if working in a public cafe</span>
                  </label>
                </div>
              </div>

              {quizScore !== null && (
                <div className="p-3 rounded-lg bg-forest/10 border border-forest/30 text-forest dark:text-[#38B38A] font-semibold text-center">
                  Score: {quizScore}/3 • Certification Status: PASS
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button type="button" size="sm" variant="outline" onClick={() => setIsQuizModalOpen(false)}>
                  Close
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  Submit Quiz & Verify Module
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 30-Day eNPS Survey Modal */}
      {isSurveyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                30-Day New Hire Sentiment Survey
              </h3>
              <button
                onClick={() => setIsSurveyModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-cardDark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSurveySubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-2">
                  How likely are you to recommend Acme Technologies as a great place to work? (eNPS)
                </label>
                <div className="grid grid-cols-10 gap-1 text-center font-bold font-mono">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSurveyScore(num)}
                      className={`h-9 rounded-lg border text-xs transition-colors cursor-pointer ${
                        surveyScore === num
                          ? "bg-pine dark:bg-amberSignal text-ivory dark:text-graphite border-pine dark:border-amberSignal"
                          : "bg-ivory dark:bg-graphite-dark text-graphite dark:text-gray-300 border-mist-dark dark:border-graphite-borderDark hover:bg-white"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-graphite-muted dark:text-gray-400 mt-1">
                  <span>1 - Not Likely</span>
                  <span>10 - Extremely Likely</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">
                  What went best during your onboarding, and what could we improve?
                </label>
                <textarea
                  rows={3}
                  value={surveyFeedback}
                  onChange={(e) => setSurveyFeedback(e.target.value)}
                  placeholder="Share your thoughts with People Operations..."
                  className="w-full p-2.5 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory focus:bg-white focus:outline-none focus:ring-1 focus:ring-pine"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button type="button" size="sm" variant="outline" onClick={() => setIsSurveyModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  Submit Feedback
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Request Modal */}
      {isEquipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                Company Equipment Request Form
              </h3>
              <button
                onClick={() => setIsEquipModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-cardDark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEquipRequestSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Select Hardware Peripheral</label>
                <select
                  value={equipType}
                  onChange={(e) => setEquipType(e.target.value)}
                  className="w-full p-2 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory text-xs"
                >
                  <option value="Ergonomic Split Keyboard">Ergonomic Split Keyboard (Logitech Ergo / Kinesis)</option>
                  <option value="Secondary 4K Display 32-inch">Secondary Dell UltraSharp 32-inch 4K Display</option>
                  <option value="Thunderbolt 4 Docking Station">CalDigit TS4 Thunderbolt 4 Docking Station</option>
                  <option value="Wireless Active Noise-Cancelling Headset">Sony WH-1000XM5 ANC Headset</option>
                  <option value="Spare YubiKey 5C NFC Token">Backup Hardware Security YubiKey</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Business Justification / Shipping Notes</label>
                <textarea
                  rows={3}
                  value={equipNotes}
                  onChange={(e) => setEquipNotes(e.target.value)}
                  placeholder="Specify shipping address or business justification..."
                  className="w-full p-2.5 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory focus:bg-white focus:outline-none focus:ring-1 focus:ring-pine"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button type="button" size="sm" variant="outline" onClick={() => setIsEquipModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  Submit Equipment Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Schedule 1-on-1 Calendar Modal */}
      {employee && (
        <CalendarScheduleModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          employeeId={employee.id}
          employeeName={`${employee.firstName} ${employee.lastName}`}
          onScheduleSuccess={async () => {
            showToast("1-on-1 Alignment Session confirmed and added to calendar!");
            const mentorTask = employee.tasks.find((t) => t.id === "tk7" || t.title.toLowerCase().includes("mentor") || t.title.toLowerCase().includes("1-on-1"));
            if (mentorTask && mentorTask.status !== "COMPLETED") {
              await handleTaskToggle(mentorTask.id, "PENDING");
            }
            notifyDataChanged("calendar", { employeeId: employee.id });
            fetchPortalData();
          }}
        />
      )}

      {/* SCORM Runtime Player Modal */}
      {selectedScormCourse && employee && (
        <ScormPlayerModal
          isOpen={isScormModalOpen}
          onClose={() => setIsScormModalOpen(false)}
          course={selectedScormCourse}
          employeeId={employee.id}
          onCourseComplete={async (courseId, score) => {
            showToast(`SCORM course completed! Raw score: ${score}%. LMS telemetry updated.`);
            // Update training task in checklist
            const trainTask = employee.tasks.find((t) => t.category === "TRAINING");
            if (trainTask && trainTask.status !== "COMPLETED") {
              await handleTaskToggle(trainTask.id, "PENDING");
            }
            notifyDataChanged("task", { employeeId: employee.id, courseId });
            fetchPortalData();
          }}
        />
      )}
    </div>
  </RoleGuard>
);
}
