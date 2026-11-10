"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, CheckCircle2, XCircle, Bell, ArrowRight, ShieldCheck, RefreshCw, Send, Check, X } from "lucide-react";

interface SlackBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingTasks?: Array<{ id: string; title: string; employeeName: string; department: string }>;
  onActionComplete?: () => void;
}

export function SlackBotModal({
  isOpen,
  onClose,
  pendingTasks = [
    { id: "tk4", title: "Grant GitHub Enterprise & AWS Cloud Access", employeeName: "Kaelen Vance", department: "Engineering" },
    { id: "tk6", title: "Complete Security Awareness & PII Protection Quiz", employeeName: "Kaelen Vance", department: "Engineering" },
    { id: "tk7", title: "Schedule 30-Day Engineering Mentor 1-on-1", employeeName: "Sofia Calderon", department: "Product & Design" },
  ],
  onActionComplete,
}: SlackBotModalProps) {
  const [mounted, setMounted] = useState(false);
  const [platform, setPlatform] = useState<"slack" | "teams">("slack");
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [revisingTaskId, setRevisingTaskId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [displayTasks, setDisplayTasks] = useState(pendingTasks);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real-time pending tasks from database
  useEffect(() => {
    if (!isOpen) return;
    const fetchLiveTasks = async () => {
      try {
        const res = await fetch("/api/v1/employees");
        if (res.ok) {
          const json = await res.json();
          const emps = json.data || [];
          const tasks: Array<{ id: string; title: string; employeeName: string; department: string }> = [];
          for (const emp of emps) {
            for (const t of emp.tasks || []) {
              if (t.status === "PENDING" || t.status === "IN_PROGRESS") {
                tasks.push({
                  id: t.id,
                  title: t.title,
                  employeeName: `${emp.firstName} ${emp.lastName}`,
                  department: emp.department,
                });
                if (tasks.length >= 4) break;
              }
            }
            if (tasks.length >= 4) break;
          }
          if (tasks.length > 0) {
            setDisplayTasks(tasks);
          }
        }
      } catch (e) {}
    };
    fetchLiveTasks();
  }, [isOpen]);

  // Lock background scroll when modal is open and handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleAction = async (taskId: string, action: "approve" | "reject" | "remind", customNote?: string) => {
    setLoadingTaskId(taskId);
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/slack-bot/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          taskId,
          approverName: "Sarah Connor (HR Director)",
          note: customNote || (action === "reject" ? "Please verify document signature and re-upload" : undefined),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCompletedTaskIds((prev) => [...prev, taskId]);
        setFeedback(data.message || `Action '${action}' applied via bot.`);
        if (onActionComplete) onActionComplete();
      } else {
        setFeedback(data.error || "Action failed.");
      }
    } catch (err) {
      setFeedback("Network error dispatching bot action.");
    } finally {
      setLoadingTaskId(null);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] my-auto flex flex-col bg-white dark:bg-[#181D20] border border-[#D8DFDE] dark:border-graphite-borderDark rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Fixed Header */}
        <div className="p-4 sm:p-5 border-b border-[#D8DFDE] dark:border-graphite-borderDark bg-white dark:bg-[#181D20] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0 ${
              platform === "slack" ? "bg-[#4A154B]" : "bg-[#464EB8]"
            }`}>
              {platform === "slack" ? "#" : "T"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-headline text-graphite dark:text-ivory">
                  {platform === "slack" ? "Slack Enterprise Approvals Bot" : "Microsoft Teams Connector"}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-forest/10 text-forest border border-forest/20">
                  LIVE BOT
                </span>
              </div>
              <p className="text-xs text-graphite-muted dark:text-gray-400">
                1-click instant approvals & automated reminder nudges directly from chat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-graphite-muted hover:text-graphite dark:hover:text-ivory transition-colors p-2 rounded-xl hover:bg-mist dark:hover:bg-graphite cursor-pointer"
            aria-label="Close Slack Bot Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 pt-4 flex-1 overflow-y-auto min-h-0 space-y-4">
          {/* Platform & Channel Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-mist/40 dark:bg-graphite-muted/10 p-2.5 rounded-xl gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-graphite-muted dark:text-gray-400">Target Ecosystem:</span>
              <div className="inline-flex rounded-lg border border-mist dark:border-graphite-muted/30 p-0.5 bg-white dark:bg-graphite">
                <button
                  onClick={() => setPlatform("slack")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    platform === "slack"
                      ? "bg-[#4A154B] text-white shadow-xs"
                      : "text-graphite-muted dark:text-gray-400 hover:text-graphite"
                  }`}
                >
                  Slack #onboarding
                </button>
                <button
                  onClick={() => setPlatform("teams")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    platform === "teams"
                      ? "bg-[#464EB8] text-white shadow-xs"
                      : "text-graphite-muted dark:text-gray-400 hover:text-graphite"
                  }`}
                >
                  MS Teams Channel
                </button>
              </div>
            </div>
            <span className="text-xs font-mono text-graphite-muted">
              {platform === "slack" ? "#onboarding-approvals" : "General > HR Operations"}
            </span>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div className="p-3 bg-forest/10 border border-forest/30 rounded-xl text-xs text-forest dark:text-[#38B38A] flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Simulated Chat Cards */}
          <div className="space-y-3">
            {displayTasks.map((t) => {
              const isCompleted = completedTaskIds.includes(t.id);
              return (
                <div
                  key={t.id}
                  className={`border rounded-xl p-4 transition-all ${
                    isCompleted
                      ? "bg-forest/5 border-forest/20 opacity-75"
                      : "bg-warmIvory/60 dark:bg-graphite/40 border-mist dark:border-graphite-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-pine/10 dark:bg-pine/20 text-pine dark:text-ivory flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-pine dark:text-amberSignal">
                            {t.employeeName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-mist dark:bg-graphite-muted/30 text-graphite-muted dark:text-gray-300 font-medium">
                            {t.department}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-graphite dark:text-ivory mt-0.5">{t.title}</h4>
                        <p className="text-xs text-graphite-muted dark:text-gray-400 mt-0.5">
                          New hire completed form submission. Awaiting manager approval before provisioning hardware.
                        </p>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest dark:text-[#38B38A] shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> Processed
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amberSignal/10 text-amberSignal border border-amberSignal/20 shrink-0">
                        Pending Action
                      </span>
                    )}
                  </div>

                  {!isCompleted && (
                    <div className="mt-3 pt-3 border-t border-mist/80 dark:border-graphite-muted/20 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(t.id, "approve")}
                          disabled={loadingTaskId === t.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest hover:bg-forest/90 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer active:scale-[0.98]"
                        >
                          {loadingTaskId === t.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          1-Click Approve
                        </button>

                        <button
                          onClick={() => {
                            if (revisingTaskId === t.id) {
                              setRevisingTaskId(null);
                            } else {
                              setRevisingTaskId(t.id);
                            }
                          }}
                          disabled={loadingTaskId === t.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer active:scale-[0.98]"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {revisingTaskId === t.id ? "Cancel Note" : "Request Revision"}
                        </button>
                      </div>

                      <button
                        onClick={() => handleAction(t.id, "remind")}
                        disabled={loadingTaskId === t.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-graphite-muted hover:text-graphite dark:hover:text-ivory transition-colors cursor-pointer active:scale-[0.98]"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        Nudge Employee
                      </button>
                    </div>
                  )}

                  {/* Inline revision note input */}
                  {!isCompleted && revisingTaskId === t.id && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-900/40 space-y-2 animate-in fade-in duration-150">
                      <label className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                        Revision Feedback sent to Slack/Teams channel:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={revisionNotes[t.id] || ""}
                          onChange={(e) => setRevisionNotes((prev) => ({ ...prev, [t.id]: e.target.value }))}
                          placeholder="e.g. Please re-upload with high-res document scan..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-red-300 dark:border-red-900/60 bg-white dark:bg-[#181D20] text-graphite dark:text-ivory focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={() => {
                            handleAction(t.id, "reject", revisionNotes[t.id]);
                            setRevisingTaskId(null);
                          }}
                          disabled={loadingTaskId === t.id}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Send Revision
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-4 sm:p-5 border-t border-mist dark:border-graphite-muted/20 shrink-0 bg-mist/20 dark:bg-graphite/40 flex items-center justify-between text-xs text-graphite-muted dark:text-gray-400">
          <span>Encrypted Slack Block Kit & MS Adaptive Card format</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-mist dark:bg-graphite hover:bg-mist-dark dark:hover:bg-graphite-muted/30 font-semibold text-graphite dark:text-ivory transition-colors cursor-pointer active:scale-[0.98]"
          >
            Close Bot Console
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
