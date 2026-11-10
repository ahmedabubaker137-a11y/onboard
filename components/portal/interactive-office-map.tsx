"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Users, CheckCircle2, Monitor, Coffee, Zap, Info, Shield, RefreshCw } from "lucide-react";
import type { OfficeDeskItem } from "@/lib/types";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";

interface InteractiveOfficeMapProps {
  employeeId: string;
  employeeName: string;
}

export function InteractiveOfficeMap({ employeeId, employeeName }: InteractiveOfficeMapProps) {
  const [desks, setDesks] = useState<OfficeDeskItem[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string>("Floor 3 - Engineering Hub");
  const [selectedDesk, setSelectedDesk] = useState<OfficeDeskItem | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchDesks = async () => {
    try {
      const res = await fetch("/api/v1/office-map", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.desks) setDesks(json.desks);
      }
    } catch (e) {
      console.error("Failed to load desks:", e);
    }
  };

  useEffect(() => {
    fetchDesks();
    const unsubscribe = subscribeToDataChanges((detail) => {
      if (!detail?.type || detail.type === "desk" || detail.type === "focus") {
        fetchDesks();
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredDesks = desks.filter((d) => d.floor === selectedFloor);
  const myDesk = desks.find((d) => d.employeeId === employeeId || d.assignedToId === employeeId);

  const handleDeskSelect = (desk: OfficeDeskItem) => {
    setSelectedDesk(desk);
  };

  const handleAssignDesk = async (deskId: string, isReleasing: boolean = false) => {
    setIsAssigning(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/office-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deskId,
          employeeId: isReleasing ? null : employeeId,
          employeeName: isReleasing ? null : employeeName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback(isReleasing ? "Desk reservation released." : `Reserved ${deskId} for ${employeeName}!`);
        notifyDataChanged("desk");
        await fetchDesks();
        if (data.desk) setSelectedDesk(data.desk);
      } else {
        setFeedback(data.error || "Failed to update desk reservation.");
      }
    } catch (err) {
      setFeedback("Network error reserving desk.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-graphite-surface border border-mist dark:border-graphite-muted/30 rounded-xl p-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mist dark:border-graphite-muted/20 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-pine/10 text-pine dark:text-amberSignal">
                <MapPin className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold font-headline text-graphite dark:text-ivory">
                Interactive Office Floor Plan & Desk Selector
              </h3>
            </div>
            <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1">
              Select your permanent or hybrid hot-desk in the San Francisco HQ. Equipped with dual 4K monitors & Herman Miller seating.
            </p>
          </div>

          {/* Floor Switcher */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setSelectedFloor("Floor 3 - Engineering Hub");
                setSelectedDesk(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                selectedFloor.includes("Floor 3")
                  ? "bg-pine text-ivory shadow-xs"
                  : "bg-mist/40 dark:bg-graphite text-graphite-muted hover:text-graphite dark:hover:text-ivory"
              }`}
            >
              Floor 3 (Engineering)
            </button>
            <button
              onClick={() => {
                setSelectedFloor("Floor 4 - Product & Design");
                setSelectedDesk(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                selectedFloor.includes("Floor 4")
                  ? "bg-pine text-ivory shadow-xs"
                  : "bg-mist/40 dark:bg-graphite text-graphite-muted hover:text-graphite dark:hover:text-ivory"
              }`}
            >
              Floor 4 (Product & Design)
            </button>
          </div>
        </div>

        {/* Current Reservation Status */}
        <div className="mb-6 p-4 rounded-xl border border-mist dark:border-graphite-muted/30 bg-warmIvory/50 dark:bg-graphite/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-graphite dark:text-ivory">Current Desk Status:</span>
            {myDesk ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest/10 text-forest dark:text-[#38B38A] border border-forest/20 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Reserved: {myDesk.deskCode || myDesk.id} ({myDesk.floor})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amberSignal/10 text-amberSignal border border-amberSignal/20 font-semibold">
                No desk reserved yet (Select below)
              </span>
            )}
          </div>
          {myDesk && (
            <button
              onClick={() => handleAssignDesk(myDesk.id, true)}
              disabled={isAssigning}
              className="text-xs text-red-600 hover:text-red-700 underline font-medium self-start sm:self-auto cursor-pointer active:scale-[0.98]"
            >
              Release Reservation
            </button>
          )}
        </div>

        {feedback && (
          <div className="mb-4 p-3 bg-forest/10 border border-forest/30 rounded-lg text-xs text-forest dark:text-[#38B38A] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* 2D Floor Plan Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Floor Grid (Left 2 Columns) */}
          <div className="lg:col-span-2 border border-mist dark:border-graphite-muted/30 rounded-xl p-5 bg-ivory/50 dark:bg-[#15191C]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-mist/80 dark:border-graphite-muted/20 text-xs">
              <span className="font-bold text-graphite dark:text-ivory uppercase tracking-wider text-[11px]">
                {selectedFloor}
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs bg-forest"></div>
                  <span className="text-graphite-muted">Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs bg-pine"></div>
                  <span className="text-graphite-muted">Your Desk</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-xs bg-gray-400"></div>
                  <span className="text-graphite-muted">Occupied</span>
                </div>
              </div>
            </div>

            {/* Architectural Layout */}
            <div className="space-y-4">
              {/* Zone A: Focus Pods & Executive */}
              <div className="p-3 rounded-lg border border-dashed border-mist dark:border-graphite-muted/30 bg-white/60 dark:bg-graphite/30">
                <div className="text-[10px] font-bold text-graphite-muted uppercase mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amberSignal" />
                  <span>North Wing: Quad Pods</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {filteredDesks.slice(0, 4).map((d) => renderDeskButton(d))}
                </div>
              </div>

              {/* Zone B: Central Collaboration & Amenities */}
              <div className="p-2.5 rounded-lg bg-mist/30 dark:bg-graphite-muted/10 flex items-center justify-between text-xs text-graphite-muted px-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <Coffee className="w-3.5 h-3.5 text-pine dark:text-amberSignal" /> Espresso Bar & Kitchenette
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Monitor className="w-3.5 h-3.5 text-steelBlue" /> Audio/Visual Telepresence Booths
                </span>
              </div>

              {/* Zone C: Open Bay Workstations */}
              <div className="p-3 rounded-lg border border-dashed border-mist dark:border-graphite-muted/30 bg-white/60 dark:bg-graphite/30">
                <div className="text-[10px] font-bold text-graphite-muted uppercase mb-2 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-pine dark:text-amberSignal" />
                  <span>South Wing: High-Performance Benches</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {filteredDesks.slice(4).map((d) => renderDeskButton(d))}
                </div>
              </div>
            </div>
          </div>

          {/* Desk Detail & Action Panel (Right 1 Column) */}
          <div className="border border-mist dark:border-graphite-muted/30 rounded-xl p-5 bg-white dark:bg-graphite-surface space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-graphite dark:text-ivory border-b border-mist dark:border-graphite-muted/20 pb-2">
              Desk Specifications
            </h4>

            {selectedDesk ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold font-mono text-pine dark:text-amberSignal">
                    {selectedDesk.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      selectedDesk.employeeId === employeeId
                        ? "bg-pine text-ivory"
                        : selectedDesk.status === "AVAILABLE"
                        ? "bg-forest/10 text-forest"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                    }`}
                  >
                    {selectedDesk.employeeId === employeeId
                      ? "Your Desk"
                      : selectedDesk.status}
                  </span>
                </div>

                <div className="space-y-2 text-graphite-muted dark:text-gray-300">
                  <div className="flex justify-between border-b border-mist/50 dark:border-graphite-muted/20 pb-1">
                    <span>Floor / Area:</span>
                    <span className="font-semibold text-graphite dark:text-ivory">{selectedDesk.floor}</span>
                  </div>
                  <div className="flex justify-between border-b border-mist/50 dark:border-graphite-muted/20 pb-1">
                    <span>Current Occupant:</span>
                    <span className="font-semibold text-graphite dark:text-ivory">
                      {selectedDesk.employeeName || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-mist/50 dark:border-graphite-muted/20 pb-1">
                    <span>Hardware:</span>
                    <span className="font-semibold text-graphite dark:text-ivory">Dual 32\" 4K Thunderbolt 4</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span>Chair:</span>
                    <span className="font-semibold text-graphite dark:text-ivory">Herman Miller Embody</span>
                  </div>
                </div>

                <div className="pt-2">
                  {selectedDesk.employeeId === employeeId || selectedDesk.assignedToId === employeeId ? (
                    <button
                      onClick={() => handleAssignDesk(selectedDesk.id, true)}
                      disabled={isAssigning}
                      className="w-full py-2.5 rounded-xl border border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 text-xs transition-colors cursor-pointer active:scale-[0.98]"
                    >
                      Release Desk Reservation
                    </button>
                  ) : selectedDesk.status === "AVAILABLE" ? (
                    <button
                      onClick={() => handleAssignDesk(selectedDesk.id, false)}
                      disabled={isAssigning}
                      className="w-full py-2.5 rounded-xl bg-pine hover:bg-pine/90 text-ivory font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                    >
                      {isAssigning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Reserve This Desk
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-mist/40 dark:bg-graphite-muted/20 text-center text-graphite-muted text-xs">
                      Desk is currently occupied by {selectedDesk.employeeName || selectedDesk.assignedToName || "Another Teammate"}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-graphite-muted dark:text-gray-400 space-y-2 text-xs">
                <Info className="w-6 h-6 mx-auto opacity-50" />
                <p>Click any desk on the floor plan to inspect amenities and confirm assignment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function renderDeskButton(d: OfficeDeskItem) {
    const isMine = d.employeeId === employeeId || d.assignedToId === employeeId;
    const isAvail = d.status === "AVAILABLE";
    const isSelected = selectedDesk?.id === d.id;

    return (
      <button
        type="button"
        key={d.id}
        onClick={() => handleDeskSelect(d)}
        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.96] ${
          isSelected
            ? "ring-2 ring-amberSignal border-amberSignal"
            : ""
        } ${
          isMine
            ? "bg-pine text-ivory border-pine shadow-xs"
            : isAvail
            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-800/40 hover:border-emerald-500"
            : "bg-gray-100/80 dark:bg-graphite border-mist dark:border-graphite-muted/30 opacity-75"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold">{d.id}</span>
          <div
            className={`w-2 h-2 rounded-full ${
              isMine
                ? "bg-amberSignal"
                : isAvail
                ? "bg-forest"
                : "bg-gray-400"
            }`}
          />
        </div>
        <p className={`text-[10px] truncate mt-1 ${isMine ? "text-ivory/80" : "text-graphite-muted dark:text-gray-400"}`}>
          {isMine ? "You" : d.employeeName || "Open Desk"}
        </p>
      </button>
    );
  }
}
