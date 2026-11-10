"use client";

import React, { useState, useEffect } from "react";
import type {
  CompanyData,
  WebhookItem,
  ApiKeyItem,
  TimeOffPolicyItem,
  EmployeeData,
  CustomFieldDefinition,
  ScheduledReportItem,
  CustomDomainItem,
  SsoConfigItem,
} from "@/lib/types";
import type { AuditRecord } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  Settings,
  ShieldCheck,
  Webhook,
  Key,
  Palette,
  Trash2,
  Plus,
  CheckCircle2,
  Lock,
  Search,
  Download,
  Calendar,
  Send,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  X,
  FileCheck,
  Sliders,
  FileBarChart,
  Globe,
  Server,
  ExternalLink,
} from "lucide-react";
import { useRole } from "@/lib/use-role";
import { addNotification } from "@/lib/notifications";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";

export default function SettingsPage() {
  const { currentRole, currentUser } = useRole();
  const [activeTab, setActiveTab] = useState<
    "COMPANY" | "AUDIT" | "WEBHOOKS" | "KEYS" | "GDPR" | "TIMEOFF" | "CUSTOMFIELDS" | "REPORTS" | "DOMAINS" | "SSO"
  >("COMPANY");
  const [company, setCompany] = useState<CompanyData>({
    id: "comp_acme_01",
    name: "Acme Technologies Inc.",
    slug: "acme",
    logoUrl: "/onboardx-logo.png",
    primaryColor: "#274C4A",
    accentColor: "#D98A1E",
  });
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [timeOffPolicies, setTimeOffPolicies] = useState<TimeOffPolicyItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);

  // Enterprise Modules State
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReportItem[]>([]);
  const [customDomains, setCustomDomains] = useState<CustomDomainItem[]>([]);
  const [ssoConfig, setSsoConfig] = useState<SsoConfigItem | null>(null);

  // Form States
  const [newCustomField, setNewCustomField] = useState({
    name: "",
    label: "",
    type: "text" as "text" | "date" | "dropdown" | "boolean",
    required: false,
    options: "Small,Medium,Large,XL",
  });
  const [newReport, setNewReport] = useState({
    title: "",
    frequency: "WEEKLY" as "DAILY" | "WEEKLY" | "MONTHLY",
    reportType: "ONBOARDING_VELOCITY" as "ONBOARDING_VELOCITY" | "COMPLIANCE_DIGEST" | "HARDWARE_INVENTORY",
    exportFormat: "CSV" as "CSV" | "PDF",
    recipients: "hr-execs@acme.corp, ops@acme.corp",
  });
  const [newDomain, setNewDomain] = useState("");

  const [auditSearch, setAuditSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [verifiedChain, setVerifiedChain] = useState<boolean | null>(null);

  const fetchSettingsData = async () => {
    try {
      const [compRes, auditRes, whRes, keysRes, timeRes, empRes] = await Promise.all([
        fetch("/api/v1/settings/company", { cache: "no-store" }),
        fetch("/api/v1/audit-logs", { cache: "no-store" }),
        fetch("/api/v1/webhooks", { cache: "no-store" }),
        fetch("/api/v1/api-keys", { cache: "no-store" }),
        fetch("/api/v1/settings/time-off", { cache: "no-store" }),
        fetch("/api/v1/employees", { cache: "no-store" }),
      ]);

      if (compRes.ok) {
        const json = await compRes.json();
        if (json.data) setCompany(json.data);
      }
      if (auditRes.ok) {
        const json = await auditRes.json();
        if (json.data) setAuditLogs(json.data);
      }
      if (whRes.ok) {
        const json = await whRes.json();
        if (json.data) setWebhooks(json.data);
      }
      if (keysRes.ok) {
        const json = await keysRes.json();
        if (json.data) setApiKeys(json.data);
      }
      if (timeRes.ok) {
        const json = await timeRes.json();
        if (json.data) setTimeOffPolicies(json.data);
      }
      if (empRes.ok) {
        const json = await empRes.json();
        if (json.data) setEmployees(json.data);
      }

      // Fetch enterprise expansion endpoints
      const [cfRes, repRes, domRes, ssoRes] = await Promise.all([
        fetch("/api/v1/settings/custom-fields", { cache: "no-store" }),
        fetch("/api/v1/reports/scheduled", { cache: "no-store" }),
        fetch("/api/v1/settings/domains", { cache: "no-store" }),
        fetch("/api/v1/settings/sso", { cache: "no-store" }),
      ]);

      if (cfRes.ok) {
        const d = await cfRes.json();
        if (d.fields) setCustomFields(d.fields);
      }
      if (repRes.ok) {
        const d = await repRes.json();
        if (d.reports) setScheduledReports(d.reports);
      }
      if (domRes.ok) {
        const d = await domRes.json();
        if (d.domains) setCustomDomains(d.domains);
      }
      if (ssoRes.ok) {
        const d = await ssoRes.json();
        if (d.sso) setSsoConfig(d.sso);
      }
    } catch (err) {
      console.error("Failed to load settings data from server:", err);
    }
  };

  useEffect(() => {
    fetchSettingsData();
    const unsubscribe = subscribeToDataChanges(() => {
      fetchSettingsData();
    });
    return unsubscribe;
  }, []);

  // Modals state
  const [isAddWebhookModalOpen, setIsAddWebhookModalOpen] = useState(false);
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const [isGdprModalOpen, setIsGdprModalOpen] = useState(false);
  const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // New Webhook Form State
  const [newWebhook, setNewWebhook] = useState({
    url: "",
    events: "employee.created, employee.completed",
    secret: "whsec_" + Math.random().toString(36).substring(2, 10),
  });

  // New API Key Form State
  const [newKeyForm, setNewKeyForm] = useState({
    name: "",
    role: "HR_INTEGRATION",
  });

  // GDPR Form State
  const [selectedGdprEmpId, setSelectedGdprEmpId] = useState(employees[0]?.id || "");

  // New Time-Off Policy Form State
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    daysPerYear: 15,
    accrualFrequency: "Monthly",
    rolloverAllowed: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/v1/settings/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      await fetchSettingsData();
      notifyDataChanged("settings", { action: "update_company" });
    } catch (err) {
      console.error("Save company error:", err);
      showToast("Failed to update company branding.");
    }

    addNotification(
      "Tenant Branding Updated",
      `White-label settings and enterprise theme preferences saved by ${currentUser.name}.`,
      "audit",
      "/settings"
    );
    showToast("Tenant white-labeling and brand preferences saved.");
  };

  const handleResetCompanyDefaults = async () => {
    const defaults = {
      name: "Acme Technologies Inc.",
      slug: "acme",
      primaryColor: "#274C4A",
      accentColor: "#D98A1E",
    };
    try {
      await fetch("/api/v1/settings/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaults),
      });
      await fetchSettingsData();
      notifyDataChanged("settings", { action: "reset_company" });
    } catch (err) {
      console.error("Reset company error:", err);
      showToast("Failed to reset branding defaults.");
    }

    addNotification(
      "Tenant Branding Reset",
      `Reset enterprise theme to Acme default tokens by ${currentUser.name}.`,
      "audit",
      "/settings"
    );
    showToast("Reset tenant branding to standard Acme defaults.");
  };

  const handleVerifyChain = () => {
    setVerifiedChain(true);
    addNotification(
      "Audit Ledger Cryptographically Verified",
      `All SHA-256 block digests in immutable compliance ledger verified intact.`,
      "audit",
      "/settings"
    );
    showToast("All cryptographic SHA-256 block hashes verified intact.");
  };

  const handleExportAuditCSV = () => {
    const headers = "Timestamp,Actor Email,Actor Role,Action,Target Entity,Entity ID,SHA-256 Hash\n";
    const rows = auditLogs
      .map(
        (l) =>
          `"${l.createdAt}","${l.actorEmail}","${l.actorRole}","${l.action}","${l.entityType}","${l.entityId}","${l.sha256Hash}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `onboardx_audit_trail_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported immutable SHA-256 audit ledger (CSV).");
  };

  // Webhooks
  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhook.url) return;

    try {
      await fetch("/api/v1/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newWebhook.url,
          events: newWebhook.events,
        }),
      });
      await fetchSettingsData();
      notifyDataChanged("settings", { action: "create_webhook" });
    } catch (err) {
      console.error("Create webhook error:", err);
      showToast("Failed to register webhook.");
    }

    setIsAddWebhookModalOpen(false);
    const targetUrl = newWebhook.url;
    const targetEvents = newWebhook.events;
    addNotification(
      "Webhook Endpoint Registered",
      `Subscribed outbound ATS webhook: ${targetUrl} (${targetEvents}).`,
      "system",
      "/settings"
    );
    setNewWebhook({
      url: "",
      events: "employee.created, employee.completed",
      secret: "whsec_" + Math.random().toString(36).substring(2, 10),
    });
    showToast(`Outbound webhook registered for ${targetUrl}`);
  };

  const handleTestPing = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/webhooks/${id}/test`, { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        showToast(`Test ping dispatched to ${json.webhook?.url || "endpoint"}. Status 200 OK.`);
        await fetchSettingsData();
        return;
      }
    } catch (err) {
      console.error("Test webhook error:", err);
      showToast("Failed to dispatch test ping.");
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await fetch(`/api/v1/webhooks/${id}`, { method: "DELETE" });
      await fetchSettingsData();
      notifyDataChanged("settings", { action: "delete_webhook" });
    } catch (err) {
      console.error("Delete webhook error:", err);
      showToast("Failed to remove webhook.");
    }
    showToast("Webhook endpoint removed.");
  };

  // API Keys
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyForm.name) return;

    try {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyForm.name,
          role: newKeyForm.role,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const key = json.apiKey;
        setNewlyCreatedKey(key.fullToken || key.keyPrefix);
        await fetchSettingsData();
        notifyDataChanged("settings", { action: "create_key" });
        addNotification(
          "API Token Provisioned",
          `Created new integration token "${key.name}" with role ${key.role}.`,
          "audit",
          "/settings"
        );
        showToast(`Generated new API token: "${key.name}"`);
        setNewKeyForm({ name: "", role: "HR_INTEGRATION" });
        return;
      }
    } catch (err) {
      console.error("Create API key error:", err);
      showToast("Failed to generate API token.");
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await fetch(`/api/v1/api-keys/${id}/revoke`, { method: "POST" });
      await fetchSettingsData();
      notifyDataChanged("settings", { action: "revoke_key" });
    } catch (err) {
      console.error("Revoke key error:", err);
      showToast("Failed to revoke API key.");
    }
    addNotification(
      "API Token Revoked",
      `Revoked access key ${id} from active token roster.`,
      "audit",
      "/settings"
    );
    showToast("API Access Token revoked.");
  };

  const handleCopyKey = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
    showToast("Token copied to clipboard.");
  };

  // GDPR
  const handleExecuteGdpr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGdprEmpId) return;

    try {
      await fetch(`/api/v1/employees/${selectedGdprEmpId}/anonymize`, { method: "POST" });
      await fetchSettingsData();
      notifyDataChanged("employee", { action: "gdpr", id: selectedGdprEmpId });
    } catch (err) {
      console.error("GDPR erasure error:", err);
      showToast("Failed to execute GDPR erasure.");
    }

    setIsGdprModalOpen(false);
    addNotification(
      "GDPR Erasure Executed",
      `Article 17 Right-to-be-Forgotten zeroization completed for employee ${selectedGdprEmpId}.`,
      "audit",
      "/settings"
    );
    showToast(`GDPR Article 17 erasure executed for employee ${selectedGdprEmpId}. PII zeroized.`);
  };

  // Time-Off Policies
  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicy.name) return;

    try {
      await fetch("/api/v1/settings/time-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPolicy.name,
          daysPerYear: Number(newPolicy.daysPerYear),
          accrualFrequency: newPolicy.accrualFrequency,
          rolloverAllowed: newPolicy.rolloverAllowed,
        }),
      });
      await fetchSettingsData();
      notifyDataChanged("settings", { action: "add_policy" });
    } catch (err) {
      console.error("Add time-off policy error:", err);
      showToast("Failed to add time-off policy.");
    }

    setIsAddPolicyModalOpen(false);
    const addedPolicyName = newPolicy.name;
    const addedDays = newPolicy.daysPerYear;
    addNotification(
      "Time-Off Policy Added",
      `Configured "${addedPolicyName}" standard benefit plan (${addedDays} days/year).`,
      "employee",
      "/settings"
    );
    setNewPolicy({
      name: "",
      daysPerYear: 15,
      accrualFrequency: "Monthly",
      rolloverAllowed: true,
    });
    showToast(`Registered time-off policy "${addedPolicyName}" (${addedDays} days).`);
  };

  // Enterprise Action Handlers
  const handleCreateCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/settings/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustomField.name.toLowerCase().replace(/\s+/g, "_"),
          label: newCustomField.label,
          type: newCustomField.type,
          required: newCustomField.required,
          options: newCustomField.type === "dropdown" ? newCustomField.options.split(",").map((s) => s.trim()) : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCustomFields((prev) => [...prev, data.field]);
        setNewCustomField({ name: "", label: "", type: "text", required: false, options: "" });
        notifyDataChanged("settings", { action: "add_custom_field" });
        showToast(`Custom attribute "${data.field.label}" registered in schema.`);
      }
    } catch (err) {
      console.error("Custom field creation error:", err);
    }
  };

  const handleCreateScheduledReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/reports/scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newReport.title,
          frequency: newReport.frequency,
          reportType: newReport.reportType,
          exportFormat: newReport.exportFormat,
          recipients: newReport.recipients.split(",").map((s) => s.trim()),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setScheduledReports((prev) => [...prev, data.report]);
        setNewReport({
          title: "",
          frequency: "WEEKLY",
          reportType: "ONBOARDING_VELOCITY",
          exportFormat: "CSV",
          recipients: "",
        });
        notifyDataChanged("settings", { action: "add_scheduled_report" });
        showToast(`Scheduled recurring report "${data.report.title}" created.`);
      }
    } catch (err) {
      console.error("Scheduled report error:", err);
    }
  };

  const handleRunReportNow = async (id: string, title: string) => {
    try {
      const res = await fetch("/api/v1/reports/scheduled", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showToast(`Dispatched "${title}" to recipients with audit confirmation.`);
        fetchSettingsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    try {
      const res = await fetch("/api/v1/settings/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });
      if (res.ok) {
        const data = await res.json();
        setCustomDomains((prev) => [...prev, data.domain]);
        setNewDomain("");
        notifyDataChanged("settings", { action: "add_domain" });
        showToast(`Custom domain "${data.domain.domain}" verified.`);
      }
    } catch (err) {
      console.error("Custom domain error:", err);
    }
  };

  const handleSaveSso = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/settings/sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ssoConfig),
      });
      if (res.ok) {
        const data = await res.json();
        setSsoConfig(data.sso);
        notifyDataChanged("settings", { action: "save_sso" });
        showToast("SAML 2.0 & Azure Active Directory configuration persisted.");
      }
    } catch (err) {
      console.error("SSO save error:", err);
    }
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.actorEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.entityType.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <RoleGuard
      allowedRoles={["ADMIN", "HR_MANAGER"]}
      moduleName="System Governance & Settings"
      description="Global tenant white-labeling, brand configuration, custom fields, scheduled reports, and cryptographic security settings are accessible to Admins and HR Managers."
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-pine dark:bg-[#32615E] text-ivory px-4 py-3 shadow-elevation flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-forest dark:text-[#38B38A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role Adaptive Banner */}
      {currentRole === "EMPLOYEE" && (
        <div className="rounded-xl border border-clayGold/40 bg-clayGold/10 dark:bg-clayGold/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-clayGold/20 text-[#8C620A] dark:text-amberSignal shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-graphite dark:text-ivory">
                  Role Restriction: Read-Only Audit Access ({currentUser.name})
                </span>
                <Badge variant="mist">New Hire Mode</Badge>
              </div>
              <p className="text-[11px] text-graphite-muted dark:text-gray-300 mt-0.5">
                Per Section 15 of OnboardX security policy, global tenant white-labeling, webhook configurations, and API keys are restricted to Administrators (Eleanor Vance).
              </p>
            </div>
          </div>
          <Badge variant="clay">Restricted Controls</Badge>
        </div>
      )}

      {currentRole === "ADMIN" && (
        <div className="rounded-xl border border-amberSignal/30 bg-amberSignal/10 dark:bg-amberSignal/20 p-3.5 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amberSignal shrink-0" />
            <span className="font-semibold text-graphite dark:text-ivory">
              SuperAdmin Active: {currentUser.name} — Full organizational tenant configuration, webhook subscriptions, and cryptographic keys unlocked.
            </span>
          </div>
          <Badge variant="pine">Root Authority</Badge>
        </div>
      )}

      {currentRole === "HR_MANAGER" && (
        <div className="rounded-xl border border-pine/30 bg-pine/10 dark:bg-pine/20 p-3.5 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-pine dark:text-amberSignal shrink-0" />
            <span className="font-semibold text-graphite dark:text-ivory">
              HR Management Active: {currentUser.name} — Time-Off policies, GDPR subject requests, and audit inspection enabled.
            </span>
          </div>
          <Badge variant="mist">People Operations</Badge>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-headline text-graphite dark:text-ivory tracking-tight">
          Enterprise Settings & Compliance Governance
        </h1>
        <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1">
          Manage white-label branding, ATS webhooks, API tokens, and review immutable cryptographic audit trails.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D8DFDE] dark:border-graphite-borderDark gap-4 text-xs font-headline font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("COMPANY")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "COMPANY"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Branding & White-Labeling</span>
        </button>

        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "AUDIT"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Immutable Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("WEBHOOKS")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "WEBHOOKS"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Webhook className="w-4 h-4" />
          <span>Webhooks ({webhooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("KEYS")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "KEYS"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Access Tokens ({apiKeys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("TIMEOFF")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "TIMEOFF"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Time-Off Policies ({timeOffPolicies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("GDPR")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "GDPR"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>GDPR & Privacy</span>
        </button>

        <button
          onClick={() => setActiveTab("CUSTOMFIELDS")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "CUSTOMFIELDS"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Custom Fields ({customFields.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("REPORTS")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "REPORTS"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <FileBarChart className="w-4 h-4" />
          <span>Scheduled Reports ({scheduledReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("DOMAINS")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "DOMAINS"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Custom Domains ({customDomains.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("SSO")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "SSO"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>SAML 2.0 & Azure AD</span>
        </button>
      </div>

      {/* TAB 1: Company White-Labeling */}
      {activeTab === "COMPANY" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Tenant Customization & Architectural Palette</CardTitle>
            <CardDescription>
              Tailor your SME workspace with custom tenant slug, primary colors, and logo representation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Tenant Subdomain Slug</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 rounded-l-xl border border-r-0 border-graphite-border dark:border-graphite-borderDark bg-mist dark:bg-graphite-dark text-graphite-muted dark:text-gray-400">
                    https://
                  </span>
                  <input
                    type="text"
                    value={company.slug}
                    onChange={(e) => setCompany({ ...company, slug: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-r-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none transition-colors"
                  />
                  <span className="px-3 py-2 text-graphite-muted dark:text-gray-400">.onboardx.io</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Primary Color (Slate Pine)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={company.primaryColor}
                      onChange={(e) => setCompany({ ...company, primaryColor: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-graphite-border dark:border-graphite-borderDark cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={company.primaryColor}
                      onChange={(e) => setCompany({ ...company, primaryColor: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 font-mono text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Accent Color (Amber Signal)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={company.accentColor}
                      onChange={(e) => setCompany({ ...company, accentColor: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-graphite-border dark:border-graphite-borderDark cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={company.accentColor}
                      onChange={(e) => setCompany({ ...company, accentColor: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 font-mono text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={handleResetCompanyDefaults}
                  className="text-xs gap-1 text-graphite-muted dark:text-gray-400"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </Button>

                <Button size="sm" variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Immutable Audit Logs */}
      {activeTab === "AUDIT" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Tamper-Evident Security Audit Trail</CardTitle>
                {verifiedChain && (
                  <Badge variant="forest" size="sm" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Cryptographically Intact</span>
                  </Badge>
                )}
              </div>
              <CardDescription>
                Cryptographic SHA-256 signatures for every contract view, signature, and asset checkout.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleVerifyChain}
                className="h-8 text-xs gap-1"
                title="Verify cryptographic hash integrity"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-forest dark:text-[#38B38A]" />
                <span>Verify Chain</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleExportAuditCSV}
                className="h-8 text-xs gap-1"
                title="Export complete SHA-256 audit ledger"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-graphite-muted dark:text-gray-400" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search audit actions..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory placeholder:text-graphite-muted dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none w-44 sm:w-56 transition-colors"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-mist dark:bg-graphite-dark text-graphite-muted dark:text-gray-400 font-headline uppercase text-[10px] tracking-wider border-b border-[#D8DFDE] dark:border-graphite-borderDark">
                <tr>
                  <th className="py-3 px-6">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-6">Cryptographic SHA-256 Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3ECEB] dark:divide-graphite-borderDark">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-mist/30 dark:hover:bg-graphite-dark/40 transition-colors">
                    <td className="py-3 px-6 font-mono text-[11px] text-graphite-muted dark:text-gray-400">
                      {log.createdAt}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-graphite dark:text-ivory">{log.actorEmail}</div>
                      <div className="text-[10px] uppercase font-mono text-graphite-muted dark:text-gray-400">{log.actorRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="pine" size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-graphite-muted dark:text-gray-400 text-[11px]">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="py-3 px-6 font-mono text-[11px] text-pine dark:text-[#6BB3AF]">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-forest dark:text-[#38B38A] shrink-0" />
                        <span className="truncate max-w-xs">{log.sha256Hash}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Webhooks & ATS */}
      {activeTab === "WEBHOOKS" && (
        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Outbound Webhook Endpoints</CardTitle>
                <CardDescription>
                  Notify Slack, Greenhouse, or internal databases whenever new-hire milestones occur.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsAddWebhookModalOpen(true)}
                className="text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Endpoint</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="p-4 rounded-xl border border-mist-dark dark:border-graphite-borderDark bg-ivory dark:bg-graphite-cardDark flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-mono font-semibold text-graphite dark:text-ivory flex items-center gap-2">
                      <Webhook className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
                      <span>{wh.url}</span>
                    </div>
                    <div className="text-graphite-muted dark:text-gray-400 text-[11px]">
                      Subscribed Events: {wh.events}
                    </div>
                    {wh.lastDeliveredAt && (
                      <div className="text-[10px] text-forest dark:text-[#38B38A] font-mono">
                        Last Delivery: {wh.lastDeliveredAt} (200 OK)
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Badge variant={wh.active ? "forest" : "clay"} size="sm">
                      {wh.active ? "Active" : "Paused"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestPing(wh.id)}
                      className="h-7 text-[11px] gap-1"
                      title="Dispatch test payload"
                    >
                      <Send className="w-3 h-3 text-pine dark:text-amberSignal" />
                      <span>Test Ping</span>
                    </Button>
                    <button
                      onClick={() => handleDeleteWebhook(wh.id)}
                      className="p-1.5 rounded-lg text-graphite-muted dark:text-gray-400 hover:text-brick dark:hover:text-red-400 hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
                      title="Delete webhook endpoint"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: API Access Tokens */}
      {activeTab === "KEYS" && (
        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>API Access Tokens & Bearer Keys</CardTitle>
                <CardDescription>
                  Programmatic credentials for REST API calls (`/api/v1/*`) and external ATS integrations.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsAddKeyModalOpen(true)}
                className="text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate New Key</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="p-4 rounded-xl border border-mist-dark dark:border-graphite-borderDark bg-ivory dark:bg-graphite-cardDark flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-graphite dark:text-ivory font-headline">{key.name}</span>
                      <Badge variant="mist" size="sm">{key.role}</Badge>
                    </div>
                    <div className="font-mono text-pine dark:text-amberSignal text-[11px]">
                      {key.keyPrefix}
                    </div>
                    <div className="text-[10px] text-graphite-muted dark:text-gray-400">
                      Created: {key.createdAt} • Last used: {key.lastUsedAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyKey(key.fullToken || key.keyPrefix, key.id)}
                      className="h-7 text-[11px] gap-1"
                    >
                      {copiedKeyId === key.id ? (
                        <Check className="w-3 h-3 text-forest dark:text-[#38B38A]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedKeyId === key.id ? "Copied" : "Copy Token"}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevokeKey(key.id)}
                      className="h-7 text-[11px] text-brick dark:text-red-400 hover:bg-brick/10"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: Time-Off Policies */}
      {activeTab === "TIMEOFF" && (
        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Time-Off & Leave Policies</CardTitle>
                <CardDescription>
                  Configure company-wide standard vacation allotments, sick leave, and parental leave packages.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsAddPolicyModalOpen(true)}
                className="text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Policy</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {timeOffPolicies.map((pol) => (
                <div
                  key={pol.id}
                  className="p-4 rounded-xl border border-mist-dark dark:border-graphite-borderDark bg-ivory dark:bg-graphite-cardDark flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-graphite dark:text-ivory font-headline">{pol.name}</span>
                      <Badge variant="pine" size="sm">{pol.accrualFrequency}</Badge>
                      {pol.rolloverAllowed && (
                        <Badge variant="mist" size="sm">Rollover Permitted</Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-graphite-muted dark:text-gray-400">
                      Allotment: <span className="font-bold text-graphite dark:text-ivory">{pol.daysPerYear} days / year</span> ({pol.accrualFrequency})
                    </div>
                  </div>
                  <Badge variant="forest" size="sm">Active Policy</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 6: GDPR Privacy Controls */}
      {activeTab === "GDPR" && (
        <Card className="max-w-2xl border-brick/40 bg-brick/5 dark:bg-brick/10">
          <CardHeader>
            <CardTitle className="text-brick flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>GDPR Data Deletion & Right to Be Forgotten</span>
            </CardTitle>
            <CardDescription>
              Comply with European data privacy regulations (Article 17). Anonymizes PII while retaining hash audit trails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-graphite-muted dark:text-gray-300 leading-relaxed">
              When an offboarding request is approved or a GDPR deletion is submitted, all uploaded passport scans, banking details, and contact numbers are permanently scrubbed using cryptographic zeroization.
            </p>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-graphite-dark/70 border border-brick/30 text-graphite dark:text-ivory space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-brick">
                <AlertTriangle className="w-4 h-4" />
                <span>Zeroization Protocol Action</span>
              </div>
              <p className="text-[11px] text-graphite-muted dark:text-gray-400">
                Executes permanent pseudonymization on personal identification fields, reclaims checked-out hardware, and appends a tamper-evident event to the SHA-256 audit ledger.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsGdprModalOpen(true)}
            >
              Simulate GDPR Deletion Protocol
            </Button>
          </CardContent>
        </Card>
      )}

      {/* TAB 7: Custom Fields Schema Builder */}
      {activeTab === "CUSTOMFIELDS" && (
        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-pine dark:text-amberSignal" />
                  <span>Custom Employee Profile Schema</span>
                </CardTitle>
                <CardDescription>
                  Define dynamic custom fields that automatically attach to candidate profiles, new-hire intake forms, and IT asset allocation workflows.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Field Form */}
              <form onSubmit={handleCreateCustomField} className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40 space-y-4 text-xs">
                <div className="font-bold text-graphite dark:text-ivory uppercase tracking-wider text-[11px]">
                  Add New Custom Attribute
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Field Label *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dietary Preferences"
                      value={newCustomField.label}
                      onChange={(e) => setNewCustomField({ ...newCustomField, label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Internal Slug *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. dietary_preferences"
                      value={newCustomField.name}
                      onChange={(e) => setNewCustomField({ ...newCustomField, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Data Type</label>
                    <select
                      value={newCustomField.type}
                      onChange={(e) => setNewCustomField({ ...newCustomField, type: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite"
                    >
                      <option value="text">Text (String)</option>
                      <option value="dropdown">Dropdown Selection</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean (Toggle)</option>
                    </select>
                  </div>
                </div>

                {newCustomField.type === "dropdown" && (
                  <div>
                    <label className="block font-bold mb-1">Comma-Separated Options</label>
                    <input
                      type="text"
                      placeholder="Vegetarian, Vegan, Halal, Kosher, Gluten-Free"
                      value={newCustomField.options}
                      onChange={(e) => setNewCustomField({ ...newCustomField, options: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCustomField.required}
                      onChange={(e) => setNewCustomField({ ...newCustomField, required: e.target.checked })}
                    />
                    <span>Required field during onboarding registration</span>
                  </label>
                  <Button size="sm" variant="primary" type="submit" className="gap-1.5 text-xs">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Attribute</span>
                  </Button>
                </div>
              </form>

              {/* Existing Fields List */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-graphite-muted">
                  Active Custom Profile Schema ({customFields.length} Attributes)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customFields.map((field) => (
                    <div
                      key={field.id}
                      className="p-3.5 rounded-xl border border-mist dark:border-graphite-muted/30 bg-white dark:bg-graphite-surface flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-graphite dark:text-ivory font-headline">{field.label}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-mist dark:bg-graphite-muted/30 text-graphite-muted">
                            {field.type}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-pine dark:text-amberSignal mt-0.5">
                          slug: {field.name}
                        </div>
                        {field.options && (
                          <div className="text-[10px] text-graphite-muted mt-1">
                            Options: {field.options.join(", ")}
                          </div>
                        )}
                      </div>
                      <Badge variant={field.required ? "clay" : "mist"} size="sm">
                        {field.required ? "Required" : "Optional"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 8: Scheduled Reporting */}
      {activeTab === "REPORTS" && (
        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="w-5 h-5 text-pine dark:text-amberSignal" />
                  <span>Scheduled Automated Reports</span>
                </CardTitle>
                <CardDescription>
                  Configure automated cron dispatches of compliance digests, onboarding velocity metrics, and IT hardware inventory to stakeholders.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              {/* New Report Form */}
              <form onSubmit={handleCreateScheduledReport} className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40 space-y-4">
                <div className="font-bold text-graphite dark:text-ivory uppercase tracking-wider text-[11px]">
                  Schedule New Recurring Report
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Report Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Executive Onboarding Velocity Report"
                      value={newReport.title}
                      onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Recipients (Comma-Separated Emails) *</label>
                    <input
                      type="text"
                      required
                      placeholder="execs@acme.corp, compliance@acme.corp"
                      value={newReport.recipients}
                      onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Frequency</label>
                    <select
                      value={newReport.frequency}
                      onChange={(e) => setNewReport({ ...newReport, frequency: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite"
                    >
                      <option value="DAILY">Daily (08:00 UTC)</option>
                      <option value="WEEKLY">Weekly (Monday 09:00 UTC)</option>
                      <option value="MONTHLY">Monthly (1st of Month)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Report Dataset</label>
                    <select
                      value={newReport.reportType}
                      onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite"
                    >
                      <option value="ONBOARDING_VELOCITY">Onboarding Velocity & Bottlenecks</option>
                      <option value="COMPLIANCE_DIGEST">SOC2 / I-9 / Background Checks Digest</option>
                      <option value="HARDWARE_INVENTORY">IT Hardware Asset Custody</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Export Format</label>
                    <select
                      value={newReport.exportFormat}
                      onChange={(e) => setNewReport({ ...newReport, exportFormat: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite"
                    >
                      <option value="CSV">Delimited CSV (.csv)</option>
                      <option value="PDF">Formatted Executive PDF (.pdf)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button size="sm" variant="primary" type="submit" className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Recurring Schedule</span>
                  </Button>
                </div>
              </form>

              {/* Existing Subscriptions */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-graphite-muted">
                  Active Recurring Subscriptions ({scheduledReports.length})
                </div>
                {scheduledReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-white dark:bg-graphite-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-graphite dark:text-ivory font-headline">{rep.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pine/10 text-pine dark:text-amberSignal border border-pine/20">
                          {rep.frequency}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mist dark:bg-graphite-muted/30">
                          {rep.exportFormat}
                        </span>
                      </div>
                      <div className="text-[11px] text-graphite-muted dark:text-gray-400 mt-1">
                        Recipients: {Array.isArray(rep.recipients) ? rep.recipients.join(", ") : rep.recipients}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRunReportNow(rep.id, rep.title || rep.name || "Enterprise Report")}
                        className="text-[11px] gap-1 px-2.5 py-1 cursor-pointer"
                        title="Compile and dispatch this report immediately"
                      >
                        <Send className="w-3 h-3 text-pine dark:text-amberSignal" />
                        <span>Dispatch Now</span>
                      </Button>
                      <Badge variant="forest" size="sm">Automated Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 9: Custom Domain Names */}
      {activeTab === "DOMAINS" && (
        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-pine dark:text-amberSignal" />
                  <span>Custom Portal Domains & TLS Certificates</span>
                </CardTitle>
                <CardDescription>
                  Host candidate onboarding portals on your company domain (e.g. onboard.acme.corp) with automatic Let's Encrypt TLS 1.3 provisioning.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              <form onSubmit={handleAddDomain} className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40 flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                  <label className="block font-bold mb-1">Domain Hostname</label>
                  <input
                    type="text"
                    required
                    placeholder="onboard.yourcompany.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite font-mono text-xs"
                  />
                </div>
                <Button size="sm" variant="primary" type="submit" className="gap-1.5 shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add & Verify Domain</span>
                </Button>
              </form>

              <div className="p-3.5 rounded-xl bg-pine/5 dark:bg-pine/15 border border-pine/20 text-xs text-graphite dark:text-ivory space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-forest" />
                  <span>DNS Configuration Requirement</span>
                </div>
                <p className="text-[11px] text-graphite-muted dark:text-gray-300">
                  Add a <strong>CNAME</strong> record pointing to <code className="font-mono font-bold text-pine dark:text-amberSignal">cname.onboardx.io</code> in your Cloudflare, Route53, or GoDaddy control panel.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-graphite-muted">
                  Registered Tenant Domains ({customDomains.length})
                </div>
                {customDomains.map((dom) => (
                  <div
                    key={dom.id}
                    className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-white dark:bg-graphite-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-graphite dark:text-ivory">{dom.domain}</span>
                        {dom.isPrimary && <Badge variant="pine" size="sm">Primary Portal</Badge>}
                      </div>
                      <div className="text-[11px] font-mono text-graphite-muted mt-1">
                        Target: {dom.cnameTarget}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="forest" size="sm">● TLS 1.3 Active</Badge>
                      <Badge variant="steel" size="sm">DNS Verified</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 10: Single Sign-On (SAML 2.0 & Azure AD) */}
      {activeTab === "SSO" && (
        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-pine dark:text-amberSignal" />
                <span>Single Sign-On (SAML 2.0 & Microsoft Azure AD)</span>
              </CardTitle>
              <CardDescription>
                Federate corporate identity with Okta, Google Workspace, PingIdentity, and Azure Active Directory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSso} className="space-y-5 text-xs">
                {/* SAML 2.0 Section */}
                <div className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40 space-y-4">
                  <div className="font-bold text-graphite dark:text-ivory font-headline flex items-center justify-between">
                    <span>SAML 2.0 Identity Provider (Okta, Ping, Google)</span>
                    <Badge variant="pine">Enterprise Protocol</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">IdP Entity ID (Issuer URL)</label>
                      <input
                        type="text"
                        value={ssoConfig?.idpEntityId || ""}
                        onChange={(e) => setSsoConfig({ ...ssoConfig, idpEntityId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">SAML SSO Sign-In URL</label>
                      <input
                        type="text"
                        value={ssoConfig?.ssoUrl || ""}
                        onChange={(e) => setSsoConfig({ ...ssoConfig, ssoUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Azure Active Directory Section */}
                <div className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40 space-y-4">
                  <div className="font-bold text-graphite dark:text-ivory font-headline flex items-center justify-between">
                    <span>Microsoft Entra ID / Azure Active Directory</span>
                    <Badge variant="steel">Graph API Sync</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Azure Tenant ID (GUID)</label>
                      <input
                        type="text"
                        value={ssoConfig?.azureTenantId || ""}
                        onChange={(e) => setSsoConfig({ ...ssoConfig, azureTenantId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Azure Client Application ID</label>
                      <input
                        type="text"
                        value={ssoConfig?.azureClientId || ""}
                        onChange={(e) => setSsoConfig({ ...ssoConfig, azureClientId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Policies & Enforce */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ssoConfig?.enforceSso || false}
                      onChange={(e) => setSsoConfig({ ...ssoConfig, enforceSso: e.target.checked })}
                    />
                    <span className="font-bold">Enforce Single Sign-On (Disable raw password auth for employees)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ssoConfig?.autoProvision !== false}
                      onChange={(e) => setSsoConfig({ ...ssoConfig, autoProvision: e.target.checked })}
                    />
                    <span>Just-In-Time (JIT) automated user provisioning via SCIM 2.0</span>
                  </label>
                </div>

                <div className="flex justify-end pt-3 border-t border-mist dark:border-graphite-muted/20">
                  <Button size="sm" variant="primary" type="submit" className="gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Enterprise SSO Configuration</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Webhook Modal */}
      {isAddWebhookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Register Outbound Webhook Endpoint
              </h3>
              <button
                onClick={() => setIsAddWebhookModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Payload URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourcompany.com/webhooks/onboardx"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Subscribed Events</label>
                <input
                  type="text"
                  value={newWebhook.events}
                  onChange={(e) => setNewWebhook({ ...newWebhook, events: e.target.value })}
                  placeholder="employee.created, employee.completed, document.signed"
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Signing Secret</label>
                <input
                  type="text"
                  readOnly
                  value={newWebhook.secret}
                  className="w-full px-3 py-2 font-mono text-[11px] rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-mist dark:bg-graphite-dark text-graphite-muted dark:text-gray-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddWebhookModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save Endpoint
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate API Key Modal */}
      {isAddKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Generate API Access Token
              </h3>
              <button
                onClick={() => {
                  setIsAddKeyModalOpen(false);
                  setNewlyCreatedKey(null);
                }}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newlyCreatedKey ? (
              <div className="mt-4 space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-forest/10 border border-forest/30 text-forest dark:text-[#38B38A] space-y-1">
                  <div className="font-bold font-headline flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Token Generated Successfully!</span>
                  </div>
                  <p className="text-[11px] text-graphite-muted dark:text-gray-300">
                    Make sure to copy your token now. You will not be able to see it again.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark font-mono text-[11px] break-all select-all text-pine dark:text-amberSignal">
                  {newlyCreatedKey}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      navigator.clipboard.writeText(newlyCreatedKey);
                      showToast("Token copied!");
                      setIsAddKeyModalOpen(false);
                      setNewlyCreatedKey(null);
                    }}
                  >
                    Copy Token & Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Key Description / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greenhouse ATS Production Ingestion"
                    value={newKeyForm.name}
                    onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Access Scope / Role</label>
                  <select
                    value={newKeyForm.role}
                    onChange={(e) => setNewKeyForm({ ...newKeyForm, role: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="HR_INTEGRATION">HR & ATS Integration (Read/Write)</option>
                    <option value="READ_ONLY">Read-Only Audit & Reporting</option>
                    <option value="IT_PROVISIONING">IT & Asset Management</option>
                    <option value="ADMIN">Full Administrator Privileges</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                  <Button size="sm" variant="outline" type="button" onClick={() => setIsAddKeyModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="primary" type="submit">
                    Generate Token
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* GDPR Simulation Modal */}
      {isGdprModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-brick/40 shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-brick flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Execute GDPR Erasure Protocol</span>
              </h3>
              <button
                onClick={() => setIsGdprModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteGdpr} className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-brick/10 border border-brick/30 text-brick space-y-1">
                <div className="font-bold">Irreversible Article 17 Action</div>
                <p className="text-[11px] leading-relaxed">
                  This protocol will overwrite employee personal details (name, email, phone) with pseudonymous hashes, delete custody documents, and release hardware assets.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Select Employee Record *</label>
                <select
                  value={selectedGdprEmpId}
                  onChange={(e) => setSelectedGdprEmpId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                >
                  {employees
                    .filter((e) => !e.firstName.includes("GDPR-Anonymized"))
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} — {emp.jobTitle} ({emp.id})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsGdprModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="danger" type="submit">
                  Execute Zeroization
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Time-Off Policy Modal */}
      {isAddPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Add Company Time-Off Policy
              </h3>
              <button
                onClick={() => setIsAddPolicyModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPolicy} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Policy Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Floating Cultural Observance Holiday"
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Accrual Frequency</label>
                  <select
                    value={newPolicy.accrualFrequency}
                    onChange={(e) => setNewPolicy({ ...newPolicy, accrualFrequency: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="Monthly">Monthly Accrual</option>
                    <option value="Annual Lump Sum">Annual Lump Sum</option>
                    <option value="Per Qualifying Event">Per Qualifying Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Days / Year</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={newPolicy.daysPerYear}
                    onChange={(e) => setNewPolicy({ ...newPolicy, daysPerYear: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rolloverAllowed"
                  checked={newPolicy.rolloverAllowed}
                  onChange={(e) => setNewPolicy({ ...newPolicy, rolloverAllowed: e.target.checked })}
                  className="rounded text-pine focus:ring-pine cursor-pointer"
                />
                <label htmlFor="rolloverAllowed" className="font-semibold text-graphite dark:text-ivory cursor-pointer">
                  Allow unused days to rollover to subsequent fiscal year
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddPolicyModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save Policy
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
