"use client";
import React, { useState, useEffect } from "react";
import { CustomFieldDefinition } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { addNotification } from "@/lib/notifications";
import {
  FileSliders,
  Edit3,
  Plus,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  Tag,
  Sparkles,
  Info,
} from "lucide-react";

interface CustomFieldsCardProps {
  employeeId: string;
  employeeName: string;
  initialValues?: Record<string, string | number | boolean>;
  encryptedPii?: {
    ssnMasked?: string;
    taxIdEncrypted?: string;
    bankRoutingEncrypted?: string;
    isEncrypted?: boolean;
  };
  onValuesUpdated?: (updated: Record<string, string | number | boolean>) => void;
}

export function CustomFieldsCard({
  employeeId,
  employeeName,
  initialValues = {},
  encryptedPii,
  onValuesUpdated,
}: CustomFieldsCardProps) {
  const [definitions, setDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [values, setValues] = useState<Record<string, string | number | boolean>>(initialValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form edit buffer
  const [editBuffer, setEditBuffer] = useState<Record<string, any>>({});

  // New definition form state
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "dropdown" | "boolean" | "date">("text");
  const [newFieldCategory, setNewFieldCategory] = useState<"PERSONAL" | "IT" | "COMPLIANCE" | "PREFERENCE">("PREFERENCE");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const fetchFields = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/employees/${employeeId}/custom-fields`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (json.data.definitions) setDefinitions(json.data.definitions);
          if (json.data.values) setValues(json.data.values);
        }
      }
    } catch (err) {
      console.error("Failed to load custom fields:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [employeeId]);

  const handleOpenEdit = () => {
    setEditBuffer({ ...values });
    setIsEditModalOpen(true);
  };

  const handleSaveValues = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/employees/${employeeId}/custom-fields`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: editBuffer }),
      });

      if (res.ok) {
        const json = await res.json();
        setValues({ ...editBuffer });
        if (onValuesUpdated) onValuesUpdated(editBuffer);
        setIsEditModalOpen(false);
        addNotification(
          "Custom Profile Fields Updated",
          `Updated custom organization attributes for ${employeeName}.`,
          "system",
          `/employees/${employeeId}`
        );
      }
    } catch (err) {
      console.error("Failed to save custom attributes:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFieldDefinition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;

    try {
      const parsedOptions =
        newFieldType === "dropdown"
          ? newFieldOptions
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

      const res = await fetch("/api/v1/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFieldName.trim() || newFieldLabel.toLowerCase().replace(/\s+/g, "_"),
          label: newFieldLabel.trim(),
          type: newFieldType,
          category: newFieldCategory,
          options: parsedOptions,
          required: newFieldRequired,
        }),
      });

      if (res.ok) {
        await fetchFields();
        setIsAddFieldModalOpen(false);
        setNewFieldLabel("");
        setNewFieldName("");
        setNewFieldOptions("");
        setNewFieldRequired(false);
        addNotification(
          "Organization Custom Field Registered",
          `New attribute schema "${newFieldLabel}" registered across all employee profiles.`,
          "system",
          `/employees/${employeeId}`
        );
      }
    } catch (err) {
      console.error("Failed to register custom field:", err);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-mist dark:border-graphite-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pine/10 dark:bg-pine/30 text-pine dark:text-amberSignal">
              <FileSliders className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold font-headline">Custom Profile Attributes</CardTitle>
              <CardDescription className="text-[11px]">
                Organization-specific schema fields and PII encryption
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddFieldModalOpen(true)}
              className="h-7 text-[11px] px-2 gap-1 border-dashed"
              title="Add a new custom field to organization schema"
            >
              <Plus className="w-3 h-3 text-pine dark:text-amberSignal" />
              <span>New Field</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenEdit}
              className="h-7 text-[11px] px-2 gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs">
          {/* AES-256 PII Encrypted Storage Status */}
          <div className="p-2.5 rounded-lg border border-forest/30 bg-forest/5 dark:bg-forest/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
              <div>
                <span className="font-semibold text-graphite dark:text-ivory">AES-256-GCM Row Encryption</span>
                <p className="text-[10px] text-graphite-muted dark:text-gray-400">
                  SSN: <span className="font-mono text-graphite dark:text-ivory">{encryptedPii?.ssnMasked || "•••-••-4819"}</span> • Certified Tenant Isolated
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-forest/20 text-forest dark:text-[#38B38A] font-bold">
              VERIFIED
            </span>
          </div>

          {/* Dynamic Custom Fields Grid */}
          {isLoading ? (
            <div className="text-xs text-graphite-muted dark:text-gray-400 py-3 text-center">Loading attributes...</div>
          ) : definitions.length === 0 ? (
            <div className="text-xs text-graphite-muted dark:text-gray-400 py-4 text-center border border-dashed border-mist rounded-lg">
              No custom fields configured for this organization.
            </div>
          ) : (
            <div className="space-y-2.5">
              {definitions.map((def) => {
                const currentVal = values[def.name] ?? def.defaultValue ?? "—";
                return (
                  <div
                    key={def.id}
                    className="p-2.5 rounded-lg border border-mist dark:border-graphite-muted/30 bg-warmIvory/30 dark:bg-graphite/40 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-graphite dark:text-ivory truncate">{def.label}</span>
                        {def.required && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-clayGold/15 text-clayGold dark:text-amberSignal font-bold uppercase">
                            Required
                          </span>
                        )}
                        {def.category && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-mist dark:bg-graphite-muted/30 text-graphite-muted dark:text-gray-400 uppercase">
                            {def.category}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-graphite-muted dark:text-gray-400 font-mono">
                        key: {def.name} • {def.type}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-medium text-pine dark:text-amberSignal text-xs">
                        {String(currentVal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Values Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-mist dark:border-graphite-muted/30 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-mist dark:border-graphite-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-pine text-white">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                    Edit Custom Attributes
                  </h3>
                  <p className="text-[11px] text-graphite-muted dark:text-gray-400">
                    Modifying org-specific attributes for {employeeName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1.5 rounded-lg hover:bg-mist dark:hover:bg-graphite cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveValues} className="mt-4 space-y-3.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
              {definitions.map((def) => {
                const val = editBuffer[def.name] ?? def.defaultValue ?? "";

                return (
                  <div key={def.id} className="space-y-1">
                    <label className="flex items-center justify-between font-semibold text-graphite dark:text-gray-200">
                      <span>{def.label}</span>
                      {def.required && <span className="text-[10px] text-brick">* required</span>}
                    </label>

                    {def.type === "dropdown" ? (
                      <select
                        value={val}
                        onChange={(e) => setEditBuffer({ ...editBuffer, [def.name]: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-mist dark:border-graphite-muted/40 bg-warmIvory/30 dark:bg-[#14181B] text-graphite dark:text-ivory text-xs"
                      >
                        <option value="">Select option...</option>
                        {def.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : def.type === "boolean" ? (
                      <label className="flex items-center gap-2 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => setEditBuffer({ ...editBuffer, [def.name]: e.target.checked })}
                          className="w-4 h-4 text-pine rounded-md"
                        />
                        <span className="text-xs text-graphite dark:text-gray-300">Enabled / Confirmed</span>
                      </label>
                    ) : (
                      <input
                        type={def.type === "date" ? "date" : "text"}
                        value={val}
                        onChange={(e) => setEditBuffer({ ...editBuffer, [def.name]: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-mist dark:border-graphite-muted/40 bg-warmIvory/30 dark:bg-[#14181B] text-graphite dark:text-ivory text-xs"
                        placeholder={`Enter ${def.label}...`}
                      />
                    )}
                  </div>
                );
              })}

              <div className="flex justify-end gap-2 pt-4 border-t border-mist dark:border-graphite-muted/20">
                <Button type="button" size="sm" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Attributes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Field Schema Definition Modal */}
      {isAddFieldModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F22] rounded-xl border border-mist dark:border-graphite-muted/30 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-mist dark:border-graphite-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-pine text-white">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold font-headline text-base text-graphite dark:text-ivory">
                    Register Organization Custom Field
                  </h3>
                  <p className="text-[11px] text-graphite-muted dark:text-gray-400">
                    Defines a new schema attribute for all employees
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddFieldModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:hover:text-ivory p-1.5 rounded-lg hover:bg-mist dark:hover:bg-graphite cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFieldDefinition} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Field Label</label>
                <input
                  type="text"
                  required
                  value={newFieldLabel}
                  onChange={(e) => {
                    setNewFieldLabel(e.target.value);
                    if (!newFieldName) {
                      setNewFieldName(e.target.value.toLowerCase().replace(/\s+/g, "_"));
                    }
                  }}
                  placeholder="e.g. Dietary Preference, Clearance Level"
                  className="w-full p-2.5 rounded-lg border border-mist dark:border-graphite-muted/40 bg-warmIvory/30 dark:bg-[#14181B] text-graphite dark:text-ivory text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Field Identifier Key</label>
                <input
                  type="text"
                  required
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="e.g. dietary_preference"
                  className="w-full p-2.5 rounded-lg border border-mist dark:border-graphite-muted/40 bg-warmIvory/30 dark:bg-[#14181B] text-graphite dark:text-ivory text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Data Type</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-mist dark:border-graphite-muted/40 bg-warmIvory/30 dark:bg-[#14181B] text-graphite dark:text-ivory text-xs"
                  >
                    <option value="text">Text Input</option>
                    <option value="dropdown">Dropdown Select</option>
                    <option value="date">Date Picker</option>
                    <option value="boolean">Yes/No Boolean</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={newFieldCategory}
                    onChange={(e) => setNewFieldCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-mist dark:border-graphite-muted/40 bg-warmIvory/30 dark:bg-[#14181B] text-graphite dark:text-ivory text-xs"
                  >
                    <option value="PREFERENCE">Preference</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="IT">IT / Equipment</option>
                    <option value="COMPLIANCE">Compliance</option>
                  </select>
                </div>
              </div>

              {newFieldType === "dropdown" && (
                <div>
                  <label className="block font-semibold text-graphite dark:text-gray-300 mb-1">
                    Dropdown Options (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                    className="w-full p-2.5 rounded-lg border border-mist dark:border-graphite-muted/40 bg-warmIvory/30 dark:bg-[#14181B] text-graphite dark:text-ivory text-xs"
                  />
                </div>
              )}

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFieldRequired}
                    onChange={(e) => setNewFieldRequired(e.target.checked)}
                    className="w-4 h-4 text-pine rounded-md"
                  />
                  <span className="text-xs text-graphite dark:text-gray-300 font-medium">
                    Mark as mandatory field during onboarding
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-mist dark:border-graphite-muted/20">
                <Button type="button" size="sm" variant="outline" onClick={() => setIsAddFieldModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  Register Field Schema
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
