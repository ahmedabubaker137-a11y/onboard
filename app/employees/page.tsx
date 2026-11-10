"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { EmployeeData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, ArrowUpRight, Download, X, CheckCircle2, UserCheck, Lock } from "lucide-react";
import { useRole } from "@/lib/use-role";
import { addNotification } from "@/lib/notifications";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";
import { RoleGuard } from "@/components/auth/role-guard";

export default function EmployeesListPage() {
  const { currentRole, currentUser } = useRole();
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/employees", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setEmployees(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch employees:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    const unsubscribe = subscribeToDataChanges(() => {
      fetchEmployees();
    });
    return unsubscribe;
  }, []);

  // New Hire Form State
  const [newHire, setNewHire] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    department: "Engineering",
    managerName: "Sofia Calderon",
    startDate: new Date().toISOString().split("T")[0],
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHire.firstName || !newHire.lastName || !newHire.email) return;

    try {
      const res = await fetch("/api/v1/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHire),
      });

      if (res.ok) {
        const json = await res.json();
        notifyDataChanged("employee", { action: "add", employee: json.data });
        addNotification(
          "Colleague Onboarded",
          `Created active onboarding profile for ${json.data.firstName} ${json.data.lastName} (${json.data.jobTitle}).`,
          "employee",
          `/employees/${json.data.id}`
        );
        showToast(`Added ${json.data.firstName} ${json.data.lastName} to employee roster.`);
      }
      await fetchEmployees();
    } catch (err) {
      console.error("Failed to create hire:", err);
    }

    setIsAddModalOpen(false);
    setNewHire({
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "",
      department: "Engineering",
      managerName: "Sofia Calderon",
      startDate: new Date().toISOString().split("T")[0],
    });
  };


  const handleExportRosterCSV = () => {
    const headers = "First Name,Last Name,Email,Job Title,Department,Manager,Start Date,Status,Progress\n";
    const rows = employees
      .map(
        (e) =>
          `"${e.firstName}","${e.lastName}","${e.email}","${e.jobTitle}","${e.department}","${e.managerName}","${e.startDate}","${e.status}",${e.progress}%`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `onboardx_employee_roster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported complete employee roster CSV.");
  };

  const filtered = employees.filter(
    (e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleGuard
      allowedRoles={["ADMIN", "HR_MANAGER", "IT_PROVISIONER", "MANAGER"]}
      moduleName="Employee Directory & Cohorts"
      description="Candidate records, compensation tiers, and cohort progress are confidential and restricted to HR, IT, and Admins. As a New Hire, you can view the team directory in the Org Chart or visit My Portal."
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-pine dark:bg-[#32615E] text-ivory px-4 py-3 shadow-elevation flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-forest dark:text-[#38B38A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role Adaptive Banner */}
      {currentRole === "EMPLOYEE" && (
        <div className="rounded-xl border border-pine/30 bg-pine/10 dark:bg-pine/20 p-3.5 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-pine dark:text-amberSignal shrink-0" />
            <span className="font-semibold text-graphite dark:text-ivory">
              Team Directory — Viewing colleagues and reporting structures as a New Hire ({currentUser.name}).
            </span>
          </div>
          <Badge variant="mist">Directory Mode</Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-graphite dark:text-ivory tracking-tight">
            Employee Directory & Onboarding Records
          </h1>
          <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1">
            Complete SME workforce roster and active onboarding lifecycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportRosterCSV}
            className="text-xs gap-1.5"
            title="Download CSV of employee roster"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster (CSV)</span>
          </Button>

          {currentRole === "EMPLOYEE" ? (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="text-xs gap-1.5 opacity-60 cursor-not-allowed"
              title="Employee onboarding creation is restricted to HR Managers & Admins"
            >
              <Lock className="w-3 h-3 text-graphite-muted" />
              <span>Add Hire (HR Only)</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs gap-1.5 shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Hire</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-graphite-muted dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name, role, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory placeholder:text-graphite-muted dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
          />
        </div>
        <div className="text-xs text-graphite-muted dark:text-gray-400 font-mono font-medium">
          Showing {filtered.length} of {employees.length} employees
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => (
          <Card key={emp.id} className="hover:border-pine/40 dark:hover:border-pine transition-colors">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start gap-3">
                <img
                  src={emp.avatarUrl}
                  alt={emp.firstName}
                  className="w-12 h-12 rounded-xl object-cover border border-[#D0D8D7] dark:border-graphite-borderDark"
                />
                <div className="space-y-0.5">
                  <h3 className="font-bold font-headline text-sm text-graphite dark:text-ivory">
                    {emp.firstName} {emp.lastName}
                  </h3>
                  <div className="text-xs text-graphite-muted dark:text-gray-400">{emp.jobTitle}</div>
                  <div className="text-[11px] font-semibold text-pine dark:text-amberSignal">{emp.department}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E3ECEB] dark:border-graphite-borderDark space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-graphite-muted dark:text-gray-400">Onboarding Progress</span>
                  <span className="font-bold text-graphite dark:text-ivory">{emp.progress}%</span>
                </div>
                <div className="w-full bg-[#E3ECEB] dark:bg-graphite-borderDark rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      emp.progress === 100 ? "bg-forest" : "bg-pine dark:bg-pine-400"
                    }`}
                    style={{ width: `${emp.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Badge
                    variant={emp.status === "COMPLETED" ? "forest" : "clay"}
                    size="sm"
                  >
                    {emp.status.replace("_", " ")}
                  </Badge>
                  <Link href={`/employees/${emp.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                      View Dossier
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Add New Hire to Onboarding System
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHire} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newHire.firstName}
                    onChange={(e) => setNewHire({ ...newHire, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newHire.lastName}
                    onChange={(e) => setNewHire({ ...newHire, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  value={newHire.email}
                  onChange={(e) => setNewHire({ ...newHire, email: e.target.value })}
                  placeholder="name@acme-enterprises.com"
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Job Role Title</label>
                  <input
                    type="text"
                    value={newHire.jobTitle}
                    onChange={(e) => setNewHire({ ...newHire, jobTitle: e.target.value })}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Department</label>
                  <select
                    value={newHire.department}
                    onChange={(e) => setNewHire({ ...newHire, department: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Revenue & Sales">Revenue & Sales</option>
                    <option value="People Operations">People Operations</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Official Start Date</label>
                <input
                  type="date"
                  value={newHire.startDate}
                  onChange={(e) => setNewHire({ ...newHire, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Enroll Employee
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </RoleGuard>
);
}
