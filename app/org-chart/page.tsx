"use client";

import React, { useState, useEffect } from "react";
import type { OrgNode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  Network,
  Users,
  Mail,
  ChevronDown,
  ChevronRight,
  Search,
  Building,
  Briefcase,
  Plus,
  Download,
  X,
  CheckCircle2,
  Minimize2,
  Maximize2,
} from "lucide-react";

const INITIAL_CEO_NODE: OrgNode = {
  id: "sofia_01",
  name: "Sofia Calderon",
  role: "Chief Executive Officer & Founder",
  department: "Executive",
  avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  email: "sofia.calderon@acme-enterprises.com",
  reports: [],
};

export default function OrgChartPage() {
  const [orgData, setOrgData] = useState<OrgNode>(INITIAL_CEO_NODE);
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [search, setSearch] = useState("");
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOrgChart = async () => {
    try {
      const res = await fetch("/api/v1/org-chart", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setOrgData(json.data);
      }
    } catch (err) {
      console.error("Failed to load org chart from server:", err);
    }
  };

  useEffect(() => {
    fetchOrgChart();
    const unsubscribe = subscribeToDataChanges(() => {
      fetchOrgChart();
    });
    return unsubscribe;
  }, []);

  // New Member Form State
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    department: "Engineering",
    email: "",
    managerId: "sofia_01",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleNode = (nodeId: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedNodes({});
    showToast("Expanded all reporting hierarchies.");
  };

  const handleCollapseAll = () => {
    const collapsed: Record<string, boolean> = {};
    const collectIds = (node: OrgNode) => {
      if (node.reports && node.reports.length > 0) {
        collapsed[node.id] = true;
        node.reports.forEach(collectIds);
      }
    };
    collectIds(orgData);
    setCollapsedNodes(collapsed);
    showToast("Collapsed all branch reports.");
  };

  // Flatten tree for manager dropdown and export
  const flattenTree = (node: OrgNode, managerName: string = "Board"): { node: OrgNode; managerName: string }[] => {
    let list = [{ node, managerName }];
    if (node.reports) {
      node.reports.forEach((child) => {
        list = list.concat(flattenTree(child, node.name));
      });
    }
    return list;
  };

  const allMembers = flattenTree(orgData);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) return;

    const memberItem = {
      id: `member_${Date.now()}`,
      name: newMember.name,
      role: newMember.role,
      department: newMember.department,
      email: newMember.email || `${newMember.name.toLowerCase().replace(/ /g, ".")}@acme.com`,
      avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 90000000)}?w=150&auto=format&fit=crop&q=80`,
    };

    try {
      const res = await fetch("/api/v1/org-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerId: newMember.managerId,
          member: memberItem,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setOrgData(json.data);
      } else {
        await fetchOrgChart();
      }
      notifyDataChanged("org_chart", { action: "add_member", member: memberItem });
    } catch (err) {
      console.error("Failed to add org member via API:", err);
    }

    setIsAddMemberModalOpen(false);
    const addedName = memberItem.name;
    setNewMember({
      name: "",
      role: "",
      department: "Engineering",
      email: "",
      managerId: "sofia_01",
    });
    showToast(`Added ${addedName} to the organizational chart.`);
  };

  const handleExportDirectoryCSV = () => {
    const headers = "Name,Role,Department,Email,Reports To\n";
    const rows = allMembers
      .map(
        (m) =>
          `"${m.node.name}","${m.node.role}","${m.node.department}","${m.node.email}","${m.managerName}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `onboardx_team_directory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported complete team directory CSV.");
  };

  // Recursive tree node renderer
  const renderOrgNode = (node: OrgNode, level: number = 0) => {
    const isCollapsed = collapsedNodes[node.id];
    const hasReports = node.reports && node.reports.length > 0;

    const matchesSearch =
      !search ||
      node.name.toLowerCase().includes(search.toLowerCase()) ||
      node.role.toLowerCase().includes(search.toLowerCase()) ||
      node.department.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === "ALL" || node.department.includes(selectedDept);

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          className={`w-64 sm:w-72 p-4 rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark transition-all duration-150 relative bg-white dark:bg-graphite-cardDark shadow-subtle ${
            !matchesSearch || !matchesDept ? "opacity-40" : "hover:border-pine/40 dark:hover:border-pine"
          }`}
        >
          {/* Top connection notch */}
          {level > 0 && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#D8DFDE] dark:bg-graphite-borderDark" />
          )}

          <div className="flex items-center gap-3">
            <img
              src={node.avatarUrl}
              alt={node.name}
              className="w-11 h-11 rounded-xl object-cover border border-[#D0D8D7] dark:border-graphite-borderDark"
            />
            <div className="space-y-0.5 flex-1 min-w-0">
              <h4 className="font-bold font-headline text-xs text-graphite dark:text-ivory truncate">
                {node.name}
              </h4>
              <div className="text-[11px] font-semibold text-pine dark:text-amberSignal truncate">{node.role}</div>
              <div className="text-[10px] text-graphite-muted dark:text-gray-400 truncate">{node.department}</div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E3ECEB] dark:border-graphite-borderDark flex items-center justify-between text-[11px]">
            <a
              href={`mailto:${node.email}`}
              className="text-graphite-muted dark:text-gray-400 hover:text-pine dark:hover:text-amberSignal flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Mail className="w-3 h-3" />
              <span>Contact</span>
            </a>

            {hasReports && (
              <button
                onClick={() => toggleNode(node.id)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-mist dark:bg-graphite-dark text-graphite-muted dark:text-gray-300 hover:text-pine dark:hover:text-amberSignal cursor-pointer text-[10px] font-mono font-medium transition-colors"
              >
                <span>{node.reports!.length} direct reports</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Children reporting tree */}
        {hasReports && !isCollapsed && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical connector line */}
            <div className="w-0.5 h-6 bg-[#D8DFDE] dark:bg-graphite-borderDark" />

            {/* Horizontal branch bar */}
            {node.reports!.length > 1 && (
              <div
                className="h-0.5 bg-[#D8DFDE] dark:bg-graphite-borderDark mb-6"
                style={{
                  width: `${Math.min(100, (node.reports!.length - 1) * 35)}%`,
                }}
              />
            )}

            {/* Sub-nodes */}
            <div className="flex flex-wrap justify-center gap-6 w-full">
              {node.reports!.map((subNode) => renderOrgNode(subNode, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <RoleGuard
      allowedRoles={["ADMIN", "HR_MANAGER", "EMPLOYEE", "MANAGER"]}
      moduleName="Organization Hierarchy & Directory"
      description="The organization chart provides cross-functional reporting tree visibility for Employees, People Ops, and Management."
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
            Interactive Organizational Hierarchy & Team Directory
          </h1>
          <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1">
            Visual reporting tree connecting executives, department leaders, and new hires across Acme Technologies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExpandAll}
            className="text-xs gap-1"
            title="Expand all tree branches"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expand All</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCollapseAll}
            className="text-xs gap-1"
            title="Collapse all branches"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Collapse All</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportDirectoryCSV}
            className="text-xs gap-1"
            title="Export CSV of full team directory"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsAddMemberModalOpen(true)}
            className="text-xs gap-1.5 shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Team Member</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-graphite-cardDark border border-[#D8DFDE] dark:border-graphite-borderDark">
        <div className="flex items-center gap-2 text-xs font-semibold text-graphite-muted dark:text-gray-400">
          <Users className="w-4 h-4 text-pine dark:text-amberSignal" />
          <span>Active Workforce: {allMembers.length} Members</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-graphite-muted dark:text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team member..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory placeholder:text-graphite-muted dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors w-44 sm:w-60"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
          >
            <option value="ALL">All Departments</option>
            <option value="Executive">Executive</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product & Design</option>
            <option value="People">People Operations</option>
            <option value="Revenue">Revenue & Sales</option>
          </select>
        </div>
      </div>

      {/* Visual Chart Canvas */}
      <Card className="p-8 overflow-x-auto min-h-[550px] flex justify-center bg-[#FAFBFB] dark:bg-[#13171A]">
        <div className="min-w-fit">{renderOrgNode(orgData, 0)}</div>
      </Card>

      {/* Add Team Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Add Team Member to Org Hierarchy
              </h3>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brandon Diaz"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Job Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Security Architect"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Department</label>
                  <select
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="People Operations">People Operations</option>
                    <option value="Revenue & Sales">Revenue & Sales</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Reports To Manager *</label>
                  <select
                    value={newMember.managerId}
                    onChange={(e) => setNewMember({ ...newMember, managerId: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                  >
                    {allMembers.map((m) => (
                      <option key={m.node.id} value={m.node.id}>
                        {m.node.name} ({m.node.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@acme.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddMemberModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Add to Org Tree
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
