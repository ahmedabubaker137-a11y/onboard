"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { JobRequisitionItem, CurrencyCode } from "@/lib/types";
import { useRole } from "@/lib/use-role";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";
import { CurrencySwitcher } from "@/components/dashboard/currency-switcher";
import { convertSalaryRange } from "@/lib/currency";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  Briefcase,
  Plus,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Search,
  ArrowRight,
  Filter,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function JobRequisitionsPage() {
  const { currentRole } = useRole();
  const [requisitions, setRequisitions] = useState<JobRequisitionItem[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>("USD");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDept, setNewDept] = useState("Engineering");
  const [newManager, setNewManager] = useState("Elena Rostova");
  const [newStartDate, setNewStartDate] = useState("2026-06-01");
  const [newSalary, setNewSalary] = useState("$150,000 - $185,000");
  const [newHeadcount, setNewHeadcount] = useState(1);
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("HIGH");

  const fetchRequisitions = async () => {
    try {
      const res = await fetch("/api/v1/requisitions", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.requisitions) setRequisitions(json.requisitions);
      }
    } catch (e) {
      console.error("Failed to load requisitions:", e);
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
    fetchRequisitions();
    fetchCurrency();
    const unsubscribe = subscribeToDataChanges((event) => {
      if (!event || !event.type || event.type === "requisition" || event.type === "general" || event.type === "focus") {
        fetchRequisitions();
      }
      if (!event || !event.type || event.type === "settings" || event.type === "focus") {
        fetchCurrency();
      }
    });
    return unsubscribe;
  }, []);

  const handleCreateRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/v1/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          department: newDept,
          hiringManager: newManager,
          targetStartDate: newStartDate,
          salaryRange: newSalary,
          headcount: newHeadcount,
          priority: newPriority,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback(`Requisition ${data.requisition.id} successfully created and submitted for budget review.`);
        setIsNewModalOpen(false);
        setNewTitle("");
        notifyDataChanged("requisition", { action: "create", id: data.requisition.id });
        await fetchRequisitions();
      } else {
        setFeedback(data.error || "Failed to create requisition.");
      }
    } catch (err) {
      setFeedback("Network error creating requisition.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (requisitionId: string, status: "SUBMITTED" | "FINANCE_APPROVED" | "OPEN" | "FILLED") => {
    try {
      const res = await fetch("/api/v1/requisitions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requisitionId, status }),
      });

      if (res.ok) {
        setFeedback(`Requisition ${requisitionId} moved to status ${status}.`);
        notifyDataChanged("requisition", { action: "update_status", id: requisitionId, status });
        await fetchRequisitions();
      }
    } catch (e) {
      console.error("Error updating requisition status:", e);
    }
  };

  const filtered = requisitions.filter((r) => {
    const matchesDept = selectedDept === "ALL" || r.department === selectedDept;
    const matchesStatus = selectedStatus === "ALL" || r.status === selectedStatus;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hiringManager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  const totalHeadcount = requisitions.reduce((acc, curr) => acc + (curr.headcount || 1), 0);
  const openCount = requisitions.filter((r) => r.status === "OPEN").length;
  const financeApprovedCount = requisitions.filter((r) => r.status === "FINANCE_APPROVED").length;
  const filledCount = requisitions.filter((r) => r.status === "FILLED").length;

  return (
    <RoleGuard
      allowedRoles={["ADMIN", "HR_MANAGER", "MANAGER"]}
      moduleName="Job Requisition Request Workflow"
      description="People Operations, Department Heads, and Finance Controllers manage new-hire requisition approvals, salary compensation bands, and open headcount."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mist dark:border-graphite-muted/30 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-pine/10 text-pine dark:text-amberSignal">
                <Briefcase className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold font-headline text-graphite dark:text-ivory">
                Job Requisitions & Headcount Planning
              </h1>
            </div>
            <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1">
              Multi-tiered approval pipeline connecting department hiring needs with finance compensation approval and onboarding workflow generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CurrencySwitcher onCurrencyChange={(curr) => setActiveCurrency(curr)} />
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pine hover:bg-pine/90 text-ivory text-xs font-bold shadow-subtle transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job Requisition</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-3 bg-forest/10 border border-forest/30 rounded-xl text-xs text-forest dark:text-[#38B38A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-forest hover:opacity-75">✕</button>
          </div>
        )}

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-white dark:bg-graphite-surface shadow-xs">
            <div className="flex items-center justify-between text-xs text-graphite-muted">
              <span>Total Headcount Budget</span>
              <Users className="w-4 h-4 text-pine dark:text-amberSignal" />
            </div>
            <div className="text-2xl font-bold font-headline text-graphite dark:text-ivory mt-2">
              {totalHeadcount} Positions
            </div>
            <p className="text-[11px] text-graphite-muted mt-1">FY26 approved expansion slots</p>
          </div>

          <div className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-white dark:bg-graphite-surface shadow-xs">
            <div className="flex items-center justify-between text-xs text-graphite-muted">
              <span>Active Sourcing</span>
              <Clock className="w-4 h-4 text-amberSignal" />
            </div>
            <div className="text-2xl font-bold font-headline text-graphite dark:text-ivory mt-2">
              {openCount} Open Reqs
            </div>
            <p className="text-[11px] text-amberSignal mt-1 font-medium">Published on careers board</p>
          </div>

          <div className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-white dark:bg-graphite-surface shadow-xs">
            <div className="flex items-center justify-between text-xs text-graphite-muted">
              <span>Finance Approved</span>
              <DollarSign className="w-4 h-4 text-forest" />
            </div>
            <div className="text-2xl font-bold font-headline text-graphite dark:text-ivory mt-2">
              {financeApprovedCount} Reqs
            </div>
            <p className="text-[11px] text-forest dark:text-[#38B38A] mt-1 font-medium">Ready for recruiter kickoff</p>
          </div>

          <div className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-white dark:bg-graphite-surface shadow-xs">
            <div className="flex items-center justify-between text-xs text-graphite-muted">
              <span>Positions Filled</span>
              <CheckCircle2 className="w-4 h-4 text-steelBlue" />
            </div>
            <div className="text-2xl font-bold font-headline text-graphite dark:text-ivory mt-2">
              {filledCount} Hires
            </div>
            <p className="text-[11px] text-steelBlue mt-1 font-medium">Seamlessly linked to Day-1 portal</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-graphite-surface border border-mist dark:border-graphite-muted/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-graphite-muted absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, manager, ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden focus:border-pine"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="People">People Ops</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="FINANCE_APPROVED">Finance Approved</option>
              <option value="OPEN">Open (Sourcing)</option>
              <option value="FILLED">Filled</option>
            </select>
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="bg-white dark:bg-graphite-surface border border-mist dark:border-graphite-muted/30 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-graphite dark:text-ivory min-w-[780px]">
              <thead className="bg-mist/30 dark:bg-graphite-muted/15 border-b border-mist dark:border-graphite-muted/30 text-[11px] font-bold text-graphite-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Requisition ID & Title</th>
                  <th className="py-3 px-4">Department & Manager</th>
                  <th className="py-3 px-4">Compensation Band ({activeCurrency})</th>
                  <th className="py-3 px-4">Headcount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Workflow Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist/80 dark:divide-graphite-muted/20">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-warmIvory/30 dark:hover:bg-graphite/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-graphite dark:text-ivory font-headline">
                        {req.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-pine dark:text-amberSignal mt-0.5">
                        <span>{req.id}</span>
                        <span>• Target: {req.targetStartDate}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-graphite dark:text-ivory">{req.department}</div>
                      <div className="text-[11px] text-graphite-muted dark:text-gray-400">
                        HM: {req.hiringManager}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-graphite dark:text-gray-300">
                      {convertSalaryRange(req.salaryRange, activeCurrency)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-xs">
                      {req.headcount} {req.headcount === 1 ? "Seat" : "Seats"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                          req.status === "OPEN"
                            ? "bg-forest/10 text-forest dark:text-[#38B38A] border-forest/20"
                            : req.status === "FINANCE_APPROVED"
                            ? "bg-steelBlue/10 text-steelBlue border-steelBlue/20"
                            : req.status === "FILLED"
                            ? "bg-pine/10 text-pine dark:text-amberSignal border-pine/20"
                            : "bg-amberSignal/10 text-amberSignal border-amberSignal/20"
                        }`}
                      >
                        ● {req.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === "SUBMITTED" && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, "FINANCE_APPROVED")}
                            className="px-2.5 py-1 rounded-lg bg-steelBlue text-white text-[11px] font-semibold hover:bg-steelBlue/90 transition-colors shadow-2xs"
                          >
                            Approve Budget
                          </button>
                        )}
                        {req.status === "FINANCE_APPROVED" && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, "OPEN")}
                            className="px-2.5 py-1 rounded-lg bg-forest text-white text-[11px] font-semibold hover:bg-forest/90 transition-colors shadow-2xs"
                          >
                            Open for Sourcing
                          </button>
                        )}
                        {req.status === "OPEN" && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, "FILLED")}
                            className="px-2.5 py-1 rounded-lg bg-pine text-ivory text-[11px] font-semibold hover:bg-pine/90 transition-colors shadow-2xs"
                          >
                            Mark as Filled
                          </button>
                        )}
                        {req.status === "FILLED" && (
                          <Link
                            href="/portal"
                            className="text-[11px] font-semibold text-pine dark:text-amberSignal hover:underline inline-flex items-center gap-1"
                          >
                            Launch Onboarding <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Requisition Modal */}
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white dark:bg-graphite-surface border border-mist dark:border-graphite-muted/30 rounded-xl shadow-2xl max-w-lg w-full p-6 text-graphite dark:text-ivory animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-mist dark:border-graphite-muted/20 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-pine/10 text-pine dark:text-amberSignal">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold font-headline">New Job Requisition Request</h3>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-graphite-muted hover:text-graphite dark:hover:text-ivory"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRequisition} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Senior Distributed Systems Engineer"
                    className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden focus:border-pine"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Marketing">Marketing</option>
                      <option value="People">People Ops</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Hiring Manager</label>
                    <input
                      type="text"
                      required
                      value={newManager}
                      onChange={(e) => setNewManager(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden focus:border-pine"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Annual Compensation Band</label>
                    <input
                      type="text"
                      required
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      placeholder="$140,000 - $170,000"
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden focus:border-pine"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Target Start Date</label>
                    <input
                      type="date"
                      required
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden focus:border-pine"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Headcount Seats</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newHeadcount}
                      onChange={(e) => setNewHeadcount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden focus:border-pine"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High (Executive Priority)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-mist dark:border-graphite-muted/20 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-pine hover:bg-pine/90 text-ivory font-bold shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Submit for Finance Review</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </RoleGuard>
  );
}
