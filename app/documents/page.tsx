"use client";

import React, { useState, useEffect } from "react";
import type { DocumentItem, EmployeeData, DocumentTemplateItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignaturePad } from "@/components/ui/signature-pad";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Search,
  Eye,
  X,
  FileCheck,
  FileCode,
  Upload,
  UserCheck,
} from "lucide-react";
import { addNotification } from "@/lib/notifications";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplateItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [assigningTemplate, setAssigningTemplate] = useState<{ id: string; title: string } | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchVaultData = async () => {
    try {
      const [docsRes, tplsRes, empsRes] = await Promise.all([
        fetch("/api/v1/documents", { cache: "no-store" }),
        fetch("/api/v1/documents/template", { cache: "no-store" }),
        fetch("/api/v1/employees", { cache: "no-store" }),
      ]);
      if (docsRes.ok) {
        const json = await docsRes.json();
        if (json.data) setDocuments(json.data);
      }
      if (tplsRes.ok) {
        const json = await tplsRes.json();
        if (json.data) setTemplates(json.data);
      }
      if (empsRes.ok) {
        const json = await empsRes.json();
        if (json.data) setEmployees(json.data);
      }
    } catch (err) {
      console.error("Failed to load documents vault data from server:", err);
    }
  };

  useEffect(() => {
    fetchVaultData();
    const unsubscribe = subscribeToDataChanges(() => {
      fetchVaultData();
    });
    return unsubscribe;
  }, []);

  const handleOpenAssignTemplateModal = (tpl: { id: string; title: string }) => {
    const assignedIds = new Set(
      documents
        .filter((d) => d.title.toLowerCase().trim() === tpl.title.toLowerCase().trim())
        .map((d) => d.employeeId)
    );
    const unassigned = employees.filter((e) => !assignedIds.has(e.id));
    setSelectedAssigneeId(unassigned[0]?.id || employees[0]?.id || "");
    setAssigningTemplate(tpl);
  };

  // New Template Form State
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    category: "Legal & IP",
    version: "v1.0",
    content: "Standard enterprise terms and compliance clauses apply.",
  });

  // Upload Document Form State
  const [newDoc, setNewDoc] = useState({
    title: "",
    fileType: "PDF",
    fileSize: "1.2 MB",
    employeeId: employees[0]?.id || "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSignatureSuccess = async (hash: string) => {
    if (!selectedDoc) return;
    try {
      await fetch(`/api/v1/documents/${selectedDoc.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerEmail: "kaelen.chen@acme-enterprises.com",
          cryptoSignatureHash: hash,
        }),
      });
      await fetchVaultData();
      notifyDataChanged("document", { docId: selectedDoc.id, status: "SIGNED" });
    } catch (err) {
      console.error("Failed to sign document via API:", err);
      showToast("Unable to submit signature to server. Please try again.");
    }

    setIsSignModalOpen(false);
    addNotification(
      "Document Signed & Sealed",
      `"${selectedDoc.title}" cryptographically signed with SHA-256 seal: ${hash.substring(0, 16)}...`,
      "document",
      "/documents"
    );
    showToast("Cryptographically stamped signature appended to document vault.");
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.title) return;

    try {
      await fetch("/api/v1/documents/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      });
      await fetchVaultData();
      notifyDataChanged("document", { action: "create_template", title: newTemplate.title });
    } catch (err) {
      console.error("Failed to create template via API:", err);
      showToast("Failed to create template on server.");
    }

    setIsAddTemplateModalOpen(false);
    const createdTitle = newTemplate.title;
    setNewTemplate({
      title: "",
      category: "Legal & IP",
      version: "v1.0",
      content: "Standard enterprise terms and compliance clauses apply.",
    });
    showToast(`Created new contract template: "${createdTitle}"`);
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title) return;

    const targetEmpId = newDoc.employeeId || employees[0]?.id || "emp_kaelen_01";
    const emp = employees.find((e) => e.id === targetEmpId);

    try {
      await fetch("/api/v1/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDoc.title,
          fileType: newDoc.fileType,
          fileSize: newDoc.fileSize,
          employeeId: targetEmpId,
          status: "APPROVED",
        }),
      });
      await fetchVaultData();
      notifyDataChanged("document", { action: "upload_document", employeeId: targetEmpId, title: newDoc.title });
    } catch (err) {
      console.error("Failed to upload document via API:", err);
      showToast("Failed to upload compliance document to server.");
    }

    setIsUploadDocModalOpen(false);
    const uploadedTitle = newDoc.title;
    setNewDoc({
      title: "",
      fileType: "PDF",
      fileSize: "1.2 MB",
      employeeId: employees[0]?.id || "",
    });
    addNotification(
      "Compliance Document Uploaded",
      `Uploaded "${uploadedTitle}" for ${emp?.firstName || "employee"}.`,
      "document",
      "/documents"
    );
    showToast(`Uploaded compliance document "${uploadedTitle}" for ${emp?.firstName || "employee"}.`);
  };

  const handleAssignTemplateToWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTemplate) return;

    const assignedCandidateIds = new Set(
      documents
        .filter((d) => d.title.toLowerCase().trim() === assigningTemplate.title.toLowerCase().trim())
        .map((d) => d.employeeId)
    );
    const availableCandidates = employees.filter((e) => !assignedCandidateIds.has(e.id));
    const targetAssigneeId = availableCandidates.some((c) => c.id === selectedAssigneeId)
      ? selectedAssigneeId
      : availableCandidates[0]?.id || employees[0]?.id;

    if (!targetAssigneeId) return;
    const emp = employees.find((e) => e.id === targetAssigneeId);

    try {
      await fetch("/api/v1/documents/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateTitle: assigningTemplate.title,
          employeeId: targetAssigneeId,
        }),
      });
      await fetchVaultData();
      notifyDataChanged("document", { action: "assign_document", employeeId: targetAssigneeId, templateTitle: assigningTemplate.title });
    } catch (err) {
      console.error("Failed to assign document via API:", err);
      showToast("Failed to assign template on server.");
    }

    addNotification(
      "Contract Template Assigned",
      `Assigned "${assigningTemplate.title}" to ${emp?.firstName} ${emp?.lastName} for legal execution.`,
      "document",
      "/documents"
    );

    const assignedTitle = assigningTemplate.title;
    setAssigningTemplate(null);
    showToast(`Assigned template "${assignedTitle}" to ${emp?.firstName || "employee"}.`);
  };

  const handleDownloadDocument = (doc: DocumentItem) => {
    const certificateText = `
================================================================================
                    ACME ENTERPRISES - COMPLIANCE VAULT
                    DIGITAL ATTESTATION & SIGNATURE CERTIFICATE
================================================================================

DOCUMENT TITLE:     ${doc.title}
DOCUMENT ID:        ${doc.id}
FILE FORMAT:        ${doc.fileType} (${doc.fileSize})
SIGNATURE STATUS:   ${doc.isSigned ? "EXECUTED & VERIFIED" : "PENDING EXECUTION"}
${doc.signedAt ? `TIMESTAMP (UTC):   ${doc.signedAt}\n` : ""}
${doc.cryptoSignatureHash ? `SHA-256 DIGEST:   ${doc.cryptoSignatureHash}\n` : ""}

ATTESTATION CLAUSE:
This digital document certificate has been generated and validated by the OnboardX
Enterprise Operating System. Any tampering or retroactive modification invalidates
the cryptographic seal.

ISSUED BY:
Acme Technologies Global People Operations & Legal Compliance Architecture.
================================================================================
    `.trim();

    const blob = new Blob([certificateText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${doc.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_certificate.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded verified certificate for "${doc.title}".`);
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleGuard
      allowedRoles={["ADMIN", "HR_MANAGER"]}
      moduleName="Document Vault & Templates"
      description="Contract template custody, legal assignments, and compliance vault management are restricted to HR Managers and Administrators."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-pine dark:bg-[#32615E] text-ivory px-4 py-3 shadow-elevation flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-forest dark:text-[#38B38A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-graphite dark:text-ivory tracking-tight">
            Enterprise Document Vault & Digital Signatures
          </h1>
          <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1">
            Centralized document custody, automated compliance forms, and SHA-256 cryptographic audit trails.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsUploadDocModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
            <span>Upload Document</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsAddTemplateModalOpen(true)}
            className="text-xs gap-1.5 shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Contract Template</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Templates Library (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-graphite-muted dark:text-gray-400 font-headline">
              Standard Contract Templates
            </div>
            <Badge variant="mist" size="sm">
              {templates.length} Active
            </Badge>
          </div>

          <div className="space-y-3">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="p-4 hover:border-pine/30 dark:hover:border-pine transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-pine/10 dark:bg-pine/30 text-pine dark:text-ivory">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs font-headline text-graphite dark:text-ivory">
                        {tpl.title}
                      </h4>
                      <div className="text-[11px] text-graphite-muted dark:text-gray-400 mt-0.5">
                        {tpl.category} • {tpl.version}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-mist-dark dark:border-graphite-borderDark flex items-center justify-between text-[10px] text-graphite-muted dark:text-gray-400">
                  <span>Updated: {tpl.updatedAt}</span>
                  {(() => {
                    const assignedCandidateIds = new Set(
                      documents
                        .filter((d) => d.title.toLowerCase().trim() === tpl.title.toLowerCase().trim())
                        .map((d) => d.employeeId)
                    );
                    const assignedCount = assignedCandidateIds.size;
                    const isAllAssigned = assignedCount >= employees.length;

                    if (isAllAssigned) {
                      return (
                        <span className="font-semibold text-forest dark:text-[#38B38A] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>All Assigned ({assignedCount})</span>
                        </span>
                      );
                    }

                    return (
                      <button
                        onClick={() => handleOpenAssignTemplateModal({ id: tpl.id, title: tpl.title })}
                        className="font-semibold text-pine dark:text-amberSignal hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Assign to Hire</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pine/10 dark:bg-pine/30 text-pine dark:text-amberSignal">
                          {employees.length - assignedCount} left
                        </span>
                      </button>
                    );
                  })()}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Signed Documents & Uploaded Vault (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle>Vault Artifacts & Executed Agreements</CardTitle>
                <CardDescription>
                  Verified employee submissions with immutable cryptographic integrity signatures.
                </CardDescription>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-graphite-muted dark:text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter documents..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory placeholder:text-graphite-muted dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors w-48 sm:w-60"
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark hover:border-pine/30 dark:hover:border-pine transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-pine/10 dark:bg-pine/30 text-pine dark:text-ivory mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-graphite dark:text-ivory font-headline">
                          {doc.title}
                        </span>
                        <Badge variant={doc.status === "APPROVED" ? "forest" : "clay"} size="sm">
                          {doc.status}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-graphite-muted dark:text-gray-400">
                        Format: {doc.fileType} • Size: {doc.fileSize}
                      </div>
                      {doc.cryptoSignatureHash ? (
                        <div className="text-[10px] font-mono text-pine dark:text-[#6BB3AF] flex items-center gap-1.5 pt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-forest dark:text-[#38B38A]" />
                          <span>SHA-256 Digest: {doc.cryptoSignatureHash.substring(0, 32)}...</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-graphite-muted dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-clayGold dark:text-amberSignal" />
                          <span>Pending digital signature from candidate</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewDoc(doc)}
                      className="h-8 text-xs gap-1"
                      title="Inspect document metadata and signature hash"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Button>

                    {!doc.isSigned && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setIsSignModalOpen(true);
                        }}
                        className="h-8 text-xs"
                      >
                        Sign
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadDocument(doc)}
                      className="h-8 text-xs gap-1"
                      title="Download cryptographic certificate"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Signature Pad Modal */}
      {isSignModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                Sign: {selectedDoc.title}
              </h3>
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <SignaturePad
                documentTitle={selectedDoc.title}
                signerName="Kaelen Chen"
                signerEmail="kaelen.chen@acme-enterprises.com"
                onSignComplete={handleSignatureSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <div>
                <h3 className="font-bold font-headline text-sm text-graphite dark:text-ivory">
                  {previewDoc.title}
                </h3>
                <span className="text-[11px] text-graphite-muted dark:text-gray-400">
                  Vault ID: {previewDoc.id}
                </span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark flex items-center justify-between">
                <div>
                  <span className="text-graphite-muted dark:text-gray-400 text-[10px] uppercase font-semibold">Execution Status</span>
                  <div className="font-bold text-graphite dark:text-ivory mt-0.5">{previewDoc.status}</div>
                </div>
                <Badge variant={previewDoc.isSigned ? "forest" : "clay"}>
                  {previewDoc.isSigned ? "Cryptographically Signed" : "Pending Signature"}
                </Badge>
              </div>

              {previewDoc.cryptoSignatureHash && (
                <div className="p-3 rounded-xl bg-forest/5 dark:bg-forest/10 border border-forest/20 text-forest dark:text-[#38B38A] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold font-headline">
                    <ShieldCheck className="w-4 h-4" />
                    <span>SHA-256 Tamper-Evident Hash</span>
                  </div>
                  <div className="font-mono text-[10px] break-all">
                    {previewDoc.cryptoSignatureHash}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark text-graphite dark:text-gray-300 leading-relaxed text-xs">
                <p className="font-semibold text-graphite dark:text-ivory mb-1">Agreement Terms Summary:</p>
                This standard enterprise legal instrument binds the signatory to Acme Technologies confidentiality protocols, intellectual property custody, and security guidelines. All digital signatures conform to ESIGN and eIDAS compliance standards.
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
              <Button size="sm" variant="outline" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
              <Button size="sm" variant="primary" onClick={() => handleDownloadDocument(previewDoc)}>
                Download Attestation Certificate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Contract Template Modal */}
      {isAddTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Create Contract Template
              </h3>
              <button
                onClick={() => setIsAddTemplateModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Template Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote Work Intellectual Property Rider"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Category</label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="Legal & IP">Legal & IP</option>
                    <option value="Legal & Compliance">Legal & Compliance</option>
                    <option value="IT & HR">IT & HR</option>
                    <option value="People Operations">People Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Version</label>
                  <input
                    type="text"
                    placeholder="v1.0"
                    value={newTemplate.version}
                    onChange={(e) => setNewTemplate({ ...newTemplate, version: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Template Clauses & Description</label>
                <textarea
                  rows={3}
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddTemplateModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save Template
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Upload Compliance Document
              </h3>
              <button
                onClick={() => setIsUploadDocModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Form I-9 Employment Eligibility Verification"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Assign to Employee *</label>
                <select
                  value={newDoc.employeeId}
                  onChange={(e) => setNewDoc({ ...newDoc, employeeId: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Format</label>
                  <select
                    value={newDoc.fileType}
                    onChange={(e) => setNewDoc({ ...newDoc, fileType: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word DOCX</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">File Size</label>
                  <input
                    type="text"
                    value={newDoc.fileSize}
                    onChange={(e) => setNewDoc({ ...newDoc, fileSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsUploadDocModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Upload to Vault
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Template to Hire Modal */}
      {assigningTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Assign Template to Employee
              </h3>
              <button
                onClick={() => setAssigningTemplate(null)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTemplateToWorkflow} className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark">
                <span className="text-[10px] text-graphite-muted dark:text-gray-400 uppercase font-semibold">Selected Template</span>
                <div className="font-bold text-graphite dark:text-ivory mt-0.5">{assigningTemplate.title}</div>
              </div>

              {(() => {
                const assignedCandidateIds = documents
                  .filter((d) => d.title.toLowerCase().trim() === assigningTemplate.title.toLowerCase().trim())
                  .map((d) => d.employeeId);
                const availableCandidates = employees.filter((e) => !assignedCandidateIds.includes(e.id));

                if (availableCandidates.length === 0) {
                  return (
                    <div className="p-3.5 rounded-xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-[#38B38A] border border-forest/20 text-xs font-medium text-center space-y-1">
                      <div className="font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>All Active Hires Assigned</span>
                      </div>
                      <p className="text-[11px] opacity-80">
                        Every employee on record ({employees.length}) has already received and is tracking this contract template.
                      </p>
                    </div>
                  );
                }

                return (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-graphite dark:text-ivory">Select Candidate *</label>
                      <span className="text-[10px] text-graphite-muted dark:text-gray-400 font-mono">
                        {availableCandidates.length} eligible hire{availableCandidates.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <select
                      value={selectedAssigneeId}
                      onChange={(e) => setSelectedAssigneeId(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                    >
                      {availableCandidates.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} — {emp.jobTitle} ({emp.department})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setAssigningTemplate(null)}>
                  Cancel
                </Button>
                {(() => {
                  const assignedCandidateIds = documents
                    .filter((d) => d.title.toLowerCase().trim() === assigningTemplate.title.toLowerCase().trim())
                    .map((d) => d.employeeId);
                  const availableCandidates = employees.filter((e) => !assignedCandidateIds.includes(e.id));
                  return (
                    <Button size="sm" variant="primary" type="submit" disabled={availableCandidates.length === 0}>
                      Dispatch & Assign
                    </Button>
                  );
                })()}
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </RoleGuard>
  );
}
