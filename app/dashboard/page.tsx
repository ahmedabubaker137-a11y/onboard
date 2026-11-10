"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { EmployeeData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  ShieldCheck,
  Smile,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle,
  X,
  Mail,
  Download,
  Upload,
  Laptop,
  ArrowUpRight,
  Shield,
  UserCheck,
  Sparkles,
  Lock,
  PieChart,
  DollarSign,
} from "lucide-react";
import { useRole } from "@/lib/use-role";
import { addNotification } from "@/lib/notifications";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";
import { RoleGuard } from "@/components/auth/role-guard";
import { DiversityDashboardModal } from "@/components/dashboard/diversity-dashboard-modal";
import { CurrencySwitcher } from "@/components/dashboard/currency-switcher";
import { useTranslation } from "@/lib/i18n";
import { formatCurrency, getRoleSalaryUsd } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/types";

export default function HRDashboardPage() {
  const { currentRole, currentUser } = useRole();
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeiModalOpen, setIsDeiModalOpen] = useState(false);
  const [payrollCurrency, setPayrollCurrency] = useState("USD");
  const [payrollRate, setPayrollRate] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New hire form state
  const [newHire, setNewHire] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    department: "Engineering",
    templateId: "tpl_eng_01",
    startDate: "2026-10-01",
  });

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState(
    "firstName,lastName,email,jobTitle,department,startDate\n" +
    "Alexander,Vogel,alex.vogel@acme-enterprises.com,Staff Backend Architect,Engineering,2026-10-15\n" +
    "Seraphina,Chen,seraphina.c@acme-enterprises.com,Lead Product Strategist,Product & Design,2026-10-15\n" +
    "Darius,Kovacs,darius.k@acme-enterprises.com,Account Executive Enterprise,Revenue & Sales,2026-10-20"
  );

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/v1/employees", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setEmployees(json.data);
        }
      }
    } catch (e) {
      console.error("Failed to fetch employees from backend:", e);
    }
  };

  const fetchCurrency = async () => {
    try {
      const res = await fetch("/api/v1/currency", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.currency) {
          setPayrollCurrency(json.currency);
          if (json.rate) setPayrollRate(json.rate);
        }
      }
    } catch (e) {
      console.error("Failed to fetch currency:", e);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchCurrency();
    const unsubscribe = subscribeToDataChanges((event) => {
      fetchEmployees();
      if (!event || !event.type || event.type === "settings" || event.type === "focus") {
        fetchCurrency();
      }
    });
    return unsubscribe;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHire.firstName || !newHire.email) return;

    try {
      const res = await fetch("/api/v1/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHire),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setEmployees((prev) => [json.data, ...prev.filter((p) => p.id !== json.data.id)]);
          notifyDataChanged("employee", { action: "add", employee: json.data });
          addNotification(
            "New Hire Enrolled",
            `Onboarding workflow initialized for ${json.data.firstName} ${json.data.lastName} (${json.data.jobTitle}).`,
            "employee",
            `/employees/${json.data.id}`
          );
        }
      }
      await fetchEmployees();
    } catch (err) {
      console.error("Failed to add employee:", err);
    }

    setIsAddModalOpen(false);
    showToast(`Successfully added ${newHire.firstName} ${newHire.lastName}`);
    setNewHire({
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "",
      department: "Engineering",
      templateId: "tpl_eng_01",
      startDate: "2026-10-01",
    });
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    try {
      const res = await fetch("/api/v1/employees/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent }),
      });
      if (res.ok) {
        const json = await res.json();
        notifyDataChanged("employee", { action: "bulk_import", count: json.count });
        addNotification(
          "Cohort Bulk Imported",
          `Successfully parsed and enrolled ${json.count || "new"} hires into active cohorts.`,
          "employee",
          "/dashboard"
        );
        showToast(`Successfully imported ${json.count || "cohort"} new hires into cohort.`);
      }
      await fetchEmployees();
    } catch (err) {
      console.error("Bulk import failed:", err);
    }

    setIsCsvModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Job Title",
      "Department",
      "Start Date",
      "Status",
      "Progress %",
      `Compensation (${payrollCurrency})`,
    ];
    const rows = employees.map((e) => [
      e.id,
      `"${e.firstName}"`,
      `"${e.lastName}"`,
      e.email,
      `"${e.jobTitle}"`,
      `"${e.department}"`,
      e.startDate,
      e.status,
      e.progress,
      `"${formatCurrency(getRoleSalaryUsd(e.jobTitle), payrollCurrency as CurrencyCode)}"`,
    ]);
    const csvString = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `onboardx_cohort_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Cohort report CSV exported successfully.");
  };

  const handleSendReminder = (emp: EmployeeData) => {
    fetch("/api/v1/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actorEmail: "marcus.thorne@acme-enterprises.com",
        actorRole: "HR_MANAGER",
        action: "REMINDER_EMAIL_DISPATCHED",
        entityType: "Employee",
        entityId: emp.id,
        details: { recipient: emp.email, pendingTasks: emp.tasks.filter((t) => t.status !== "COMPLETED").length },
      }),
    }).catch(console.error);
    addNotification(
      "Compliance Reminder Sent",
      `Nudge email dispatched to ${emp.firstName} ${emp.lastName} for ${emp.tasks.filter((t) => t.status !== "COMPLETED").length} pending tasks.`,
      "employee",
      `/employees/${emp.id}`
    );
    showToast(`Automated onboarding reminder dispatched to ${emp.email}`);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "ALL" || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <RoleGuard
      allowedRoles={["ADMIN", "HR_MANAGER", "IT_PROVISIONER", "MANAGER"]}
      moduleName="Operations Command Center"
      description="As a New Hire, your dedicated onboarding experience is located in My Portal. Executive cohorts, analytics, and operational workflows are restricted to HR, IT, and Admins."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-pine dark:bg-[#284E4C] text-ivory px-4 py-3 shadow-elevation flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-forest dark:text-[#38B38A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dynamic Role & Persona Banner */}
      {currentRole === "EMPLOYEE" && (() => {
        const activeEmp = employees.find(
          (e) => e.email === currentUser.email || e.id === (currentUser as any).employeeId
        ) || employees[0];
        const empProgress = activeEmp ? activeEmp.progress : 0;
        return (
          <div className="rounded-2xl border-2 border-forest/30 dark:border-forest/40 bg-gradient-to-r from-forest/10 via-pine/5 to-transparent p-5 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-forest/50 shadow-subtle"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold font-headline text-graphite dark:text-ivory">
                      Welcome to Acme Technologies, {currentUser.name}!
                    </h2>
                    <Badge variant="forest">New Hire Persona</Badge>
                  </div>
                  <p className="text-xs text-graphite-muted dark:text-gray-300 mt-1">
                    Your onboarding checklist is <strong>{empProgress}% complete</strong>. Complete Day 1 compliance tasks, review assigned contracts, and track your workstation in your portal.
                  </p>
                </div>
              </div>
              <Link href="/portal">
                <Button variant="primary" size="sm" className="gap-2 shrink-0">
                  <UserCheck className="w-4 h-4" />
                  <span>Go to My Onboarding Portal</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        );
      })()}

      {currentRole === "IT_PROVISIONER" && (
        <div className="rounded-2xl border-2 border-pine/30 dark:border-pine/40 bg-gradient-to-r from-pine/10 via-steelBlue/5 to-transparent p-5 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pine text-ivory flex items-center justify-center shadow-subtle shrink-0">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-headline text-graphite dark:text-ivory">
                    IT Provisioning Command — {currentUser.name}
                  </h2>
                  <Badge variant="pine">IT Systems Lead</Badge>
                </div>
                <p className="text-xs text-graphite-muted dark:text-gray-300 mt-1">
                  Active hardware workstream: <strong>Workstation checkout & serial verification queue</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/assets">
                <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>IT Assets Console</span>
                </Button>
              </Link>
              <Link href="/employees/emp_tariq_03">
                <Button variant="outline" size="sm" className="text-xs">
                  <span>Checkout Tariq's Laptop</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {currentRole === "ADMIN" && (
        <div className="rounded-xl border border-amberSignal/30 bg-amberSignal/10 dark:bg-amberSignal/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amberSignal shrink-0" />
            <span className="text-xs font-semibold text-graphite dark:text-ivory">
              SuperAdmin Active: {currentUser.name} — Full organizational configuration & multi-tenant isolation unlocked.
            </span>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="sm" className="text-xs h-7">System Tenancy & Keys</Button>
          </Link>
        </div>
      )}

      {currentRole === "HR_MANAGER" && (
        <div className="rounded-xl border border-pine/30 bg-pine/10 dark:bg-pine/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-pine dark:text-amberSignal shrink-0" />
            <span className="text-xs font-semibold text-graphite dark:text-ivory">
              HR Operations Active: {currentUser.name} — Managing active onboarding cohorts and workflow templates.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/templates">
              <Button variant="outline" size="sm" className="text-xs h-7">Workflow Templates</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-graphite dark:text-ivory tracking-tight">
              {currentRole === "EMPLOYEE"
                ? "Company Directory & Workforce Overview"
                : currentRole === "IT_PROVISIONER"
                ? "IT Systems & Hardware Operations"
                : "HR & People Operations Command Center"}
            </h1>
            <Badge variant="pine">Acme Tech Inc.</Badge>
          </div>
          <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1">
            {currentRole === "EMPLOYEE"
              ? "Read-only corporate overview for new team members. Use My Portal for personal checklist."
              : currentRole === "IT_PROVISIONER"
              ? "Workstation hardware allocation, license provisioning, and IT task tracking."
              : "Real-time cohort visibility, bottleneck monitoring, and compliance tracking."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <CurrencySwitcher onCurrencyChange={(curr, rate) => {
            setPayrollCurrency(curr);
            setPayrollRate(rate);
            showToast(`Payroll compensation figures updated to ${curr}`);
          }} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeiModalOpen(true)}
            className="text-xs gap-1.5"
            title="Diversity, Equity & Inclusion Dashboard"
          >
            <PieChart className="w-3.5 h-3.5 text-forest dark:text-[#38B38A]" />
            <span>{t("diversityDashboard", "D&I Analytics")}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs gap-1.5"
            title="Download Cohort as CSV"
          >
            <Download className="w-3.5 h-3.5 text-graphite-muted dark:text-gray-400" />
            <span>{t("exportCsv", "Export CSV")}</span>
          </Button>

          {currentRole === "EMPLOYEE" || currentRole === "IT_PROVISIONER" ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-xs gap-1.5 opacity-60 cursor-not-allowed"
                title="Hiring controls are restricted to HR Managers & Admins"
              >
                <Lock className="w-3 h-3 text-graphite-muted" />
                <span>Import CSV (HR Only)</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-xs gap-1.5 opacity-60 cursor-not-allowed"
                title="Hiring controls are restricted to HR Managers & Admins"
              >
                <Lock className="w-3 h-3 text-graphite-muted" />
                <span>{t("addHire", "Add Hire")} (HR Only)</span>
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCsvModalOpen(true)}
                className="text-xs gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
                <span>Import CSV</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs gap-1.5 shadow-subtle"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("addHire", "Add New Hire")}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overdue / Bottleneck Alert Banner */}
      {(() => {
        const bottleneckEmp = employees.find((e) => e.status === "IN_PROGRESS" && e.progress >= 50) || employees[0];
        if (!bottleneckEmp) return null;
        return (
          <div className="rounded-xl border border-clayGold/40 dark:border-clayGold/50 bg-clayGold/10 dark:bg-clayGold/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-lg bg-clayGold/20 dark:bg-clayGold/30 text-clayGold">
                <AlertTriangle className="w-4 h-4 text-[#8C620A] dark:text-amberSignal" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-headline text-graphite dark:text-ivory">
                  Verification Required: {bottleneckEmp.firstName} {bottleneckEmp.lastName} ({bottleneckEmp.department})
                </h4>
                <p className="text-[11px] text-graphite-muted dark:text-gray-300">
                  Reached {bottleneckEmp.progress}% onboarding progress. Review outstanding compliance tasks and verify Day 1 readiness.
                </p>
              </div>
            </div>
            <Link href={`/employees/${bottleneckEmp.id}`}>
              <Button size="sm" variant="outline" className="text-xs border-clayGold/40 dark:border-clayGold/60 hover:bg-clayGold/15 whitespace-nowrap">
                Review Submission
              </Button>
            </Link>
          </div>
        );
      })()}

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider font-headline">
                {t("activeEmployees", "Active Hires")}
              </span>
              <div className="w-8 h-8 rounded-lg bg-pine/10 dark:bg-pine/30 flex items-center justify-center text-pine dark:text-[#6BB3AF]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-headline text-graphite dark:text-ivory">{employees.length}</span>
              <span className="text-xs font-semibold text-forest dark:text-[#38B38A] flex items-center">
                +2 this week
              </span>
            </div>
            <p className="text-[11px] text-graphite-muted dark:text-gray-400 mt-1">
              {employees.filter((e) => e.status !== "COMPLETED").length} currently in active onboarding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider font-headline">
                Avg Time to Onboard
              </span>
              <div className="w-8 h-8 rounded-lg bg-steelBlue/15 dark:bg-steelBlue/30 flex items-center justify-center text-steelBlue dark:text-[#7FA6BF]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-headline text-steelBlue dark:text-[#7FA6BF]">6.2 d</span>
              <span className="text-xs font-semibold text-forest dark:text-[#38B38A] flex items-center">
                -1.4 days vs industry
              </span>
            </div>
            <p className="text-[11px] text-graphite-muted dark:text-gray-400 mt-1">Target SLA: 7 business days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider font-headline">
                {t("complianceRate", "Compliance Rate")}
              </span>
              <div className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-forest/20 flex items-center justify-center text-forest dark:text-[#38B38A]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-headline text-forest dark:text-[#38B38A]">96.8%</span>
              <span className="text-xs font-semibold text-forest dark:text-[#38B38A] flex items-center">
                SOC2 Audit Ready
              </span>
            </div>
            <p className="text-[11px] text-graphite-muted dark:text-gray-400 mt-1">All PII contracts SHA-256 stamped</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider font-headline">
                New Hire eNPS
              </span>
              <div className="w-8 h-8 rounded-lg bg-amberSignal/15 dark:bg-amberSignal/30 flex items-center justify-center text-amberSignal">
                <Smile className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-headline text-amberSignal">+78</span>
              <span className="text-xs font-semibold text-forest dark:text-[#38B38A] flex items-center">
                Top 5% SME Benchmark
              </span>
            </div>
            <p className="text-[11px] text-graphite-muted dark:text-gray-400 mt-1">Based on 30-day sentiment responses</p>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Currency Payroll Preparation Overview */}
      {(() => {
        const totalCohortAnnualUsd = employees.reduce((sum, emp) => sum + getRoleSalaryUsd(emp.jobTitle), 0);
        const totalCohortMonthlyUsd = Math.round(totalCohortAnnualUsd / 12);
        const avgCompUsd = employees.length > 0 ? Math.round(totalCohortAnnualUsd / employees.length) : 0;

        return (
          <div className="rounded-2xl border border-pine/25 dark:border-pine/40 bg-gradient-to-r from-pine/10 via-forest/5 to-transparent p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-pine/15 dark:bg-pine/30 flex items-center justify-center text-pine dark:text-[#6BB3AF]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold font-headline text-graphite dark:text-ivory">
                    Multi-Currency Payroll Preparation (Active Cohort)
                  </h3>
                  <Badge variant="forest" size="sm">
                    Active: {payrollCurrency}
                  </Badge>
                </div>
                <p className="text-xs text-graphite-muted dark:text-gray-300">
                  Live enterprise treasury conversion across international payroll jurisdictions. Figures update dynamically when changing currencies.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-medium text-graphite-muted dark:text-gray-400 bg-white/70 dark:bg-graphite-cardDark px-3 py-1.5 rounded-xl border border-mist-dark dark:border-graphite-borderDark shrink-0">
                <span>Exchange Base: 1 USD</span>
                <span>=</span>
                <span className="font-bold text-pine dark:text-[#6BB3AF]">
                  {payrollRate} {payrollCurrency}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/90 dark:bg-[#14181B] border border-mist-dark dark:border-graphite-borderDark shadow-subtle">
                <div className="text-[11px] font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider font-headline">
                  Projected Monthly Payroll
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-graphite dark:text-ivory mt-1">
                  {formatCurrency(totalCohortMonthlyUsd, payrollCurrency as CurrencyCode)}
                </div>
                <div className="text-[11px] text-forest dark:text-[#38B38A] font-medium mt-0.5">
                  Based on {employees.length} active new hires
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/90 dark:bg-[#14181B] border border-mist-dark dark:border-graphite-borderDark shadow-subtle">
                <div className="text-[11px] font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider font-headline">
                  Annualized Run-Rate
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-pine dark:text-[#6BB3AF] mt-1">
                  {formatCurrency(totalCohortAnnualUsd, payrollCurrency as CurrencyCode)}
                </div>
                <div className="text-[11px] text-graphite-muted dark:text-gray-400 mt-0.5">
                  Full-year compensation commitment
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/90 dark:bg-[#14181B] border border-mist-dark dark:border-graphite-borderDark shadow-subtle">
                <div className="text-[11px] font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider font-headline">
                  Average Compensation / Hire
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-graphite dark:text-ivory mt-1">
                  {formatCurrency(avgCompUsd, payrollCurrency as CurrencyCode)}
                </div>
                <div className="text-[11px] text-forest dark:text-[#38B38A] font-medium mt-0.5">
                  Role-banded market rate
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Active Hires Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle>Active Onboarding Cohort</CardTitle>
            <CardDescription>
              Showing all registered hires, their role-based checklist completion, and current stage.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-graphite-muted dark:text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder", "Search by name, role...")}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-cardDark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-[#14181B] focus:outline-none focus:ring-1 focus:ring-pine w-48 sm:w-56"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-cardDark text-graphite dark:text-ivory focus:outline-none cursor-pointer"
            >
              <option value="ALL">{t("all", "All")} Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Revenue & Sales">Revenue & Sales</option>
              <option value="People Operations">People Operations</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[820px]">
            <thead className="bg-mist dark:bg-[#15191C] text-graphite-muted dark:text-gray-400 font-headline uppercase text-[10px] tracking-wider border-b border-[#D8DFDE] dark:border-graphite-borderDark">
              <tr>
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Start Date</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4">Compensation ({payrollCurrency})</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3ECEB] dark:divide-graphite-borderDark">
              {filteredEmployees.map((emp) => {
                const statusBadges = {
                  INVITED: { variant: "steel" as const, label: "Invited" },
                  IN_PROGRESS: { variant: "clay" as const, label: "In Progress" },
                  REVIEW_PENDING: { variant: "amber" as const, label: "Review Pending" },
                  COMPLETED: { variant: "forest" as const, label: "Completed" },
                };
                const badge = statusBadges[emp.status];

                return (
                  <tr key={emp.id} className="hover:bg-mist/30 dark:hover:bg-[#1E2428] transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatarUrl}
                          alt={emp.firstName}
                          className="w-8 h-8 rounded-lg object-cover border border-[#D0D8D7] dark:border-graphite-borderDark"
                        />
                        <div>
                          <div className="font-semibold text-graphite dark:text-ivory text-xs">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[11px] text-graphite-muted dark:text-gray-400">{emp.jobTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-graphite dark:text-gray-200 font-medium">
                      {emp.department}
                    </td>
                    <td className="py-3.5 px-4 text-graphite-muted dark:text-gray-400">
                      {emp.startDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-36">
                        <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                          <span className="text-graphite dark:text-ivory">{emp.progress}%</span>
                          <span className="text-graphite-muted dark:text-gray-400 font-normal">
                            {emp.tasks.filter((t) => t.status === "COMPLETED").length}/{emp.tasks.length} tasks
                          </span>
                        </div>
                        <div className="w-full bg-[#E3ECEB] dark:bg-graphite-borderDark rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              emp.progress === 100
                                ? "bg-forest"
                                : emp.progress > 50
                                ? "bg-pine dark:bg-[#5D9490]"
                                : "bg-amberSignal"
                            }`}
                            style={{ width: `${emp.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-graphite dark:text-ivory">
                      <div>{formatCurrency(getRoleSalaryUsd(emp.jobTitle), payrollCurrency as CurrencyCode)}</div>
                      <div className="text-[10px] font-normal text-graphite-muted dark:text-gray-400 font-sans">/ yr base</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={badge.variant} size="sm">
                        {badge.label}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/employees/${emp.id}`}>
                          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                            Dossier
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendReminder(emp)}
                          className="h-7 w-7 p-0 text-graphite-muted hover:text-pine dark:hover:text-amberSignal cursor-pointer"
                          title="Send Email Reminder"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add New Hire Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <div>
                <h3 className="text-base font-bold font-headline text-graphite dark:text-ivory">
                  Provision New Employee
                </h3>
                <p className="text-xs text-graphite-muted dark:text-gray-400">
                  Assign template, trigger automated paperwork, and notify IT.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-cardDark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newHire.firstName}
                    onChange={(e) => setNewHire({ ...newHire, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory focus:bg-white focus:outline-none focus:ring-1 focus:ring-pine"
                    placeholder="e.g. Alex"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newHire.lastName}
                    onChange={(e) => setNewHire({ ...newHire, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory focus:bg-white focus:outline-none focus:ring-1 focus:ring-pine"
                    placeholder="e.g. Rivera"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Company Email *</label>
                <input
                  type="email"
                  required
                  value={newHire.email}
                  onChange={(e) => setNewHire({ ...newHire, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory focus:bg-white focus:outline-none focus:ring-1 focus:ring-pine"
                  placeholder="alex.rivera@acme-enterprises.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={newHire.jobTitle}
                    onChange={(e) => setNewHire({ ...newHire, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory focus:bg-white focus:outline-none focus:ring-1 focus:ring-pine"
                    placeholder="Senior Backend Engineer"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Department</label>
                  <select
                    value={newHire.department}
                    onChange={(e) => setNewHire({ ...newHire, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory focus:outline-none cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Revenue & Sales">Revenue & Sales</option>
                    <option value="People Operations">People Operations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Onboarding Template</label>
                  <select
                    value={newHire.templateId}
                    onChange={(e) => setNewHire({ ...newHire, templateId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory focus:outline-none cursor-pointer"
                  >
                    <option value="tpl_eng_01">Engineering Technical (8 tasks)</option>
                    <option value="tpl_sales_01">Sales GTM Playbook (6 tasks)</option>
                    <option value="tpl_prod_01">Product Design (6 tasks)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newHire.startDate}
                    onChange={(e) => setNewHire({ ...newHire, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create Hire & Dispatch Workflows
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Importer Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <div>
                <h3 className="text-base font-bold font-headline text-graphite dark:text-ivory">
                  Bulk Employee CSV Import
                </h3>
                <p className="text-xs text-graphite-muted dark:text-gray-400">
                  Import multiple hires into the onboarding cohort simultaneously.
                </p>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-cardDark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportCsv} className="mt-4 space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-graphite dark:text-gray-300">
                    Paste CSV Data (comma separated)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setCsvContent(
                        "firstName,lastName,email,jobTitle,department,startDate\n" +
                        "Elena,Rostova,elena.r@acme-enterprises.com,Senior Cloud Security Engineer,IT & InfoSec,2026-10-15\n" +
                        "Marcus,Wu,marcus.wu@acme-enterprises.com,Lead Frontend Architect,Engineering,2026-10-15\n" +
                        "Samantha,Miller,sam.miller@acme-enterprises.com,Head of Product Operations,Product & Design,2026-10-20"
                      )
                    }
                    className="text-[11px] text-pine dark:text-amberSignal font-semibold hover:underline cursor-pointer"
                  >
                    Load Sample Cohort
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  className="w-full p-3 font-mono text-[11px] rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory focus:bg-white focus:outline-none focus:ring-1 focus:ring-pine leading-relaxed"
                  placeholder="firstName,lastName,email,jobTitle,department,startDate..."
                />
                <p className="text-[10px] text-graphite-muted dark:text-gray-400 mt-1">
                  Format: firstName, lastName, email, jobTitle, department, startDate
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCsvModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Parse & Import Cohort</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diversity & Inclusion Modal */}
      <DiversityDashboardModal
        isOpen={isDeiModalOpen}
        onClose={() => setIsDeiModalOpen(false)}
      />
    </div>
  </RoleGuard>
);
}
