"use client";

import React, { useState, useEffect } from "react";
import type { CertificationItem, BackgroundCheckItem, EVerifyItem, WhistleblowerItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  ShieldCheck,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Lock,
  FileCheck,
  Building,
  UserCheck,
  Eye,
  X,
  FileText,
} from "lucide-react";
import { useRole } from "@/lib/use-role";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";

export default function ComplianceCenterPage() {
  const { currentRole, currentUser } = useRole();
  const [activeTab, setActiveTab] = useState<"CERTS" | "CHECKR" | "EVERIFY" | "WHISTLEBLOWER">("CERTS");
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [backgroundChecks, setBackgroundChecks] = useState<BackgroundCheckItem[]>([]);
  const [eVerifyCases, setEVerifyCases] = useState<EVerifyItem[]>([]);
  const [whistleblowerReports, setWhistleblowerReports] = useState<WhistleblowerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isAddCertModalOpen, setIsAddCertModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isNewEVerifyModalOpen, setIsNewEVerifyModalOpen] = useState(false);
  const [isNewCheckrModalOpen, setIsNewCheckrModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);

  // Forms state
  const [newCert, setNewCert] = useState({
    employeeName: "Kaelen Chen",
    employeeId: "emp_kaelen_01",
    name: "",
    issuingAuthority: "",
    licenseNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
  });

  const [renewalDate, setRenewalDate] = useState("");

  const [newEVerify, setNewEVerify] = useState({
    employeeName: "Julian Vance",
    employeeId: "emp_julian_05",
    documentType: "US_PASSPORT" as EVerifyItem["documentType"],
  });

  const [newCheckr, setNewCheckr] = useState({
    candidateName: "Julian Vance",
    candidateId: "emp_julian_05",
    jobTitle: "Frontend Software Engineer",
    tier: "Standard Criminal + SSN Trace + Global Watchlist",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchComplianceData = async () => {
    try {
      const [certsRes, chkRes, evRes, wbRes] = await Promise.all([
        fetch("/api/v1/certifications", { cache: "no-store" }),
        fetch("/api/v1/compliance/checkr", { cache: "no-store" }),
        fetch("/api/v1/compliance/e-verify", { cache: "no-store" }),
        fetch("/api/v1/compliance/whistleblower", { cache: "no-store" }),
      ]);
      if (certsRes.ok) {
        const json = await certsRes.json();
        if (json.data) setCertifications(json.data);
      }
      if (chkRes.ok) {
        const json = await chkRes.json();
        if (json.data) setBackgroundChecks(json.data);
      }
      if (evRes.ok) {
        const json = await evRes.json();
        if (json.data) setEVerifyCases(json.data);
      }
      if (wbRes.ok) {
        const json = await wbRes.json();
        if (json.data) setWhistleblowerReports(json.data);
      }
    } catch (e) {
      console.error("Failed to load compliance data:", e);
    }
  };

  useEffect(() => {
    fetchComplianceData();
    const unsubscribe = subscribeToDataChanges(() => {
      fetchComplianceData();
    });
    return unsubscribe;
  }, []);

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.name || !newCert.expiryDate) return;

    try {
      const res = await fetch("/api/v1/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCert),
      });
      if (res.ok) {
        notifyDataChanged("compliance", { action: "add_cert", cert: newCert });
        showToast(`Registered "${newCert.name}" with expiration tracking.`);
        await fetchComplianceData();
      }
    } catch (err) {
      console.error(err);
    }

    setIsAddCertModalOpen(false);
    setNewCert({
      employeeName: "Kaelen Chen",
      employeeId: "emp_kaelen_01",
      name: "",
      issuingAuthority: "",
      licenseNumber: "",
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
    });
  };

  const handleRenewCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCert || !renewalDate) return;

    try {
      const res = await fetch(`/api/v1/certifications/${selectedCert.id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newExpiryDate: renewalDate }),
      });
      if (res.ok) {
        notifyDataChanged("compliance", { action: "renew_cert", certId: selectedCert.id });
        showToast(`Renewed "${selectedCert.name}" until ${renewalDate}.`);
        await fetchComplianceData();
      }
    } catch (err) {
      console.error(err);
    }

    setIsRenewModalOpen(false);
    setSelectedCert(null);
    setRenewalDate("");
  };

  const handleRunEVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/compliance/e-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEVerify),
      });
      if (res.ok) {
        const json = await res.json();
        notifyDataChanged("compliance", { action: "everify", employeeId: newEVerify.employeeId });
        showToast(`E-Verify case ${json.data.caseNumber} generated: Employment Authorized.`);
        await fetchComplianceData();
      }
    } catch (err) {
      console.error(err);
    }
    setIsNewEVerifyModalOpen(false);
  };

  const handleRunCheckr = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/compliance/checkr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCheckr),
      });
      if (res.ok) {
        notifyDataChanged("compliance", { action: "checkr", candidateId: newCheckr.candidateId });
        showToast(`Checkr screening completed for ${newCheckr.candidateName}: CLEAR.`);
        await fetchComplianceData();
      }
    } catch (err) {
      console.error(err);
    }
    setIsNewCheckrModalOpen(false);
  };

  const expiringCertsCount = certifications.filter((c) => c.status === "EXPIRING_SOON").length;
  const expiredCertsCount = certifications.filter((c) => c.status === "EXPIRED").length;

  return (
    <RoleGuard
      allowedRoles={["ADMIN", "HR_MANAGER", "MANAGER", "IT_PROVISIONER"]}
      moduleName="Compliance & Verification Center"
      description="Centralized SME governance engine for certification expirations, Checkr criminal screenings, DHS E-Verify cases, and whistleblower audit records."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 rounded-xl bg-pine dark:bg-[#203D3B] text-ivory px-4 py-3 shadow-elevation border border-pine-light flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-amberSignal" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D8DFDE] dark:border-graphite-borderDark">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-[#38B38A] border border-forest/20">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl font-bold font-headline text-graphite dark:text-ivory tracking-tight">
                  Compliance & Verification Center
                </h1>
                <p className="text-xs text-graphite-muted dark:text-gray-400">
                  Regulatory tracking for professional certifications, federal E-Verify status, background screenings, and ethics.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/whistleblower"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-headline font-semibold rounded-xl bg-mist dark:bg-graphite-cardDark border border-mist-dark dark:border-graphite-borderDark hover:bg-mist-dark dark:hover:bg-graphite-dark text-graphite dark:text-ivory transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
              <span>Public Whistleblower Box</span>
            </a>
          </div>
        </div>

        {/* Expiry Alerts Banner if any expiring certs */}
        {(expiringCertsCount > 0 || expiredCertsCount > 0) && (
          <div className="p-4 rounded-xl border border-brick/30 dark:border-brick/40 bg-brick/5 dark:bg-brick/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brick/15 dark:bg-brick/25 text-brick flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold font-headline text-brick">
                  Attention Required: {expiringCertsCount} certification(s) expiring within 30 days, {expiredCertsCount} expired.
                </span>
                <p className="text-graphite-muted dark:text-gray-400 mt-0.5">
                  Automated notifications have been dispatched to the respective employees and managers.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("CERTS")}
              className="text-xs border-brick/30 text-brick hover:bg-brick/10 shrink-0"
            >
              Review Expirations
            </Button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#D8DFDE] dark:border-graphite-borderDark pb-2 overflow-x-auto">
          {[
            { id: "CERTS", label: "Certification Expirations", count: certifications.length, icon: Award },
            { id: "CHECKR", label: "Checkr Background Checks", count: backgroundChecks.length, icon: UserCheck },
            { id: "EVERIFY", label: "DHS E-Verify Cases", count: eVerifyCases.length, icon: FileCheck },
            { id: "WHISTLEBLOWER", label: "Whistleblower Complaints", count: whistleblowerReports.length, icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-headline font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-pine dark:bg-pine-600 text-ivory shadow-subtle"
                    : "text-graphite dark:text-gray-300 hover:bg-mist dark:hover:bg-graphite-dark"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-mist-dark dark:bg-graphite-dark text-graphite-muted dark:text-gray-400"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Certification Expirations */}
        {activeTab === "CERTS" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-graphite-muted dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by employee or certification name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory placeholder:text-graphite-muted dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddCertModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Certification</span>
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[760px]">
                  <thead className="bg-mist/50 dark:bg-graphite-dark/50 border-b border-[#E3ECEB] dark:border-graphite-borderDark text-graphite-muted dark:text-gray-400 font-headline uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Certification Name</th>
                      <th className="py-3 px-4">Issuing Body</th>
                      <th className="py-3 px-4">License #</th>
                      <th className="py-3 px-4">Expiry Date</th>
                      <th className="py-3 px-4">Compliance Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3ECEB] dark:divide-graphite-borderDark">
                    {certifications
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.employeeName.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((cert) => (
                        <tr key={cert.id} className="hover:bg-mist/30 dark:hover:bg-graphite-dark/30 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-graphite dark:text-ivory">
                            {cert.employeeName}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-pine dark:text-[#6BB3AF]">
                            {cert.name}
                          </td>
                          <td className="py-3.5 px-4 text-graphite-muted dark:text-gray-300">
                            {cert.issuingAuthority}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-graphite-muted dark:text-gray-400">
                            {cert.licenseNumber}
                          </td>
                          <td className="py-3.5 px-4 text-graphite dark:text-gray-300">
                            {cert.expiryDate}
                            <span className="block text-[10px] text-graphite-muted dark:text-gray-500">
                              {cert.daysUntilExpiry > 0 ? `${cert.daysUntilExpiry} days left` : "Expired"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {cert.status === "ACTIVE" && <Badge variant="forest">Active & Valid</Badge>}
                            {cert.status === "EXPIRING_SOON" && <Badge variant="clay">Expiring Soon</Badge>}
                            {cert.status === "EXPIRED" && <Badge variant="brick">Expired</Badge>}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCert(cert);
                                setRenewalDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
                                setIsRenewModalOpen(true);
                              }}
                              className="text-xs gap-1 border-pine/30 hover:bg-mist dark:hover:bg-graphite-dark"
                            >
                              <RefreshCw className="w-3 h-3 text-pine dark:text-amberSignal" />
                              <span>Renew</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Checkr Background Checks */}
        {activeTab === "CHECKR" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-graphite-muted dark:text-gray-400">
                Continuous criminal record monitoring, SSN trace, and education verification powered by Checkr Enterprise API.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewCheckrModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Order Screening</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {backgroundChecks.map((chk) => (
                <Card key={chk.id} className="hover:border-pine/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={chk.status === "CLEAR" ? "forest" : "clay"}>
                        {chk.status}
                      </Badge>
                      <span className="text-[10px] font-mono text-graphite-muted dark:text-gray-400">
                        {chk.provider}
                      </span>
                    </div>
                    <CardTitle className="text-sm mt-2">{chk.candidateName}</CardTitle>
                    <CardDescription>{chk.jobTitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs space-y-2">
                    <div className="p-2.5 rounded-lg bg-mist/50 dark:bg-graphite-dark/50 border border-mist-dark dark:border-graphite-borderDark text-[11px] space-y-1">
                      <div className="text-graphite-muted dark:text-gray-400">Screening Package:</div>
                      <div className="font-semibold text-graphite dark:text-ivory">{chk.tier}</div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 text-graphite-muted dark:text-gray-400">
                      <span>Turnaround Time:</span>
                      <span className="font-semibold text-graphite dark:text-ivory">{chk.turnaroundDays} business days</span>
                    </div>
                    {chk.completedAt && (
                      <div className="flex items-center justify-between text-[11px] text-graphite-muted dark:text-gray-400">
                        <span>Verified At:</span>
                        <span>{new Date(chk.completedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    <a
                      href={chk.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-pine dark:text-amberSignal hover:underline pt-2"
                    >
                      <span>View Official Checkr Dossier</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: DHS E-Verify Cases */}
        {activeTab === "EVERIFY" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-graphite-muted dark:text-gray-400">
                U.S. Department of Homeland Security (DHS) and SSA electronic employment authorization verification for Form I-9 compliance.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewEVerifyModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit E-Verify Case</span>
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[700px]">
                  <thead className="bg-mist/50 dark:bg-graphite-dark/50 border-b border-[#E3ECEB] dark:border-graphite-borderDark text-graphite-muted dark:text-gray-400 font-headline uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Case Number</th>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Document Type</th>
                      <th className="py-3 px-4">Submission Date</th>
                      <th className="py-3 px-4">Verification Result</th>
                      <th className="py-3 px-4">Eligibility Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3ECEB] dark:divide-graphite-borderDark">
                    {eVerifyCases.map((ev) => (
                      <tr key={ev.id} className="hover:bg-mist/30 dark:hover:bg-graphite-dark/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-pine dark:text-[#6BB3AF]">
                          {ev.caseNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-graphite dark:text-ivory">
                          {ev.employeeName}
                        </td>
                        <td className="py-3.5 px-4 text-graphite-muted dark:text-gray-300">
                          {ev.documentType.replace(/_/g, " ")}
                        </td>
                        <td className="py-3.5 px-4 text-graphite-muted dark:text-gray-400">
                          {new Date(ev.submissionDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="forest" className="gap-1">
                            <CheckCircle2 className="w-3 h-3 text-forest" />
                            <span>{ev.status.replace(/_/g, " ")}</span>
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-graphite-muted dark:text-gray-400">
                          {ev.eligibilityCode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 4: Whistleblower Reports (HR/Admin view) */}
        {activeTab === "WHISTLEBLOWER" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-steelBlue/30 bg-steelBlue/5 dark:bg-steelBlue/10 flex items-center justify-between gap-4">
              <div className="text-xs">
                <span className="font-bold text-steelBlue dark:text-[#7FA6BF]">
                  Zero-Knowledge Cryptographic Compliance Box
                </span>
                <p className="text-graphite-muted dark:text-gray-400 mt-0.5">
                  Submissions are stripped of IP addresses, browser fingerprints, and employee account identifiers. Reporters hold the sole private SHA-256 retrieval key.
                </p>
              </div>
              <a
                href="/whistleblower"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button size="sm" variant="outline" className="text-xs">
                  <span>Open Public Portal</span>
                  <ExternalLink className="w-3 h-3 ml-1.5" />
                </Button>
              </a>
            </div>

            <div className="space-y-3">
              {whistleblowerReports.map((wb) => (
                <Card key={wb.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-mist-dark dark:border-graphite-borderDark">
                    <div className="flex items-center gap-2">
                      <Badge variant="clay">{wb.category}</Badge>
                      <span className="font-mono text-[11px] text-graphite-muted dark:text-gray-400">
                        Token: {wb.trackingToken}
                      </span>
                    </div>
                    <Badge variant={wb.status === "RESOLVED" ? "forest" : "amber"}>
                      {wb.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <h4 className="font-semibold font-headline text-sm text-graphite dark:text-ivory">
                      {wb.subject}
                    </h4>
                    <p className="text-graphite-muted dark:text-gray-300 leading-relaxed bg-mist/40 dark:bg-graphite-dark/40 p-3 rounded-lg border border-mist-dark dark:border-graphite-borderDark">
                      {wb.details}
                    </p>
                    {wb.resolutionNotes && (
                      <div className="p-3 rounded-lg bg-forest/5 dark:bg-forest/15 border border-forest/20 text-forest dark:text-[#38B38A] text-[11px]">
                        <span className="font-semibold">Investigation Note:</span> {wb.resolutionNotes}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Register New Certification */}
        {isAddCertModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-mist-dark dark:border-graphite-borderDark mb-4">
                <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                  Register Professional Certification
                </h3>
                <button onClick={() => setIsAddCertModalOpen(false)}>
                  <X className="w-4 h-4 text-graphite-muted hover:text-graphite dark:hover:text-ivory" />
                </button>
              </div>

              <form onSubmit={handleAddCert} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Employee</label>
                  <select
                    value={newCert.employeeName}
                    onChange={(e) => setNewCert({ ...newCert, employeeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                  >
                    <option value="Kaelen Chen">Kaelen Chen (Staff Engineer)</option>
                    <option value="Maya Lin">Maya Lin (Senior Designer)</option>
                    <option value="Julian Vance">Julian Vance (Frontend Engineer)</option>
                    <option value="Chloe Bennett">Chloe Bennett (People Ops)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Certification Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Certified Information Systems Security Professional"
                    value={newCert.name}
                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. (ISC)², CompTIA, AWS, PMI"
                    value={newCert.issuingAuthority}
                    onChange={(e) => setNewCert({ ...newCert, issuingAuthority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">License #</label>
                    <input
                      type="text"
                      placeholder="e.g. LIC-9982"
                      value={newCert.licenseNumber}
                      onChange={(e) => setNewCert({ ...newCert, licenseNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={newCert.expiryDate}
                      onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddCertModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Certification
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Renew Certification */}
        {isRenewModalOpen && selectedCert && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-mist-dark dark:border-graphite-borderDark mb-4">
                <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                  Renew Certification
                </h3>
                <button onClick={() => setIsRenewModalOpen(false)}>
                  <X className="w-4 h-4 text-graphite-muted hover:text-graphite dark:hover:text-ivory" />
                </button>
              </div>

              <form onSubmit={handleRenewCert} className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-mist/50 dark:bg-graphite-dark/50 border border-mist-dark dark:border-graphite-borderDark space-y-1">
                  <div className="font-semibold text-graphite dark:text-ivory">{selectedCert.name}</div>
                  <div className="text-graphite-muted dark:text-gray-400">Employee: {selectedCert.employeeName}</div>
                  <div className="text-graphite-muted dark:text-gray-400">Current Expiry: {selectedCert.expiryDate}</div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">New Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsRenewModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Confirm Renewal
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: New E-Verify Case */}
        {isNewEVerifyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-mist-dark dark:border-graphite-borderDark mb-4">
                <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                  Submit DHS E-Verify Case
                </h3>
                <button onClick={() => setIsNewEVerifyModalOpen(false)}>
                  <X className="w-4 h-4 text-graphite-muted hover:text-graphite dark:hover:text-ivory" />
                </button>
              </div>

              <form onSubmit={handleRunEVerify} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Employee Candidate</label>
                  <select
                    value={newEVerify.employeeName}
                    onChange={(e) => setNewEVerify({ ...newEVerify, employeeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                  >
                    <option value="Julian Vance">Julian Vance (Frontend Engineer)</option>
                    <option value="Maya Lin">Maya Lin (Senior Designer)</option>
                    <option value="Chloe Bennett">Chloe Bennett (People Ops)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Document Category</label>
                  <select
                    value={newEVerify.documentType}
                    onChange={(e) => setNewEVerify({ ...newEVerify, documentType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                  >
                    <option value="US_PASSPORT">U.S. Passport or Passport Card (List A)</option>
                    <option value="PERMANENT_RESIDENT_CARD">Permanent Resident Card Form I-551 (List A)</option>
                    <option value="DRIVERS_LICENSE_SSN">Driver's License + Social Security Card (List B & C)</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-pine/5 dark:bg-pine/20 border border-pine/20 text-xs text-pine dark:text-ivory">
                  DHS case check will verify document eligibility against SSA and Homeland Security databases.
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsNewEVerifyModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Submit to DHS
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: New Checkr Screening */}
        {isNewCheckrModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-mist-dark dark:border-graphite-borderDark mb-4">
                <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                  Order Checkr Screening
                </h3>
                <button onClick={() => setIsNewCheckrModalOpen(false)}>
                  <X className="w-4 h-4 text-graphite-muted hover:text-graphite dark:hover:text-ivory" />
                </button>
              </div>

              <form onSubmit={handleRunCheckr} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Candidate Name</label>
                  <input
                    type="text"
                    required
                    value={newCheckr.candidateName}
                    onChange={(e) => setNewCheckr({ ...newCheckr, candidateName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={newCheckr.jobTitle}
                    onChange={(e) => setNewCheckr({ ...newCheckr, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Screening Package</label>
                  <select
                    value={newCheckr.tier}
                    onChange={(e) => setNewCheckr({ ...newCheckr, tier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                  >
                    <option value="Standard Criminal + SSN Trace + Global Watchlist">Standard Criminal + SSN Trace + Global Watchlist</option>
                    <option value="Comprehensive Criminal + Education Verification">Comprehensive Criminal + Education Verification</option>
                    <option value="Executive Tier (Criminal, Credit, Education, MVR)">Executive Tier (Criminal, Credit, Education, MVR)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsNewCheckrModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Order Background Check
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
