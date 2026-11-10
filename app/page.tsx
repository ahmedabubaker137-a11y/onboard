"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { CurrencySwitcher } from "@/components/dashboard/currency-switcher";
import { formatCurrency } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/types";
import {
  ArrowRight,
  ShieldCheck,
  Laptop,
  CheckCircle2,
  Workflow,
  Sparkles,
  Lock,
  Users,
  Clock,
  FileCheck,
  ChevronRight,
  Layers,
  DollarSign,
  Sliders,
  Calendar,
  Building2,
  Check,
  FileText,
  HelpCircle,
  TrendingUp,
  HardDrive,
  ShieldAlert,
  Key,
  RefreshCw,
  Cpu,
  MapPin,
  Heart,
  Smile,
} from "lucide-react";

export default function LandingPage() {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>("USD");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");
  const [hireVolume, setHireVolume] = useState<number>(6);

  // Fetch initial currency from server
  useEffect(() => {
    fetch("/api/v1/currency", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.currency) setActiveCurrency(data.currency);
      })
      .catch(() => {});
  }, []);

  // ROI Calculator Math
  const hoursSavedPerHire = 18.5; // Average administrative hours saved across HR, IT, and Manager
  const hrHourlyRateUsd = 48; // Conservative blended internal ops rate
  const monthlyAdminHoursSaved = Math.round(hireVolume * hoursSavedPerHire);
  const annualSavingsUsd = Math.round(monthlyAdminHoursSaved * hrHourlyRateUsd * 12);

  // Pricing Math
  const basePerHireUsd = 10;
  const baseGrowthMonthlyUsd = billingCycle === "ANNUAL" ? 79 : 99;

  const sequenceStages = [
    {
      id: 0,
      title: "1. Requisition & Offer",
      tag: "Recruiting & Finance",
      icon: Users,
      summary: "Finance-approved salary bands convert into binding digital offer letters.",
      detailTitle: "Requisition #REQ-ENG-084 • Product Strategy",
      statusBadge: "Offer Accepted",
      metrics: [
        { label: "Role Title", value: "Lead Product Strategist" },
        { label: "Hiring Manager", value: "Elena Rostova" },
        { label: "Compensation Band", value: formatCurrency(160000, activeCurrency) + " / yr" },
        { label: "Background Verification", value: "Checkr: Clear (SSN + Criminal Trace)" },
      ],
      systemAction: "Triggered: IT Hardware Provisioning Queue #HW-89211",
    },
    {
      id: 1,
      title: "2. IT Hardware Dispatch",
      tag: "IT & Systems Security",
      icon: Laptop,
      summary: "Hardware is auto-allocated from live serial inventory the moment the offer is signed.",
      detailTitle: "Hardware Fulfillment • Serial Assigned",
      statusBadge: "Dispatched (UPS Next Day Air)",
      metrics: [
        { label: "Primary Workstation", value: "16-inch MacBook Pro M3 Max (#SN-89211)" },
        { label: "Security Hardware", value: "YubiKey 5C NFC Token (Enrolled)" },
        { label: "Identity & SSO", value: "Google Workspace & Okta MFA Scheduled" },
        { label: "Repository Permissions", value: "GitHub Enterprise @acme/product-core" },
      ],
      systemAction: "Triggered: Legal Document Cryptographic Stamping Engine",
    },
    {
      id: 2,
      title: "3. Cryptographic Signatures",
      tag: "Legal & People Ops",
      icon: FileCheck,
      summary: "In-browser canvas signatures sealed with tamper-evident SHA-256 cryptographic hashes.",
      detailTitle: "W-4 & Proprietary Inventions Agreement",
      statusBadge: "Cryptographically Stamped",
      metrics: [
        { label: "Signatory", value: "Seraphina Chen (Candidate)" },
        { label: "Audit Hash", value: "SHA-256: 8f4a2109...bc77" },
        { label: "Encryption Protocol", value: "AES-256-GCM Envelope Encryption" },
        { label: "Identity Verification", value: "I-9 Form Document ID Verified" },
      ],
      systemAction: "Triggered: Self-Serve Day 1 Employee Experience Activation",
    },
    {
      id: 3,
      title: "4. Day One Portal & Desk",
      tag: "Employee Experience",
      icon: MapPin,
      summary: "A welcoming, self-serve portal with interactive desk maps, benefit plans, and mentors.",
      detailTitle: "Personalized New Hire Portal",
      statusBadge: "Day 1 Momentum Ready",
      metrics: [
        { label: "Assigned Workstation", value: "Desk 204B (Floor 2, Engineering Wing)" },
        { label: "Health & Vision", value: "Anthem Blue Cross PPO (Elected)" },
        { label: "Retirement Benefit", value: "Vanguard 401(k) with 5% Immediate Match" },
        { label: "Onboarding Buddy", value: "Marcus Vance (Senior Staff Engineer)" },
      ],
      systemAction: "Triggered: 30/60/90 Day Automated Pulse Checkpoints",
    },
    {
      id: 4,
      title: "5. 30-Day Cohort Pulse",
      tag: "Retention & Culture",
      icon: TrendingUp,
      summary: "Automated sentiment telemetry surfaces friction before probation reviews.",
      detailTitle: "Cohort Retention & Satisfaction Telemetry",
      statusBadge: "Top 5% SME Benchmark",
      metrics: [
        { label: "30-Day Satisfaction", value: "10 / 10 ('Day one setup was effortless')" },
        { label: "Task Checklist Velocity", value: "100% Completed on Day 6 (Target: Day 7)" },
        { label: "Current SME eNPS", value: "+78 Net Promoter Score" },
        { label: "Manager Check-In", value: "30-Day Milestone Review Scheduled" },
      ],
      systemAction: "Status: Full Enterprise Certification Awarded",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 md:pt-24 md:pb-28 overflow-hidden border-b border-[#D8DFDE] dark:border-graphite-borderDark bg-ivory dark:bg-[#121517]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Architectural Status Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-graphite-cardDark border border-mist-dark dark:border-graphite-borderDark shadow-2xs mb-6">
              <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-graphite dark:text-ivory">
                The Deterministic Onboarding Operating System
              </span>
            </div>

            {/* Editorial Hero Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-headline text-graphite dark:text-ivory tracking-tight leading-[1.12]">
              New hires shouldn’t spend Day One{" "}
              <span className="text-pine dark:text-[#5D9490]">waiting on an IT ticket.</span>
            </h1>

            {/* High-Craft Non-AI Subtitle */}
            <p className="mt-5 text-sm sm:text-base md:text-lg text-graphite-muted dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              From signed offer letter to provisioned workstation in under 48 hours. Hardware
              allocation, cryptographic tax signoffs, and department handoffs run on automated
              triggers — not 14-message Slack threads.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link href="/portal" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2 text-sm shadow-subtle cursor-pointer">
                  <span>Enter New Hire Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm cursor-pointer">
                  <span>Open HR Command Center</span>
                </Button>
              </Link>
              <Link href="/ai" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2 text-sm cursor-pointer">
                  <Sparkles className="w-4 h-4 text-amberSignal" />
                  <span>Smart Vision OCR & Bot</span>
                </Button>
              </Link>
            </div>

            {/* Live Operational Metrics Ribbon */}
            <div className="mt-12 pt-8 border-t border-mist-dark dark:border-graphite-borderDark grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-3.5 rounded-xl bg-white dark:bg-graphite-cardDark border border-mist-dark dark:border-graphite-borderDark shadow-2xs">
                <div className="text-2xl font-bold font-headline text-pine dark:text-[#6BB3AF]">6.2 Days</div>
                <div className="text-[11px] font-medium text-graphite-muted dark:text-gray-400 mt-0.5">Average time-to-productivity</div>
                <div className="text-[10px] font-mono text-forest dark:text-[#38B38A] mt-1">-57% vs manual SME baseline</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-graphite-cardDark border border-mist-dark dark:border-graphite-borderDark shadow-2xs">
                <div className="text-2xl font-bold font-headline text-forest dark:text-[#38B38A]">100%</div>
                <div className="text-[11px] font-medium text-graphite-muted dark:text-gray-400 mt-0.5">Audit-ready compliance</div>
                <div className="text-[10px] font-mono text-forest dark:text-[#38B38A] mt-1">SOC-2 Type II & I-9 verified</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-graphite-cardDark border border-mist-dark dark:border-graphite-borderDark shadow-2xs">
                <div className="text-2xl font-bold font-headline text-amberSignal">SHA-256</div>
                <div className="text-[11px] font-medium text-graphite-muted dark:text-gray-400 mt-0.5">Tamper-evident signing</div>
                <div className="text-[10px] font-mono text-amberSignal mt-1">Immutable audit fingerprint</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-graphite-cardDark border border-mist-dark dark:border-graphite-borderDark shadow-2xs">
                <div className="text-2xl font-bold font-headline text-steelBlue dark:text-[#7FA6BF]">+78</div>
                <div className="text-[11px] font-medium text-graphite-muted dark:text-gray-400 mt-0.5">New-hire eNPS satisfaction</div>
                <div className="text-[10px] font-mono text-steelBlue dark:text-[#7FA6BF] mt-1">Top 5% tech SME percentile</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature: The 5-Stage Deterministic Sequence */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pine/10 dark:bg-pine/30 text-pine dark:text-amberSignal text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              <Workflow className="w-3.5 h-3.5" />
              <span>Interactive Workflow Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-headline text-graphite dark:text-ivory">
              The 5-Stage Onboarding State Machine
            </h2>
            <p className="text-xs sm:text-sm text-graphite-muted dark:text-gray-400 mt-1 max-w-2xl">
              Every department handoff is deterministic. Click through each stage to inspect the actual live data cards, system triggers, and audit proofs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-graphite-muted dark:text-gray-400 font-mono">Inspect Currency:</span>
            <CurrencySwitcher onCurrencyChange={(curr) => setActiveCurrency(curr)} />
          </div>
        </div>

        {/* Stage Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
          {sequenceStages.map((stage) => {
            const isCurrent = activeStage === stage.id;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-white dark:bg-graphite-cardDark border-pine dark:border-amberSignal shadow-subtle ring-1 ring-pine/20 dark:ring-amberSignal/30"
                    : "bg-white/60 dark:bg-[#161B1E] border-mist-dark dark:border-graphite-borderDark hover:border-pine/40 dark:hover:border-pine"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isCurrent ? "text-pine dark:text-amberSignal" : "text-graphite-muted"}`}>
                    {stage.tag}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? "text-pine dark:text-amberSignal" : "text-graphite-muted"}`} />
                </div>
                <div className={`text-xs font-bold font-headline line-clamp-1 ${isCurrent ? "text-graphite dark:text-ivory" : "text-graphite/80 dark:text-gray-300"}`}>
                  {stage.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Live Cockpit */}
        {(() => {
          const current = sequenceStages[activeStage];
          return (
            <div className="rounded-2xl border border-pine/30 dark:border-pine/40 bg-white dark:bg-[#181D20] p-6 sm:p-8 shadow-elevation animate-in fade-in duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-mist-dark dark:border-graphite-borderDark">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-pine/10 dark:bg-pine/30 text-pine dark:text-[#6BB3AF] text-[10px] font-mono font-bold uppercase">
                      Stage {activeStage + 1} of 5
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-forest/10 dark:bg-forest/20 text-forest dark:text-[#38B38A] text-[10px] font-mono font-bold">
                      ● {current.statusBadge}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-headline text-graphite dark:text-ivory mt-2">
                    {current.detailTitle}
                  </h3>
                  <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1 max-w-2xl">
                    {current.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href="/portal">
                    <Button size="sm" variant="primary" className="text-xs gap-1.5 cursor-pointer">
                      <span>Test in Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="text-xs cursor-pointer">
                      <span>View in HR Hub</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Data Grid for Active Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {current.metrics.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-ivory/60 dark:bg-graphite/40 border border-mist-dark dark:border-graphite-borderDark">
                    <div className="text-[10px] font-mono font-bold text-graphite-muted dark:text-gray-400 uppercase tracking-wider">
                      {m.label}
                    </div>
                    <div className="text-xs font-bold font-headline text-graphite dark:text-ivory mt-1.5 break-words">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* System Trigger Bar */}
              <div className="mt-6 pt-4 border-t border-mist-dark dark:border-graphite-borderDark flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-mono text-[11px] text-forest dark:text-[#38B38A]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{current.systemAction}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-graphite-muted dark:text-gray-400 font-mono">
                  <span>Audit Sync: Realtime</span>
                  <span>•</span>
                  <span>State Drift: 0.00ms</span>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* The Operations Gap: Manual Chaos vs The OnboardX Protocol */}
      <section className="py-14 sm:py-20 bg-white dark:bg-[#161B1E] border-y border-[#D8DFDE] dark:border-graphite-borderDark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline text-graphite dark:text-ivory">
              The Operations Gap
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-graphite-muted dark:text-gray-400">
              Why fast-growing companies replace ad-hoc spreadsheets and 14-page email chains with OnboardX.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contrast 1: Hardware */}
            <Card className="border border-mist-dark dark:border-graphite-borderDark p-5">
              <div className="w-8 h-8 rounded-lg bg-brick/10 dark:bg-brick/20 text-brick flex items-center justify-center mb-3">
                <HardDrive className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Workstation Provisioning
              </h3>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-brick/5 dark:bg-brick/10 border border-brick/15">
                  <div className="font-bold text-brick text-[11px] uppercase tracking-wide">Manual SME Default</div>
                  <p className="text-graphite-muted dark:text-gray-400 mt-1 leading-relaxed">
                    IT receives a frantic Slack DM Friday at 4 PM for a Monday hire. Laptop arrives Thursday afternoon; first week lost.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-forest/5 dark:bg-forest/10 border border-forest/15">
                  <div className="font-bold text-forest dark:text-[#38B38A] text-[11px] uppercase tracking-wide">The OnboardX Protocol</div>
                  <p className="text-graphite-muted dark:text-gray-300 mt-1 leading-relaxed">
                    Requisition signature triggers automated serial reservation from live hardware inventory. Workstation arrives pre-configured on Day Minus One.
                  </p>
                </div>
              </div>
            </Card>

            {/* Contrast 2: Compliance */}
            <Card className="border border-mist-dark dark:border-graphite-borderDark p-5">
              <div className="w-8 h-8 rounded-lg bg-pine/10 dark:bg-pine/30 text-pine dark:text-[#6BB3AF] flex items-center justify-center mb-3">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                PII & Legal Paperwork
              </h3>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-brick/5 dark:bg-brick/10 border border-brick/15">
                  <div className="font-bold text-brick text-[11px] uppercase tracking-wide">Manual SME Default</div>
                  <p className="text-graphite-muted dark:text-gray-400 mt-1 leading-relaxed">
                    Plaintext SSNs, voided checks, and passports forwarded across multiple email inboxes. High breach exposure during SOC-2 audits.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-forest/5 dark:bg-forest/10 border border-forest/15">
                  <div className="font-bold text-forest dark:text-[#38B38A] text-[11px] uppercase tracking-wide">The OnboardX Protocol</div>
                  <p className="text-graphite-muted dark:text-gray-300 mt-1 leading-relaxed">
                    AES-256-GCM envelope encryption with field-level role masking. Every form is stamped with an immutable SHA-256 audit digest.
                  </p>
                </div>
              </div>
            </Card>

            {/* Contrast 3: Cross-Department Momentum */}
            <Card className="border border-mist-dark dark:border-graphite-borderDark p-5">
              <div className="w-8 h-8 rounded-lg bg-steelBlue/15 dark:bg-steelBlue/30 text-steelBlue flex items-center justify-center mb-3">
                <Workflow className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Cross-Department Momentum
              </h3>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-brick/5 dark:bg-brick/10 border border-brick/15">
                  <div className="font-bold text-brick text-[11px] uppercase tracking-wide">Manual SME Default</div>
                  <p className="text-graphite-muted dark:text-gray-400 mt-1 leading-relaxed">
                    HR doesn’t know if IT finished setup; manager forgets 1-on-1s; new hire sits in an empty Zoom on their first morning.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-forest/5 dark:bg-forest/10 border border-forest/15">
                  <div className="font-bold text-forest dark:text-[#38B38A] text-[11px] uppercase tracking-wide">The OnboardX Protocol</div>
                  <p className="text-graphite-muted dark:text-gray-300 mt-1 leading-relaxed">
                    Real-time reactive event bus (`onboardx-data-updated`). Calendar orientation, mentor pairing, and 30-day pulse check-ins deploy automatically.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive SME Friction & ROI Calculator */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-pine/30 dark:border-pine/40 bg-gradient-to-br from-pine/10 via-white to-transparent dark:from-pine/20 dark:via-graphite-cardDark dark:to-transparent p-6 sm:p-10 shadow-elevation">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-pine/10 dark:bg-pine/30 text-pine dark:text-amberSignal text-[11px] font-mono font-bold uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" />
                <span>Executive ROI Model</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-headline text-graphite dark:text-ivory">
                Calculate your operations dividend
              </h2>
              <p className="text-xs sm:text-sm text-graphite-muted dark:text-gray-300 leading-relaxed">
                Manual onboarding drains roughly 18.5 administrative hours across HR coordination, IT setup, and compliance tracking per hire. See what automated structure returns to your bottom line.
              </p>

              {/* Slider Input */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-headline font-bold text-graphite dark:text-ivory">
                  <span>Monthly New Hires:</span>
                  <span className="text-base text-pine dark:text-amberSignal font-mono">{hireVolume} hires / month</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={hireVolume}
                  onChange={(e) => setHireVolume(parseInt(e.target.value, 10))}
                  className="w-full accent-pine cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-graphite-muted font-mono">
                  <span>1 hire (Seed)</span>
                  <span>15 hires (Growth)</span>
                  <span>30 hires (Scale)</span>
                </div>
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="w-full lg:w-96 rounded-xl bg-white dark:bg-[#1E2428] border border-mist-dark dark:border-graphite-borderDark p-6 shadow-card space-y-5">
              <div>
                <div className="text-[10px] font-mono text-graphite-muted dark:text-gray-400 uppercase tracking-wider">
                  Admin Hours Reclaimed / Month
                </div>
                <div className="text-3xl sm:text-4xl font-bold font-headline text-pine dark:text-[#6BB3AF] mt-1 font-mono">
                  {monthlyAdminHoursSaved} hrs
                </div>
                <p className="text-[11px] text-graphite-muted dark:text-gray-400 mt-0.5">
                  Equivalent to {(monthlyAdminHoursSaved / 160).toFixed(1)} full-time operators
                </p>
              </div>

              <div className="pt-4 border-t border-mist-dark dark:border-graphite-borderDark">
                <div className="text-[10px] font-mono text-graphite-muted dark:text-gray-400 uppercase tracking-wider">
                  Annual Productivity Value Returned
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-headline text-forest dark:text-[#38B38A] mt-1 font-mono">
                  {formatCurrency(annualSavingsUsd, activeCurrency)}
                </div>
                <p className="text-[11px] text-graphite-muted dark:text-gray-400 mt-0.5">
                  Based on conservative $48/hr blended internal ops rate
                </p>
              </div>

              <div className="pt-4 border-t border-mist-dark dark:border-graphite-borderDark">
                <Link href="/dashboard">
                  <Button variant="primary" className="w-full text-xs font-bold cursor-pointer">
                    Inspect Cohort Roster Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Multi-Currency Pricing Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#D8DFDE] dark:border-graphite-borderDark">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="amber" className="mb-3">Transparent Enterprise Pricing</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold font-headline text-graphite dark:text-ivory">
            Invest in structure, not overhead
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-graphite-muted dark:text-gray-400">
            Choose between flexible per-hire billing or predictable monthly subscription.
          </p>

          {/* Currency & Billing Switchers */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center rounded-xl bg-mist dark:bg-graphite-cardDark p-1 border border-mist-dark dark:border-graphite-borderDark text-xs font-semibold">
              <button
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  billingCycle === "MONTHLY"
                    ? "bg-white dark:bg-graphite text-graphite dark:text-ivory shadow-2xs"
                    : "text-graphite-muted hover:text-graphite dark:hover:text-ivory"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("ANNUAL")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "ANNUAL"
                    ? "bg-white dark:bg-graphite text-graphite dark:text-ivory shadow-2xs font-bold"
                    : "text-graphite-muted hover:text-graphite dark:hover:text-ivory"
                }`}
              >
                <span>Annual</span>
                <span className="px-1.5 py-0.2 rounded-md bg-forest/15 text-forest dark:text-[#38B38A] text-[10px] font-mono">
                  Save 20%
                </span>
              </button>
            </div>

            <CurrencySwitcher onCurrencyChange={(curr) => setActiveCurrency(curr)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 sm:gap-8">
          {/* Per-Hire Tier */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between border border-mist-dark dark:border-graphite-borderDark bg-white dark:bg-[#1A1F22]">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-graphite-muted dark:text-gray-400 font-headline">
                Pay-Per-Hire (Flexible)
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold font-headline text-graphite dark:text-ivory font-mono">
                  {formatCurrency(basePerHireUsd, activeCurrency)}
                </span>
                <span className="text-xs text-graphite-muted dark:text-gray-400">/ onboarded hire</span>
              </div>
              <p className="mt-3 text-xs text-graphite-muted dark:text-gray-400 leading-relaxed">
                Zero commitments. Ideal for seasonal expansions, clinic branches, and agencies with fluctuating headcount.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-graphite dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span>Interactive touchscreen contract e-signing pad</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span>Hardware inventory serial tracking & UPS dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span>SHA-256 tamper-evident contract audit trail</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span>Anonymous zero-knowledge whistleblower channel</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Link href="/portal">
                <Button variant="outline" className="w-full text-xs font-bold cursor-pointer">
                  Launch Per-Hire Portal Demo
                </Button>
              </Link>
            </div>
          </Card>

          {/* Monthly / Annual Growth Tier */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between border-2 border-pine dark:border-amberSignal bg-white dark:bg-[#1A1F22] shadow-elevation relative">
            <div className="absolute -top-3 right-6">
              <span className="bg-pine dark:bg-amberSignal text-ivory dark:text-graphite text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-subtle">
                Most Popular for Tech SMEs
              </span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-pine dark:text-amberSignal font-headline">
                Growth Enterprise Scale
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold font-headline text-pine dark:text-ivory font-mono">
                  {formatCurrency(baseGrowthMonthlyUsd, activeCurrency)}
                </span>
                <span className="text-xs text-graphite-muted dark:text-gray-400">/ month</span>
              </div>
              <p className="mt-3 text-xs text-graphite-muted dark:text-gray-400 leading-relaxed">
                Up to 50 active cohort seats with unlimited workflow templates, automated OCR vision, and 24/7 policy intelligence.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-graphite dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span>All Per-Hire capabilities included</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span>Smart Vision Passport & ID OCR with instant autofill</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span>Interactive office desk map & visual org chart</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span>Multi-currency international payroll preparation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span>Custom white-label branding & tenant domains</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Link href="/dashboard">
                <Button variant="primary" className="w-full text-xs font-bold cursor-pointer">
                  Access Growth Plan Command Center
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
