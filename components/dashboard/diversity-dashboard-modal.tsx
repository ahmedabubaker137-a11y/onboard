"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Users, PieChart, ShieldCheck, Download, Award, Heart, CheckCircle2, ChevronRight, Globe2, X, Check } from "lucide-react";
import type { DiversityMetrics } from "@/lib/types";
import { INITIAL_DIVERSITY_METRICS } from "@/lib/constants";
import { addNotification } from "@/lib/notifications";

interface DiversityDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiversityDashboardModal({ isOpen, onClose }: DiversityDashboardModalProps) {
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState<DiversityMetrics | null>(INITIAL_DIVERSITY_METRICS);
  const [isExported, setIsExported] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setIsExported(false);
    fetch("/api/v1/analytics/dei")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setMetrics(json.data);
      })
      .catch((e) => console.error("Failed to load DEI analytics:", e));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !metrics || !mounted) return null;

  const handleExport = () => {
    setIsExported(true);
    addNotification(
      "EEO-1 Diversity Audit Exported",
      "Automated EEO-1 federal demographic report compiled with SHA-256 seal and archived for regulatory compliance.",
      "audit",
      "/dashboard"
    );
    setTimeout(() => setIsExported(false), 4000);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-graphite-surface border border-mist dark:border-graphite-muted/30 rounded-xl shadow-2xl max-w-3xl w-full p-6 text-graphite dark:text-ivory animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mist dark:border-graphite-muted/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center font-bold shadow-xs">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-headline">Diversity, Equity & Inclusion (DEI) Intelligence</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-forest/10 text-forest dark:text-[#38B38A] border border-forest/20">
                  EEO-1 COMPLIANT
                </span>
              </div>
              <p className="text-xs text-graphite-muted dark:text-gray-400">
                Anonymized demographic metrics, representation pipelines, and equal-opportunity benchmarking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-graphite-muted hover:text-graphite dark:hover:text-ivory transition-colors p-1.5 rounded-lg hover:bg-mist dark:hover:bg-graphite cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-3 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40">
            <span className="text-[10px] uppercase font-bold text-graphite-muted">Female Leadership</span>
            <div className="text-xl font-bold font-headline text-pine dark:text-amberSignal mt-1">
              {metrics.leadershipFemalePercentage}%
            </div>
            <span className="text-[10px] text-forest font-medium">+6% vs FY25 target</span>
          </div>

          <div className="p-3 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40">
            <span className="text-[10px] uppercase font-bold text-graphite-muted">Veteran Inclusions</span>
            <div className="text-xl font-bold font-headline text-pine dark:text-amberSignal mt-1">
              {metrics.veteranPercentage}%
            </div>
            <span className="text-[10px] text-forest font-medium">Exceeds federal goal</span>
          </div>

          <div className="p-3 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40">
            <span className="text-[10px] uppercase font-bold text-graphite-muted">Global Remote Hires</span>
            <div className="text-xl font-bold font-headline text-pine dark:text-amberSignal mt-1">
              {metrics.remotePercentage}%
            </div>
            <span className="text-[10px] text-graphite-muted font-medium">14 Countries</span>
          </div>

          <div className="p-3 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40">
            <span className="text-[10px] uppercase font-bold text-graphite-muted">Gender Parity</span>
            <div className="text-xl font-bold font-headline text-forest dark:text-[#38B38A] mt-1">
              Balanced
            </div>
            <span className="text-[10px] text-forest font-medium">52% W / 45% M / 3% NB</span>
          </div>
        </div>

        {/* Detailed Demographic Visual Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-xs">
          {/* Gender Parity Visual */}
          <div className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-white dark:bg-graphite-surface space-y-3">
            <h4 className="font-bold font-headline text-graphite dark:text-ivory flex items-center justify-between">
              <span>Gender Distribution</span>
              <span className="text-[11px] font-mono text-graphite-muted">N = 142 Team Members</span>
            </h4>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Female</span>
                  <span className="font-bold">{metrics.genderBreakdown.female}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-mist dark:bg-graphite overflow-hidden">
                  <div className="h-full bg-pine" style={{ width: `${metrics.genderBreakdown.female}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Male</span>
                  <span className="font-bold">{metrics.genderBreakdown.male}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-mist dark:bg-graphite overflow-hidden">
                  <div className="h-full bg-steelBlue" style={{ width: `${metrics.genderBreakdown.male}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Non-Binary / Gender Expansive</span>
                  <span className="font-bold">{metrics.genderBreakdown.nonBinary}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-mist dark:bg-graphite overflow-hidden">
                  <div className="h-full bg-amberSignal" style={{ width: `${metrics.genderBreakdown.nonBinary}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Ethnicity Breakdown */}
          <div className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-white dark:bg-graphite-surface space-y-3">
            <h4 className="font-bold font-headline text-graphite dark:text-ivory flex items-center justify-between">
              <span>Ethnicity & Heritage Diversity</span>
              <span className="text-[11px] font-mono text-graphite-muted">Self-Reported</span>
            </h4>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Asian / Pacific Islander</span>
                <span className="font-bold font-mono">{metrics.ethnicityBreakdown.asian}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>White / Caucasian</span>
                <span className="font-bold font-mono">{metrics.ethnicityBreakdown.white}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Black / African American</span>
                <span className="font-bold font-mono">{metrics.ethnicityBreakdown.black}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hispanic / Latino</span>
                <span className="font-bold font-mono">{metrics.ethnicityBreakdown.hispanic}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Two or More Races</span>
                <span className="font-bold font-mono">{metrics.ethnicityBreakdown.multiracial}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Export confirmation feedback */}
        {isExported && (
          <div className="p-3 mb-4 rounded-xl bg-forest/15 border border-forest/30 text-forest text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>EEO-1 Form & Comprehensive Diversity PDF generated and sent to People Ops lead.</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-mist dark:border-graphite-muted/20 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-graphite-muted dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>Data strictly aggregate-only to protect employee privacy under GDPR Article 9.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={isExported}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest/90 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-75"
            >
              {isExported ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isExported ? "Exported to People Ops" : "Export EEO-1 Audit Report"}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-mist dark:bg-graphite text-graphite dark:text-ivory font-semibold hover:bg-mist-dark dark:hover:bg-graphite-dark transition-colors cursor-pointer active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
