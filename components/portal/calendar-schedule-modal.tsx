"use client";

import React, { useState } from "react";
import { Calendar, Clock, Video, UserCheck, Download, ExternalLink, CheckCircle2, RefreshCw, X } from "lucide-react";

interface CalendarScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  managerName?: string;
  managerEmail?: string;
  onScheduleSuccess?: () => void;
}

export function CalendarScheduleModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  managerName = "Elena Rostova (Engineering Lead)",
  managerEmail = "elena.rostova@acme.corp",
  onScheduleSuccess,
}: CalendarScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState("2026-05-04");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [duration, setDuration] = useState(45);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledMeeting, setScheduledMeeting] = useState<any | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);

    try {
      const res = await fetch("/api/v1/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          managerEmail,
          date: selectedDate,
          time: selectedTime,
          durationMinutes: duration,
          title: `1-on-1 Onboarding Alignment: ${employeeName} & ${managerName.split(" ")[0]}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.meeting) {
        setScheduledMeeting(data.meeting);
        if (onScheduleSuccess) {
          onScheduleSuccess();
        }
      }
    } catch (err) {
      console.error("Scheduling error:", err);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!scheduledMeeting?.icsFileContent) return;
    const blob = new Blob([scheduledMeeting.icsFileContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `onboarding-1on1-${employeeId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-graphite-surface border border-mist dark:border-graphite-muted/30 rounded-xl shadow-2xl max-w-lg w-full p-6 text-graphite dark:text-ivory animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mist dark:border-graphite-muted/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pine text-ivory flex items-center justify-center font-bold shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-headline">Auto-Schedule Manager 1-on-1</h3>
              <p className="text-xs text-graphite-muted dark:text-gray-400">
                Syncs with Google Calendar, Microsoft Outlook & generates .ics invite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-graphite-muted hover:text-graphite dark:hover:text-ivory transition-colors p-1.5 rounded-lg hover:bg-mist dark:hover:bg-graphite cursor-pointer"
            aria-label="Close Calendar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {scheduledMeeting ? (
          <div className="space-y-4">
            <div className="p-4 bg-forest/10 border border-forest/30 rounded-xl text-forest dark:text-[#38B38A] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold">1-on-1 Successfully Scheduled!</h4>
                <p className="text-[11px] mt-1 text-graphite-muted dark:text-gray-300">
                  Meeting invitation dispatched to {scheduledMeeting.attendees.join(", ")}.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-graphite-muted">Session:</span>
                <span className="font-semibold">{scheduledMeeting.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-muted">Date & Time:</span>
                <span className="font-semibold font-mono">{selectedDate} @ {selectedTime} UTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-muted">Duration:</span>
                <span className="font-semibold">{scheduledMeeting.durationMinutes} Minutes</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-mist/80 dark:border-graphite-muted/20">
                <span className="text-graphite-muted">Zoom Room:</span>
                <a
                  href={scheduledMeeting.zoomLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-steelBlue hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Join Meeting <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={scheduledMeeting.googleCalendarUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-pine hover:bg-pine/90 text-ivory text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-[0.98]"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Open in Google Calendar</span>
              </a>
              <button
                onClick={handleDownloadIcs}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-mist dark:border-graphite-muted/40 hover:bg-mist/30 text-xs font-semibold text-graphite dark:text-ivory transition-colors cursor-pointer active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ICS</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="p-3 bg-mist/30 dark:bg-graphite-muted/15 rounded-xl flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-full bg-pine/10 text-pine dark:text-ivory flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-graphite-muted">With Manager:</span>
                <div className="font-bold text-graphite dark:text-ivory">{managerName}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-graphite dark:text-ivory mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden focus:border-pine"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-graphite dark:text-ivory mb-1">
                  Time Slot
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 bg-white dark:bg-graphite text-xs text-graphite dark:text-ivory focus:outline-hidden focus:border-pine"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:30">03:30 PM</option>
                  <option value="16:30">04:30 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-graphite dark:text-ivory mb-1">
                Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 45, 60].map((mins) => (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`py-2 rounded-lg border text-xs font-semibold transition-all ${
                      duration === mins
                        ? "bg-pine text-ivory border-pine shadow-xs"
                        : "bg-mist/30 dark:bg-graphite border-mist dark:border-graphite-muted/30 text-graphite dark:text-gray-300"
                    }`}
                  >
                    {mins} Mins
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-mist dark:border-graphite-muted/40 text-xs font-semibold text-graphite dark:text-ivory hover:bg-mist/30 cursor-pointer active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isScheduling}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-pine hover:bg-pine/90 text-ivory text-xs font-bold shadow-xs disabled:opacity-50 transition-colors cursor-pointer active:scale-[0.98]"
              >
                {isScheduling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                <span>Auto-Generate Invite</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
