"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notifyDataChanged } from "@/lib/events";
import {
  Lock,
  ShieldCheck,
  Send,
  Search,
  Key,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  EyeOff,
  Building,
} from "lucide-react";

export default function StandaloneWhistleblowerPage() {
  const [activeView, setActiveView] = useState<"SUBMIT" | "TRACK">("SUBMIT");
  const [category, setCategory] = useState<"COMPLIANCE" | "ETHICS" | "FINANCIAL" | "HARASSMENT" | "SAFETY">("COMPLIANCE");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Tracking state
  const [trackToken, setTrackToken] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundReport, setFoundReport] = useState<any | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/compliance/whistleblower", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, details }),
      });
      const json = await res.json();
      if (res.ok && json.trackingToken) {
        setSubmittedToken(json.trackingToken);
        setSubject("");
        setDetails("");
        notifyDataChanged("compliance", { action: "whistleblower_submitted" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackToken.trim()) return;

    setIsSearching(true);
    setTrackError(null);
    setFoundReport(null);

    try {
      const res = await fetch(`/api/v1/compliance/whistleblower?token=${encodeURIComponent(trackToken.trim())}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setFoundReport(json.data);
      } else {
        setTrackError(json.error || "No report found matching this tracking key.");
      }
    } catch (e) {
      setTrackError("Unable to verify token. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-ivory dark:bg-[#121517] text-graphite dark:text-[#F8F6F2] flex flex-col justify-between">
      {/* Main Container */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 sm:py-10 w-full space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-graphite-muted dark:text-gray-400">
          <Link
            href="/compliance"
            className="inline-flex items-center gap-1.5 hover:text-pine dark:hover:text-amberSignal font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Compliance Center</span>
          </Link>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-mist dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark">
            Anonymous Portal
          </span>
        </div>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-[#38B38A] border border-forest/20 text-xs font-semibold">
            <EyeOff className="w-4 h-4" />
            <span>100% ANONYMOUS • ZERO-KNOWLEDGE ENCRYPTED</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-headline tracking-tight text-graphite dark:text-ivory">
            Anonymous Ethics & Whistleblower Box
          </h1>
          <p className="text-xs sm:text-sm text-graphite-muted dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
            Report compliance risks, harassment, accounting irregularities, or safety violations in strict confidence. No cookies, no IP addresses, and no account credentials are recorded.
          </p>
        </div>

        {/* View Switcher: Submit vs Track */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-xl bg-mist dark:bg-graphite-cardDark border border-mist-dark dark:border-graphite-borderDark text-xs font-headline">
            <button
              onClick={() => {
                setActiveView("SUBMIT");
                setSubmittedToken(null);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeView === "SUBMIT"
                  ? "bg-pine text-ivory shadow-subtle"
                  : "text-graphite dark:text-gray-300 hover:text-pine"
              }`}
            >
              Submit Anonymous Report
            </button>
            <button
              onClick={() => setActiveView("TRACK")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeView === "TRACK"
                  ? "bg-pine text-ivory shadow-subtle"
                  : "text-graphite dark:text-gray-300 hover:text-pine"
              }`}
            >
              Track Report with Token
            </button>
          </div>
        </div>

        {/* VIEW 1: SUBMIT REPORT */}
        {activeView === "SUBMIT" && (
          <Card className="p-6 sm:p-8">
            {submittedToken ? (
              <div className="text-center space-y-5 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-2xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-[#38B38A] flex items-center justify-center mx-auto border border-forest/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-headline text-graphite dark:text-ivory">
                    Report Received Securely
                  </h3>
                  <p className="text-xs text-graphite-muted dark:text-gray-400 max-w-md mx-auto">
                    Your report has been logged in the immutable compliance vault. Keep the private cryptographic token below — this is the <span className="font-semibold text-graphite dark:text-ivory">only</span> way to review follow-up messages or investigation findings.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-mist/60 dark:bg-graphite-dark/60 border border-mist-dark dark:border-graphite-borderDark max-w-md mx-auto space-y-2">
                  <span className="text-[11px] font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider block">
                    Your Secret Tracking Key
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-graphite-cardDark p-2.5 rounded-lg border border-graphite-border dark:border-graphite-borderDark">
                    <span className="font-mono text-xs font-bold text-pine dark:text-amberSignal select-all">
                      {submittedToken}
                    </span>
                    <button
                      onClick={() => copyToClipboard(submittedToken)}
                      className="p-1.5 rounded hover:bg-mist dark:hover:bg-graphite-dark text-graphite-muted dark:text-gray-300 transition-colors"
                      title="Copy Key"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-forest" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTrackToken(submittedToken);
                      setActiveView("TRACK");
                    }}
                    className="text-xs"
                  >
                    View Status Now
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSubmittedToken(null)}
                    className="text-xs"
                  >
                    File Another Report
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-graphite dark:text-ivory">
                    Category of Concern
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory font-medium"
                  >
                    <option value="COMPLIANCE">Regulatory & Legal Compliance</option>
                    <option value="ETHICS">Ethics & Conflict of Interest</option>
                    <option value="FINANCIAL">Accounting, Fraud or Financial Irregularities</option>
                    <option value="HARASSMENT">Workplace Discrimination or Harassment</option>
                    <option value="SAFETY">Workplace Health & Physical Security</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-graphite dark:text-ivory">
                    Brief Summary / Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unapproved export of customer data records"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-graphite dark:text-ivory">
                    Detailed Account & Context
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide as much verifiable detail as possible (dates, systems involved, policies breached). Do not include personal identifiable information about yourself if you wish to remain 100% anonymous."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory font-medium leading-relaxed"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-forest/5 dark:bg-forest/15 border border-forest/20 text-[11px] text-graphite dark:text-gray-300 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span>
                    Your connection is encrypted using TLS 1.3. OnboardX strips all client metadata before logging this submission into the compliance registry.
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full gap-2 font-headline"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting Securely..." : "Submit Anonymous Report"}</span>
                </Button>
              </form>
            )}
          </Card>
        )}

        {/* VIEW 2: TRACK REPORT WITH TOKEN */}
        {activeView === "TRACK" && (
          <div className="space-y-6">
            <Card className="p-6">
              <form onSubmit={handleTrack} className="space-y-3 text-xs">
                <label className="block font-semibold text-graphite dark:text-ivory">
                  Enter Your Private Tracking Key
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 text-graphite-muted dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. wbt_a94f8e21bc034d98..."
                      value={trackToken}
                      onChange={(e) => setTrackToken(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 font-mono text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md" disabled={isSearching} className="gap-1.5 shrink-0">
                    <Search className="w-3.5 h-3.5" />
                    <span>{isSearching ? "Checking..." : "Look Up"}</span>
                  </Button>
                </div>
              </form>
            </Card>

            {trackError && (
              <div className="p-4 rounded-xl border border-brick/30 bg-brick/5 dark:bg-brick/10 flex items-center gap-3 text-xs text-brick animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{trackError}</span>
              </div>
            )}

            {foundReport && (
              <Card className="p-6 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-mist-dark dark:border-graphite-borderDark">
                  <div className="flex items-center gap-2">
                    <Badge variant="clay">{foundReport.category}</Badge>
                    <span className="text-[11px] text-graphite-muted dark:text-gray-400">
                      Filed on {new Date(foundReport.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant={foundReport.status === "RESOLVED" ? "forest" : "amber"}>
                    {foundReport.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <h3 className="text-base font-bold font-headline text-graphite dark:text-ivory">
                    {foundReport.subject}
                  </h3>
                  <div className="p-3.5 rounded-xl bg-mist/40 dark:bg-graphite-dark/40 border border-mist-dark dark:border-graphite-borderDark text-graphite-muted dark:text-gray-300 leading-relaxed">
                    {foundReport.details}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-forest/5 dark:bg-forest/15 border border-forest/20 text-xs space-y-1.5">
                  <span className="font-semibold text-forest dark:text-[#38B38A] block">
                    Compliance Officer Investigation Status:
                  </span>
                  <p className="text-graphite dark:text-gray-200">
                    {foundReport.resolutionNotes ||
                      "Your report has been assigned to the Head of Legal & People Compliance. An internal assessment is currently active under strict confidential protocol."}
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D8DFDE] dark:border-graphite-borderDark py-6 text-center text-xs text-graphite-muted dark:text-gray-400">
        <span>© {new Date().getFullYear()} Acme Technologies Ethics Office • Powered by OnboardX Zero-Knowledge Vault</span>
      </footer>
    </div>
  );
}
