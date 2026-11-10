"use client";

import React, { useState, useEffect } from "react";
import type { AssetData, EmployeeData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  Laptop,
  Monitor,
  Key,
  Smartphone,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  X,
  UserCheck,
  RotateCcw,
  Download,
  Trash2,
  Lock,
} from "lucide-react";
import { useRole } from "@/lib/use-role";
import { addNotification } from "@/lib/notifications";
import { notifyDataChanged, subscribeToDataChanges } from "@/lib/events";

export default function ITAssetsPage() {
  const { currentRole, currentUser } = useRole();
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isAddSoftwareModalOpen, setIsAddSoftwareModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchAssetsAndEmployees = async () => {
    try {
      const [resAssets, resEmployees] = await Promise.all([
        fetch("/api/v1/assets", { cache: "no-store" }),
        fetch("/api/v1/employees", { cache: "no-store" }),
      ]);
      if (resAssets.ok) {
        const json = await resAssets.json();
        if (json.data) setAssets(json.data);
      }
      if (resEmployees.ok) {
        const json = await resEmployees.json();
        if (json.data) setEmployees(json.data);
      }
    } catch (e) {
      console.error("Failed to load assets data from server:", e);
    }
  };

  useEffect(() => {
    fetchAssetsAndEmployees();
    const unsubscribe = subscribeToDataChanges(() => {
      fetchAssetsAndEmployees();
    });
    return unsubscribe;
  }, []);

  // New Asset Form State
  const [newAsset, setNewAsset] = useState<{
    name: string;
    model: string;
    serialNumber: string;
    category: AssetData["category"];
  }>({
    name: "",
    model: "",
    serialNumber: "",
    category: "LAPTOP",
  });

  // Software checklist state
  const [softwareList, setSoftwareList] = useState([
    { id: "s1", name: "GitHub Enterprise (Acme Engineering)", role: "Software Engineers", status: "PROVISIONED" },
    { id: "s2", name: "AWS Cloud Sandbox & Staging IAM", role: "Backend / Infra", status: "PENDING" },
    { id: "s3", name: "Salesforce CRM Enterprise", role: "Revenue & Sales", status: "PROVISIONED" },
    { id: "s4", name: "Figma Professional Team License", role: "Product Designers", status: "PROVISIONED" },
    { id: "s5", name: "1Password Enterprise Password Vault", role: "All Employees", status: "PROVISIONED" },
  ]);

  // New Software Form State
  const [newSoftware, setNewSoftware] = useState({
    name: "",
    role: "All Employees",
    status: "PROVISIONED" as "PROVISIONED" | "PENDING",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAssignModal = (asset: AssetData) => {
    setSelectedAsset(asset);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !selectedEmployeeId) return;

    const emp = employees.find((e) => e.id === selectedEmployeeId);

    try {
      await fetch("/api/v1/assets/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: selectedAsset.id, employeeId: selectedEmployeeId }),
      });
      await fetchAssetsAndEmployees();
      setIsAssignModalOpen(false);
      notifyDataChanged("asset", { assetId: selectedAsset.id, employeeId: selectedEmployeeId });
      addNotification(
        "Workstation Checked Out",
        `Assigned ${selectedAsset.name} (SN: ${selectedAsset.serialNumber}) to ${emp?.firstName} ${emp?.lastName}.`,
        "hardware",
        "/assets"
      );
      showToast(`Assigned ${selectedAsset.name} to employee.`);
    } catch (err) {
      console.error("Assign asset error:", err);
      showToast("Failed to assign asset via server.");
    }
  };

  const handleReturnAsset = async (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    try {
      await fetch("/api/v1/assets/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      await fetchAssetsAndEmployees();
      notifyDataChanged("asset", { assetId, action: "return" });
      addNotification(
        "Hardware Checked In",
        `Returned ${asset.name} (SN: ${asset.serialNumber}) to available inventory pool.`,
        "hardware",
        "/assets"
      );
      showToast(`Returned ${asset.name} (SN: ${asset.serialNumber}) to available stock.`);
    } catch (err) {
      console.error("Return asset error:", err);
      showToast("Failed to return asset via server.");
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.serialNumber) return;

    const assetItem: AssetData = {
      id: `asset_${Date.now()}`,
      name: newAsset.name,
      model: newAsset.model || "Standard Enterprise Spec",
      serialNumber: newAsset.serialNumber.toUpperCase(),
      category: newAsset.category,
      status: "AVAILABLE",
    };

    try {
      await fetch("/api/v1/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetItem),
      });
      await fetchAssetsAndEmployees();
      setIsAddAssetModalOpen(false);
      setNewAsset({ name: "", model: "", serialNumber: "", category: "LAPTOP" });
      notifyDataChanged("asset", { assetId: assetItem.id, action: "create" });
      addNotification(
        "Hardware Stock Added",
        `Enrolled new asset into inventory: ${assetItem.name} (${assetItem.serialNumber}).`,
        "hardware",
        "/assets"
      );
      showToast(`Registered new asset: ${assetItem.name} (${assetItem.serialNumber})`);
    } catch (err) {
      console.error("Create asset error:", err);
      showToast("Failed to register new asset on server.");
    }
  };

  const handleExportCSV = () => {
    const headers = "Name,Serial Number,Category,Model,Status,Assigned To\n";
    const rows = assets
      .map(
        (a) =>
          `"${a.name}","${a.serialNumber}","${a.category}","${a.model}","${a.status}","${a.assignedToName || "N/A"}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `onboardx_assets_inventory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported complete hardware inventory CSV.");
  };

  const handleAddSoftware = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoftware.name) return;

    const item = {
      id: `s_${Date.now()}`,
      name: newSoftware.name,
      role: newSoftware.role,
      status: newSoftware.status,
    };

    setSoftwareList([...softwareList, item]);
    setIsAddSoftwareModalOpen(false);
    setNewSoftware({ name: "", role: "All Employees", status: "PROVISIONED" });
    showToast(`Added software tool: ${item.name}`);
  };

  const handleDeleteSoftware = (id: string) => {
    setSoftwareList(softwareList.filter((s) => s.id !== id));
    showToast("Software requirement removed from checklist.");
  };

  const toggleSoftwareStatus = (id: string) => {
    setSoftwareList(
      softwareList.map((s) =>
        s.id === id ? { ...s, status: s.status === "PROVISIONED" ? "PENDING" : "PROVISIONED" } : s
      )
    );
    showToast("Software credential provisioning state updated.");
  };

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      (a.assignedToName && a.assignedToName.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = filterCategory === "ALL" || a.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const assignedCount = assets.filter((a) => a.status === "ASSIGNED").length;
  const availableCount = assets.filter((a) => a.status === "AVAILABLE").length;

  return (
    <RoleGuard
      allowedRoles={["ADMIN", "IT_PROVISIONER"]}
      moduleName="IT Hardware & Assets"
      description="Workstation hardware custody, serial number provisioning, and inventory returns are restricted to IT Systems Provisioners and Administrators."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-pine dark:bg-[#32615E] text-ivory px-4 py-3 shadow-elevation flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-forest dark:text-[#38B38A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role Adaptive Banner */}
      {currentRole === "IT_PROVISIONER" && (
        <div className="rounded-xl border border-pine/30 bg-pine/10 dark:bg-pine/20 p-3.5 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-pine text-ivory shrink-0">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-graphite dark:text-ivory">
                IT Provisioning Lead Active: {currentUser.name}
              </span>
              <p className="text-[11px] text-graphite-muted dark:text-gray-300">
                Full authority to check out workstations, assign serial numbers, and restore returned equipment.
              </p>
            </div>
          </div>
          <Badge variant="pine">IT Lead Clearance</Badge>
        </div>
      )}

      {currentRole === "EMPLOYEE" && (
        <div className="rounded-xl border border-clayGold/40 bg-clayGold/10 dark:bg-clayGold/20 p-3.5 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-clayGold/20 text-[#8C620A] dark:text-amberSignal shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-graphite dark:text-ivory">
                Employee Asset View (Kaelen Chen)
              </span>
              <p className="text-[11px] text-graphite-muted dark:text-gray-300">
                You can review corporate equipment allocation. Asset registration and checkouts are restricted to IT Systems Provisioners.
              </p>
            </div>
          </div>
          <Badge variant="mist">Read-Only View</Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-graphite dark:text-ivory tracking-tight">
            IT Asset Management & Hardware Provisioning
          </h1>
          <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1">
            Track serial numbers, manage laptop allocations, and provision enterprise software seats.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs gap-1.5"
            title="Download CSV report of all assets"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Inventory (CSV)</span>
          </Button>

          {currentRole === "EMPLOYEE" ? (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="text-xs gap-1.5 opacity-60 cursor-not-allowed"
              title="Only IT Provisioners can register new assets"
            >
              <Lock className="w-3 h-3 text-graphite-muted" />
              <span>Register Hardware Asset (IT Only)</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddAssetModalOpen(true)}
              className="text-xs gap-1.5 shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Hardware Asset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider font-headline">
              Total Managed Inventory
            </span>
            <div className="mt-2 text-3xl font-bold font-headline text-graphite dark:text-ivory">
              {assets.length} Units
            </div>
            <div className="text-[11px] text-graphite-muted dark:text-gray-400 mt-1">
              Laptops, 4K Displays, Security Tokens
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider font-headline">
              Assigned to Hires
            </span>
            <div className="mt-2 text-3xl font-bold font-headline text-forest dark:text-[#38B38A]">
              {assignedCount} Deployed
            </div>
            <div className="text-[11px] text-graphite-muted dark:text-gray-400 mt-1">
              MDM enrolled and encrypted
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider font-headline">
              In Stock & Ready
            </span>
            <div className="mt-2 text-3xl font-bold font-headline text-amberSignal">
              {availableCount} Available
            </div>
            <div className="text-[11px] text-graphite-muted dark:text-gray-400 mt-1">
              Ready for next week's cohort
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hardware Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle>Hardware Asset Registry</CardTitle>
            <CardDescription>
              Serial numbers, allocation status, and MDM tracking for all enterprise equipment.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-graphite-muted dark:text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search serial, model..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory placeholder:text-graphite-muted dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors w-48 sm:w-60"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Categories</option>
              <option value="LAPTOP">Laptops</option>
              <option value="MONITOR">Monitors</option>
              <option value="SECURITY_KEY">Security Keys</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-mist dark:bg-graphite-dark text-graphite-muted dark:text-gray-400 font-headline uppercase text-[10px] tracking-wider border-b border-[#D8DFDE] dark:border-graphite-borderDark">
              <tr>
                <th className="py-3.5 px-6">Hardware Item</th>
                <th className="py-3.5 px-4">Serial Number</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Specifications</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3ECEB] dark:divide-graphite-borderDark">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-mist/30 dark:hover:bg-graphite-dark/40 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-graphite dark:text-ivory">
                    <div className="flex items-center gap-2.5">
                      {asset.category === "LAPTOP" && <Laptop className="w-4 h-4 text-pine dark:text-amberSignal" />}
                      {asset.category === "MONITOR" && <Monitor className="w-4 h-4 text-steelBlue dark:text-[#7FA6BF]" />}
                      {asset.category === "SECURITY_KEY" && <Key className="w-4 h-4 text-amberSignal" />}
                      <span>{asset.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-pine dark:text-[#6BB3AF] font-medium">
                    {asset.serialNumber}
                  </td>
                  <td className="py-3.5 px-4 text-graphite-muted dark:text-gray-400 font-medium">
                    {asset.category}
                  </td>
                  <td className="py-3.5 px-4 text-graphite-muted dark:text-gray-400 text-[11px]">
                    {asset.model}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={asset.status === "ASSIGNED" ? "forest" : "clay"} size="sm">
                      {asset.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-graphite dark:text-ivory font-medium">
                    {asset.assignedToName || "—"}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    {asset.status === "AVAILABLE" ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenAssignModal(asset)}
                        className="h-7 text-[11px] px-2.5"
                      >
                        Assign to Hire
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReturnAsset(asset.id)}
                        className="h-7 text-[11px] px-2 gap-1 text-graphite-muted dark:text-gray-300 hover:text-amberSignal"
                        title="Return hardware back to available stock"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Return to Stock</span>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Software Provisioning Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Software Account Provisioning Checklist</CardTitle>
            <CardDescription>
              SaaS account provisioning matrix across engineering, sales, and design tools.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddSoftwareModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
            <span>Add Software Tool</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {softwareList.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark bg-ivory dark:bg-graphite-cardDark flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-pine dark:text-amberSignal shrink-0" />
                <div>
                  <div className="font-semibold text-graphite dark:text-ivory">{item.name}</div>
                  <div className="text-[11px] text-graphite-muted dark:text-gray-400">Target Audience: {item.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Badge variant={item.status === "PROVISIONED" ? "forest" : "clay"} size="sm">
                  {item.status}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleSoftwareStatus(item.id)}
                  className="h-7 text-[11px]"
                >
                  Toggle State
                </Button>
                <button
                  onClick={() => handleDeleteSoftware(item.id)}
                  className="p-1.5 rounded-lg text-graphite-muted dark:text-gray-400 hover:text-brick dark:hover:text-red-400 hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
                  title="Remove software requirement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Assign Hardware Modal */}
      {isAssignModalOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Assign Hardware: {selectedAsset.name}
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark space-y-1">
                <div className="text-graphite dark:text-ivory font-semibold">{selectedAsset.model}</div>
                <div className="font-mono text-pine dark:text-amberSignal text-[11px]">SN: {selectedAsset.serialNumber}</div>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Select Employee Recipient *</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} — {emp.jobTitle} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAssignModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Confirm Checkout & Record Audit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register New Hardware Asset Modal */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Register New Enterprise Hardware Asset
              </h3>
              <button
                onClick={() => setIsAddAssetModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro 16-inch M3 Max"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Hardware Category *</label>
                <select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as AssetData["category"] })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="LAPTOP">Laptop / Workstation</option>
                  <option value="MONITOR">Monitor / External Display</option>
                  <option value="SECURITY_KEY">Security Token / YubiKey</option>
                  <option value="MOBILE">Mobile Device</option>
                  <option value="OTHER">Other Peripherals</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Hardware Serial Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C02G188XMD6M"
                  value={newAsset.serialNumber}
                  onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 font-mono uppercase rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Specifications & Model Details</label>
                <input
                  type="text"
                  placeholder="e.g. Apple M3 Max / 64GB Unified / 1TB SSD"
                  value={newAsset.model}
                  onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddAssetModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save & Register Asset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Software Tool Modal */}
      {isAddSoftwareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-graphite-cardDark rounded-xl border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <h3 className="text-sm font-bold font-headline text-graphite dark:text-ivory">
                Add Enterprise Software Seat
              </h3>
              <button
                onClick={() => setIsAddSoftwareModalOpen(false)}
                className="text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory p-1 rounded-lg hover:bg-mist dark:hover:bg-graphite-dark cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSoftware} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Software / Platform Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Datadog Observability Pro"
                  value={newSoftware.name}
                  onChange={(e) => setNewSoftware({ ...newSoftware, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Target Department / Role</label>
                <input
                  type="text"
                  placeholder="e.g. SRE & Platform Engineers"
                  value={newSoftware.role}
                  onChange={(e) => setNewSoftware({ ...newSoftware, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Initial Provisioning State</label>
                <select
                  value={newSoftware.status}
                  onChange={(e) => setNewSoftware({ ...newSoftware, status: e.target.value as "PROVISIONED" | "PENDING" })}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="PROVISIONED">Provisioned (Active)</option>
                  <option value="PENDING">Pending Approval</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECEB] dark:border-graphite-borderDark">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsAddSoftwareModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Add Software Item
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
