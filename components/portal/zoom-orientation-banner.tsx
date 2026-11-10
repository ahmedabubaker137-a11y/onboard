"use client";

import React, { useState, useEffect } from "react";
import { Video, ExternalLink, Users, Calendar, Copy, Check, Clock } from "lucide-react";

export function ZoomOrientationBanner() {
  const [session, setSession] = useState<{
    cohort: string;
    topic: string;
    scheduledAt: string;
    durationMinutes: number;
    meetingId: string;
    passcode: string;
    joinUrl: string;
    host: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/v1/integrations/zoom")
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch((err) => console.error("Failed to load Zoom session:", err));
  }, []);

  if (!session) return null;

  const handleCopyPasscode = () => {
    navigator.clipboard.writeText(session.passcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-steelBlue/30 bg-steelBlue/10 dark:bg-steelBlue/15 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-steelBlue text-white flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5">
          <Video className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold font-headline text-graphite dark:text-ivory">
              {session.topic}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-steelBlue/20 text-steelBlue dark:text-[#90bfe0] border border-steelBlue/30">
              ZOOM LIVE ORIENTATION
            </span>
          </div>
          <p className="text-xs text-graphite-muted dark:text-gray-300">
            Hosted by <strong>{session.host}</strong> • Cohort: {session.cohort}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-graphite-muted dark:text-gray-400 pt-1">
            <span className="inline-flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5" /> Friday, 10:00 AM PST
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" /> {session.durationMinutes} Mins
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              ID: {session.meetingId}
            </span>
            <button
              onClick={handleCopyPasscode}
              className="inline-flex items-center gap-1 font-mono hover:text-pine transition-colors cursor-pointer"
            >
              Passcode: <strong>{session.passcode}</strong>
              {copied ? <Check className="w-3 h-3 text-forest" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
        <a
          href={session.joinUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-steelBlue hover:bg-steelBlue/90 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-[0.98]"
        >
          <Video className="w-4 h-4" />
          <span>Launch Zoom Room</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
        </a>
      </div>
    </div>
  );
}
