"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import type { EmployeeData, AssetData, DocumentItem, BenefitPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Laptop,
  FileText,
  Printer,
  FileCheck,
  UserMinus,
  Plus,
  Send,
  X,
  Sparkles,
} from "lucide-react";
import { addNotification } from "@/lib/notifications";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";
import { CustomFieldsCard } from "@/components/employees/custom-fields-card";

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AssetData[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [benefits, setBenefits] = useState<BenefitPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isOffboardModalOpen, setIsOffboardModalOpen] = useState(false);
  const [offboardReason, setOffboardReason] = useState("Voluntary Resignation");
  const [selectedAssetId, setSelectedAssetId] = useState("");

  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true);
      const [empRes, assetsRes, benefitsRes] = await Promise.all([
        fetch(`/api/v1/employees/${unwrappedParams.id}`, { cache: "no-store" }),
        fetch("/api/v1/assets", { cache: "no-store" }),
        fetch("/api/v1/benefits", { cache: "no-store" }),
      ]);

      if (empRes.ok) {
        const json = await empRes.json();
        if (json.data) {
          setEmployee(json.data);
          if (json.data.documents) setDocuments(json.data.documents);
          if (json.data.assets) setAssets(json.data.assets);
        }
      }

      if (assetsRes.ok) {
        const assetsJson = await assetsRes.json();
        if (assetsJson.data) {
          const avail = assetsJson.data.filter((a: AssetData) => a.status === "AVAILABLE");
          setAvailableAssets(avail);
          if (avail.length > 0 && !selectedAssetId) setSelectedAssetId(avail[0].id);
        }
      }

      if (benefitsRes.ok) {
        const benJson = await benefitsRes.json();
        if (benJson.data) {
          setBenefits(benJson.data.filter((b: BenefitPlan) => b.isElected));
        }
      }
    } catch (e) {
      console.error("Failed to load employee from server:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
    const unsubscribe = subscribeToDataChanges(() => {
      fetchEmployeeData();
    });
    return unsubscribe;
  }, [unwrappedParams.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAssignModal = () => {
    if (availableAssets.length > 0) {
      setSelectedAssetId(availableAssets[0].id);
    }
    setIsAssignModalOpen(true);
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    if (!employee) return;
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";

    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id, status: newStatus }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.employee) {
          setEmployee(json.data.employee);
        } else {
          await fetchEmployeeData();
        }
        notifyDataChanged("task", { employeeId: employee.id, taskId, status: newStatus });
        addNotification(
          `Task ${newStatus === "COMPLETED" ? "Completed" : "Reopened"}`,
          `Task status updated for ${employee.firstName} ${employee.lastName}.`,
          "employee",
          `/employees/${employee.id}`
        );
        showToast(`Task status updated to ${newStatus}.`);
      }
    } catch (err) {
      console.error("Failed to toggle task via API:", err);
      showToast("Unable to update task. Please try again.");
    }
  };

  const handleSendWelcomeEmail = () => {
    if (!employee) return;
    fetch("/api/v1/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actorEmail: "marcus.thorne@acme-enterprises.com",
        actorRole: "HR_MANAGER",
        action: "WELCOME_EMAIL_DISPATCHED",
        entityType: "Employee",
        entityId: employee.id,
        details: { recipient: employee.email, manager: employee.managerName, startDate: employee.startDate },
      }),
    }).catch(console.error);

    addNotification(
      "Welcome Email Dispatched",
      `Personalized onboarding welcome email sent to ${employee.email}.`,
      "employee",
      `/employees/${employee.id}`
    );
    showToast(`Personalized welcome email dispatched to ${employee.email}.`);
  };

  const handleAssignAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !employee) return;

    try {
      const res = await fetch("/api/v1/assets/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: selectedAssetId, employeeId: employee.id }),
      });
      if (res.ok) {
        await fetchEmployeeData();
        setIsAssignModalOpen(false);
        notifyDataChanged("asset", { employeeId: employee.id, assetId: selectedAssetId });
        addNotification(
          "Hardware Checkout Confirmed",
          `Hardware unit was assigned to ${employee.firstName} ${employee.lastName}.`,
          "hardware",
          `/employees/${employee.id}`
        );
        showToast(`Assigned hardware to ${employee.firstName}.`);
      }
    } catch (err) {
      console.error("Assign asset error:", err);
      showToast("Failed to assign asset via server.");
    }
  };

  const handleOffboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    try {
      const res = await fetch(`/api/v1/employees/${employee.id}/offboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: offboardReason }),
      });
      if (res.ok) {
        await fetchEmployeeData();
        setAssets([]);
        setIsOffboardModalOpen(false);
        notifyDataChanged("employee", { action: "offboard", employeeId: employee.id });
        addNotification(
          "Offboarding Protocol Executed",
          `Offboarding completed for ${employee.firstName} ${employee.lastName}.`,
          "audit",
          "/employees"
        );
        showToast(`Offboarded ${employee.firstName} ${employee.lastName}. Systems de-provisioned.`);
      }
    } catch (err) {
      console.error("Offboard error:", err);
      showToast("Failed to complete offboard via server.");
    }
  };

  if (isLoading || !employee) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-pine border-t-transparent animate-spin" />
        <p className="text-xs text-graphite-muted dark:text-gray-400">Loading verified employee dossier from secure vault...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-pine dark:bg-[#32615E] text-ivory px-4 py-3 shadow-elevation flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-forest dark:text-[#38B38A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button and Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-graphite-muted dark:text-gray-400 hover:text-pine dark:hover:text-amberSignal transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to HR Dashboard</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleSendWelcomeEmail} className="text-xs gap-1.5">
            <Mail className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
            <span>Resend Welcome Email</span>
          </Button>
          <Button size="sm" variant="outline" onClick={handleOpenAssignModal} className="text-xs gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-steelBlue dark:text-[#7FA6BF]" />
            <span>Assign Hardware</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsOffboardModalOpen(true)} className="text-xs gap-1.5 text-brick dark:text-[#D96B64] hover:bg-brick/10 border-brick/30">
            <UserMinus className="w-3.5 h-3.5" />
            <span>Trigger Offboarding</span>
          </Button>
          <Button size="sm" variant="primary" onClick={handlePrintDossier} className="text-xs gap-1.5 shadow-subtle">
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF Dossier</span>
          </Button>
        </div>
      </div>

      {/* Header Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={employee.avatarUrl}
                alt={employee.firstName}
                className="w-16 h-16 rounded-xl object-cover border border-[#D0D8D7] dark:border-graphite-borderDark"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold font-headline text-graphite dark:text-ivory">
                    {employee.firstName} {employee.lastName}
                  </h1>
                  <Badge
                    variant={
                      employee.status === "COMPLETED"
                        ? "forest"
                        : employee.status === "IN_PROGRESS"
                        ? "clay"
                        : "steel"
                    }
                  >
                    {employee.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="text-xs font-semibold text-graphite dark:text-gray-200">{employee.jobTitle}</div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-graphite-muted dark:text-gray-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-pine dark:text-amberSignal" />
                    <span>{employee.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-pine dark:text-amberSignal" />
                    <span>{employee.department}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-pine dark:text-amberSignal" />
                    <span>Started: {employee.startDate}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-pine dark:text-amberSignal" />
                    <span>Manager: {employee.managerName}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end sm:border-l sm:pl-6 border-[#E3ECEB] dark:border-graphite-borderDark">
              <div className="sm:text-right">
                <span className="text-xs text-graphite-muted dark:text-gray-400 font-headline font-semibold uppercase">
                  Checklist Progress
                </span>
                <div className="text-3xl font-bold font-headline text-pine dark:text-amberSignal mt-0.5">
                  {employee.progress}%
                </div>
                <div className="text-[11px] text-graphite-muted dark:text-gray-400">
                  {employee.tasks.filter((t) => t.status === "COMPLETED").length} of {employee.tasks.length} tasks completed
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Assigned Onboarding Tasks & Approvals</CardTitle>
                <CardDescription>Click any status badge to verify or toggle completion</CardDescription>
              </div>
              <Badge variant="mist">{employee.tasks.length} Total Steps</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#E3ECEB] dark:divide-graphite-borderDark text-xs">
                {employee.tasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-start justify-between gap-3 hover:bg-mist/30 dark:hover:bg-graphite-dark/40 transition-colors">
                    <div className="flex items-start gap-3">
                      {task.status === "COMPLETED" ? (
                        <CheckCircle2 className="w-4 h-4 text-forest mt-0.5" />
                      ) : (
                        <Clock className="w-4 h-4 text-clayGold dark:text-amberSignal mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-graphite dark:text-ivory">{task.title}</div>
                        <div className="text-[11px] text-graphite-muted dark:text-gray-400 mt-0.5">{task.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-pine dark:text-[#6BB3AF] font-medium">Due: Day {task.dueDays}</span>
                          <span className="text-graphite-muted dark:text-gray-500">•</span>
                          <span className="text-[10px] uppercase text-graphite-muted dark:text-gray-400">Assigned: {task.assignedTo}</span>
                          {task.completedAt && (
                            <>
                              <span className="text-graphite-muted dark:text-gray-500">•</span>
                              <span className="text-[10px] text-forest dark:text-[#38B38A]">Verified</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={task.status === "COMPLETED" ? "outline" : "primary"}
                      onClick={() => handleToggleTask(task.id, task.status)}
                      className="text-[11px] h-7 px-2.5 shrink-0"
                    >
                      {task.status === "COMPLETED" ? "Mark Incomplete" : "Verify & Complete"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legal Documents Vault */}
          <Card>
            <CardHeader>
              <CardTitle>Digital Signatures & Document Vault</CardTitle>
              <CardDescription>Tamper-evident legal contracts and compliance uploads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.length === 0 ? (
                <div className="text-xs text-graphite-muted dark:text-gray-400 p-4 text-center">No documents registered yet.</div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark bg-ivory dark:bg-graphite-cardDark flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-pine/10 dark:bg-pine/30 text-pine dark:text-ivory">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-graphite dark:text-ivory">{doc.title}</div>
                        <div className="text-[11px] text-graphite-muted dark:text-gray-400">
                          {doc.fileSize} • {doc.isSigned ? "Digitally Signed" : "Upload Only"}
                        </div>
                        {doc.cryptoSignatureHash && (
                          <div className="text-[10px] font-mono text-pine dark:text-[#6BB3AF] flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="w-3 h-3 text-forest" />
                            <span>SHA-256: {doc.cryptoSignatureHash.substring(0, 28)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={doc.status === "APPROVED" ? "forest" : "clay"} size="sm">
                      {doc.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Hardware & Benefits */}
        <div className="space-y-6">
          {/* IT Assets Assigned */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Provisioned IT Hardware</CardTitle>
                <CardDescription>Assigned workstation hardware</CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={handleOpenAssignModal} className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" />
                <span>Assign</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {assets.length === 0 ? (
                <div className="text-xs text-graphite-muted dark:text-gray-400 p-2 text-center border border-dashed border-[#D8DFDE] dark:border-graphite-borderDark rounded-lg">
                  No hardware assigned yet.
                </div>
              ) : (
                assets.map((asset) => (
                  <div key={asset.id} className="p-3 rounded-lg border border-mist-dark dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-graphite dark:text-ivory">{asset.name}</span>
                      <Badge variant="forest" size="sm">Assigned</Badge>
                    </div>
                    <div className="text-graphite-muted dark:text-gray-400 text-[11px]">{asset.model}</div>
                    <div className="font-mono text-[10px] text-pine dark:text-[#6BB3AF] font-semibold">SN: {asset.serialNumber}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Benefits Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Benefits Plans</CardTitle>
              <CardDescription>Employee benefit selections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {benefits.map((ben) => (
                <div key={ben.id} className="p-2.5 rounded-lg bg-mist/40 dark:bg-graphite-dark/40 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-graphite dark:text-ivory">{ben.name}</div>
                    <div className="text-[10px] text-graphite-muted dark:text-gray-400">{ben.provider}</div>
                  </div>
                  <Badge variant="forest" size="sm">Active</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Custom Profile Attributes */}
          <CustomFieldsCard
            employeeId={employee.id}
            employeeName={`${employee.firstName} ${employee.lastName}`}
            initialValues={employee.customFieldValues}
            encryptedPii={employee.encryptedPii}
            onValuesUpdated={(updated) => {
              setEmployee((prev) => (prev ? { ...prev, customFieldValues: updated } : null));
            }}
          />
        </div>
      </div>

      {/* Assign Hardware Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                Assign Hardware to {employee.firstName}
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-cardDark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignAssetSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Available Inventory Item</label>
                {availableAssets.length === 0 ? (
                  <p className="text-clayGold dark:text-amberSignal">No available assets in inventory. Register an asset in IT Assets first.</p>
                ) : (
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory text-xs"
                  >
                    {availableAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} - {asset.model} (SN: {asset.serialNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button type="button" size="sm" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={availableAssets.length === 0}>
                  Confirm Checkout
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offboarding Modal */}
      {isOffboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-brick/40 shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="font-bold font-headline text-base text-brick">
                Trigger Offboarding Protocol
              </h3>
              <button
                onClick={() => setIsOffboardModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-cardDark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOffboardSubmit} className="mt-4 space-y-4 text-xs">
              <p className="text-graphite-muted dark:text-gray-300 leading-relaxed">
                Initiating offboarding for <span className="font-semibold text-graphite dark:text-ivory">{employee.firstName} {employee.lastName}</span> will revoke cloud SaaS credentials, mark assigned hardware as returned to inventory, and log a permanent compliance audit record.
              </p>

              <div>
                <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Departure Reason</label>
                <select
                  value={offboardReason}
                  onChange={(e) => setOffboardReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-[#14181B] text-graphite dark:text-ivory text-xs"
                >
                  <option value="Voluntary Resignation">Voluntary Resignation</option>
                  <option value="End of Contract / Seasonal Cohort">End of Contract / Seasonal Cohort</option>
                  <option value="Mutual Separation">Mutual Separation</option>
                  <option value="Involuntary Termination">Involuntary Termination</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button type="button" size="sm" variant="outline" onClick={() => setIsOffboardModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="danger">
                  Execute Offboarding
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
