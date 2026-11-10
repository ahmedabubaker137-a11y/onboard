"use client";

import React, { useState, useEffect } from "react";
import { TemplateData, TaskItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  Workflow,
  Plus,
  Trash2,
  Clock,
  UserCheck,
  Laptop,
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
  Copy,
  Download,
} from "lucide-react";

const DEFAULT_FALLBACK_TEMPLATE: TemplateData = {
  id: "tpl_standard_swe",
  title: "Standard Software Engineer",
  description: "Standard onboarding workflow for software engineering hires.",
  targetRole: "Software Engineer",
  department: "Engineering",
  tasksCount: 3,
  tasks: [
    {
      id: "t_swe_1",
      title: "Sign Standard Employment Contract",
      description: "Review and e-sign company contract.",
      category: "LEGAL_DOCUMENT",
      assignedTo: "EMPLOYEE",
      dueDays: 1,
    },
    {
      id: "t_swe_2",
      title: "Provision Standard Laptop Workstation",
      description: "Ship hardware.",
      category: "IT_PROVISIONING",
      assignedTo: "IT",
      dueDays: 1,
    },
    {
      id: "t_swe_3",
      title: "Schedule Team Orientation 1-on-1",
      description: "Meet team lead.",
      category: "TEAM_ORIENTATION",
      assignedTo: "MANAGER",
      dueDays: 3,
    },
  ],
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateData[]>([DEFAULT_FALLBACK_TEMPLATE]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData>(DEFAULT_FALLBACK_TEMPLATE);
  const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/v1/templates", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTemplates(json.data);
          setSelectedTemplate((prev) => json.data.find((t: any) => t.id === prev?.id) || json.data[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch templates from server:", e);
    }
  };

  useEffect(() => {
    fetchTemplates();
    const unsubscribe = subscribeToDataChanges(() => {
      fetchTemplates();
    });
    return unsubscribe;
  }, []);

  // New Task Form State
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    category: TaskItem["category"];
    assignedTo: TaskItem["assignedTo"];
    dueDays: number;
  }>({
    title: "",
    description: "",
    category: "GENERAL",
    assignedTo: "EMPLOYEE",
    dueDays: 1,
  });

  // New Template Form State
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    description: "",
    targetRole: "",
    department: "Engineering",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    if (!selectedTemplate) return;

    const taskToAdd: TaskItem = {
      id: `task_${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      assignedTo: newTask.assignedTo,
      dueDays: Number(newTask.dueDays),
      status: "PENDING",
    };

    const updatedSelected = {
      ...selectedTemplate,
      tasks: [...selectedTemplate.tasks, taskToAdd],
      tasksCount: selectedTemplate.tasks.length + 1,
    };
    setSelectedTemplate(updatedSelected);
    setTemplates((prev) => prev.map((t) => (t.id === updatedSelected.id ? updatedSelected : t)));
    setIsAddTaskModalOpen(false);
    showToast(`Added "${newTask.title}" to ${selectedTemplate.title}`);
    setNewTask({
      title: "",
      description: "",
      category: "GENERAL",
      assignedTo: "EMPLOYEE",
      dueDays: 1,
    });
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.title) return;

    const created: TemplateData = {
      id: `tpl_${Date.now()}`,
      title: newTemplate.title,
      description: newTemplate.description,
      targetRole: newTemplate.targetRole || "Standard Hire",
      department: newTemplate.department,
      tasksCount: 3,
      tasks: [
        { id: `t_${Date.now()}_1`, title: "Sign Standard Employment Contract", description: "Review and e-sign company contract.", category: "LEGAL_DOCUMENT", assignedTo: "EMPLOYEE", dueDays: 1 },
        { id: `t_${Date.now()}_2`, title: "Provision Standard Laptop Workstation", description: "Ship equipment.", category: "IT_PROVISIONING", assignedTo: "IT", dueDays: 1 },
        { id: `t_${Date.now()}_3`, title: "Schedule Team Orientation 1-on-1", description: "Meet manager.", category: "TEAM_ORIENTATION", assignedTo: "MANAGER", dueDays: 3 },
      ],
    };

    try {
      const res = await fetch("/api/v1/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(created),
      });
      if (res.ok) {
        await fetchTemplates();
      } else {
        setTemplates((prev) => [...prev, created]);
      }
      notifyDataChanged("template", { action: "create", template: created });
    } catch (err) {
      console.error("Failed to create template:", err);
      setTemplates((prev) => [...prev, created]);
    }

    setSelectedTemplate(created);
    setIsAddTemplateModalOpen(false);
    showToast(`Template "${created.title}" created successfully!`);
    setNewTemplate({ title: "", description: "", targetRole: "", department: "Engineering" });
  };

  const handleDuplicateTemplate = async () => {
    if (!selectedTemplate) return;
    const clone: TemplateData = {
      id: `tpl_${Date.now()}`,
      title: `${selectedTemplate.title} (Clone)`,
      description: selectedTemplate.description,
      targetRole: selectedTemplate.targetRole,
      department: selectedTemplate.department,
      tasksCount: selectedTemplate.tasks.length,
      tasks: selectedTemplate.tasks.map((t, i) => ({
        ...t,
        id: `t_clone_${Date.now()}_${i}`,
      })),
    };

    try {
      const res = await fetch("/api/v1/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clone),
      });
      if (res.ok) {
        await fetchTemplates();
      } else {
        setTemplates((prev) => [...prev, clone]);
      }
      notifyDataChanged("template", { action: "clone", template: clone });
    } catch (err) {
      console.error("Failed to duplicate template:", err);
      setTemplates((prev) => [...prev, clone]);
    }

    setSelectedTemplate(clone);
    showToast(`Cloned template "${clone.title}"`);
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    if (templates.length <= 1) {
      showToast("Cannot delete the only remaining template.");
      return;
    }

    const idToDelete = selectedTemplate.id;
    try {
      await fetch(`/api/v1/templates?id=${encodeURIComponent(idToDelete)}`, {
        method: "DELETE",
      });
      notifyDataChanged("template", { action: "delete", id: idToDelete });
    } catch (e) {
      console.error("Failed to delete template via API:", e);
    }
    const remaining = templates.filter((t) => t.id !== idToDelete);
    setTemplates(remaining);
    setSelectedTemplate(remaining[0] || DEFAULT_FALLBACK_TEMPLATE);
    showToast(`Deleted template "${selectedTemplate.title}".`);
  };

  const handleExportTemplateJSON = () => {
    const jsonStr = JSON.stringify(selectedTemplate, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedTemplate.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_template.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported "${selectedTemplate.title}" JSON specification.`);
  };

  const handleDeleteTask = (taskId: string) => {
    selectedTemplate.tasks = selectedTemplate.tasks.filter((t) => t.id !== taskId);
    selectedTemplate.tasksCount = selectedTemplate.tasks.length;
    setTemplates([...templates]);
    showToast("Task removed from template.");
  };

  return (
    <RoleGuard
      allowedRoles={["ADMIN", "HR_MANAGER"]}
      moduleName="Workflow Templates"
      description="Creating, editing, and managing employee cohort workflow templates is restricted to HR Managers and Administrators."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            Role-Based Onboarding Templates & Workflow Builder
          </h1>
          <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1">
            Configure standardized task sequences with automated routing across HR, IT, Managers, and Employees.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsAddTemplateModalOpen(true)}
          className="text-xs gap-1.5 shadow-subtle"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workflow Template</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates Selector List (Left Column) */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-graphite-muted dark:text-gray-400 font-headline">
            Available Role Templates
          </div>
          <div className="space-y-2">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white dark:bg-graphite-cardDark border-pine dark:border-pine shadow-subtle ring-1 ring-pine"
                      : "bg-ivory dark:bg-graphite-dark/60 border-[#D8DFDE] dark:border-graphite-borderDark hover:bg-white dark:hover:bg-graphite-cardDark hover:border-pine/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold font-headline text-xs text-graphite dark:text-ivory">
                      {tpl.title}
                    </h3>
                    <Badge variant="mist" size="sm">
                      {tpl.department}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-graphite-muted dark:text-gray-400 mt-1 line-clamp-2">
                    {tpl.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-graphite-muted dark:text-gray-400 font-mono">
                    <span>Target: {tpl.targetRole}</span>
                    <span className="font-bold text-pine dark:text-amberSignal">{tpl.tasks.length} Workflow Tasks</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Template Task Sequence (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{selectedTemplate.title}</CardTitle>
                  <Badge variant="pine">{selectedTemplate.department}</Badge>
                </div>
                <CardDescription className="mt-1">
                  {selectedTemplate.description}
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDuplicateTemplate}
                  className="text-xs gap-1"
                  title="Clone this template"
                >
                  <Copy className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
                  <span className="hidden sm:inline">Clone</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportTemplateJSON}
                  className="text-xs gap-1"
                  title="Export JSON specification"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteTemplate}
                  className="text-xs gap-1 text-brick dark:text-red-400 hover:bg-brick/10"
                  title="Delete this template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="text-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-[#E3ECEB] dark:divide-graphite-borderDark text-xs">
                {selectedTemplate.tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className="p-4 flex items-start justify-between gap-4 hover:bg-mist/30 dark:hover:bg-graphite-dark/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-pine/10 dark:bg-pine/30 text-pine dark:text-ivory flex items-center justify-center font-mono font-bold text-[11px] mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-graphite dark:text-ivory">{task.title}</span>
                          <Badge
                            variant={
                              task.category === "LEGAL_DOCUMENT"
                                ? "pine"
                                : task.category === "IT_PROVISIONING"
                                ? "steel"
                                : task.category === "BENEFITS"
                                ? "amber"
                                : "mist"
                            }
                            size="sm"
                          >
                            {task.category.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-graphite-muted dark:text-gray-400 leading-relaxed">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-graphite-muted dark:text-gray-400 pt-1">
                          <span className="text-pine dark:text-[#6BB3AF] font-semibold">Trigger: Due on Day {task.dueDays}</span>
                          <span>•</span>
                          <span className="uppercase">Assigned Department: {task.assignedTo}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-graphite-muted dark:text-gray-400 hover:text-brick dark:hover:text-red-400 p-1.5 rounded transition-colors cursor-pointer"
                      title="Remove task from template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Add Task to "{selectedTemplate.title}"
              </h3>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Schedule Product Architecture Review"
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Instructions or expectations for this checklist item..."
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Category</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
                    className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="GENERAL">General</option>
                    <option value="LEGAL_DOCUMENT">Legal & Contract</option>
                    <option value="IT_PROVISIONING">IT & Hardware</option>
                    <option value="BENEFITS">Benefits Election</option>
                    <option value="TRAINING">Training / Quiz</option>
                    <option value="TEAM_ORIENTATION">Team Orientation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Assigned Stakeholder</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value as any })}
                    className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="EMPLOYEE">New Employee</option>
                    <option value="IT">IT Department</option>
                    <option value="HR">People Ops (HR)</option>
                    <option value="MANAGER">Hiring Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Due Day Offset (from start date)</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={newTask.dueDays}
                  onChange={(e) => setNewTask({ ...newTask, dueDays: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddTaskModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save Task Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Template Modal */}
      {isAddTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Create Onboarding Workflow Template
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
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  placeholder="e.g. Clinical Specialist Onboarding"
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Target Role</label>
                <input
                  type="text"
                  value={newTemplate.targetRole}
                  onChange={(e) => setNewTemplate({ ...newTemplate, targetRole: e.target.value })}
                  placeholder="e.g. Registered Nurse / Medical Assistant"
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Department</label>
                <select
                  value={newTemplate.department}
                  onChange={(e) => setNewTemplate({ ...newTemplate, department: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Revenue & Sales">Revenue & Sales</option>
                  <option value="People Operations">People Operations</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Summary of this workflow..."
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddTemplateModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Create Template
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
