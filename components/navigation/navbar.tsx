"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OnboardXLogo } from "../branding/logo";
import { ThemeToggle } from "../theme/theme-toggle";
import { DEMO_USERS, RoleType, isRouteAllowedForRole } from "@/lib/rbac";
import { useRole } from "@/lib/use-role";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  clearAllNotifications,
  AppNotification,
} from "@/lib/notifications";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Workflow,
  Laptop,
  FileText,
  Network,
  Bot,
  Settings,
  Bell,
  ChevronDown,
  Shield,
  Menu,
  X,
  CheckCheck,
  Trash2,
  Sparkles,
  LogOut,
  Globe,
  MessageSquare,
  ShieldAlert,
  MoreHorizontal,
  Briefcase,
} from "lucide-react";
import { useTranslation, LanguageCode } from "@/lib/i18n";
import { SlackBotModal } from "@/components/collaboration/slack-bot-modal";

export function Navbar() {
  const pathname = usePathname();
  const { currentRole, currentUser, switchRole } = useRole();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifFilter, setNotifFilter] = useState<"ALL" | "UNREAD">("ALL");

  const { language, setLanguage, t, availableLanguages } = useTranslation();

  // Container refs for detecting clicks outside
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Sync notifications from enterprise event stream
  useEffect(() => {
    setNotifications(getNotifications());
    const handleUpdate = () => {
      setNotifications(getNotifications());
    };
    window.addEventListener("onboardx-notifications-updated", handleUpdate);
    return () => window.removeEventListener("onboardx-notifications-updated", handleUpdate);
  }, []);

  // Close drawers and dropdowns on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsRoleDropdownOpen(false);
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
    setIsLanguageOpen(false);
    setIsMoreOpen(false);
  }, [pathname]);

  // Handle outside clicks and Escape key to close open popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(target)) {
        setIsRoleDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(target)) {
        setIsLanguageOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(target)) {
        setIsMoreOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsRoleDropdownOpen(false);
        setIsLanguageOpen(false);
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
        setIsMoreOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleRoleSelect = (role: RoleType) => {
    switchRole(role);
    setIsRoleDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    localStorage.removeItem("onboardx_current_role");
    setIsProfileOpen(false);
    window.location.href = "/login";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    notifFilter === "ALL" ? notifications : notifications.filter((n) => !n.read);

  const formatTimeAgo = (isoStr: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
      if (diffSec < 60) return "Just now";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch (e) {
      return "Recently";
    }
  };

  // Primary top navigation links (always visible on desktop)
  const primaryNavLinks = [
    { href: "/dashboard", label: t("dashboard", "Dashboard"), shortLabel: t("dashboard", "Dashboard"), icon: LayoutDashboard },
    {
      href: "/portal",
      label: t("portal", "My Portal"),
      shortLabel: t("portal", "Portal"),
      icon: UserCheck,
      badge: currentRole === "EMPLOYEE" ? "Active" : undefined,
    },
    { href: "/employees", label: t("hires", "Hires"), shortLabel: t("hires", "Hires"), icon: Users },
    { href: "/compliance", label: t("compliance", "Compliance"), shortLabel: t("compliance", "Compliance"), icon: Shield, badge: "SOC2" },
    { href: "/requisitions", label: t("requisitions", "Requisitions"), shortLabel: "Reqs", icon: Briefcase, xlOnly: true },
  ];

  // Secondary tools housed in the sleek "More" dropdown
  const secondaryNavLinks = [
    { href: "/requisitions", label: t("requisitions", "Requisitions"), shortLabel: "Reqs", icon: Briefcase, desc: "Hiring requisitions & approval pipeline", xlHidden: true },
    { href: "/templates", label: t("workflows", "Workflows & Onboarding"), shortLabel: t("workflows", "Workflows"), icon: Workflow, desc: "Step-by-step pipeline configuration" },
    {
      href: "/assets",
      label: t("assets", "IT Assets & Hardware"),
      shortLabel: t("assets", "Assets"),
      icon: Laptop,
      badge: currentRole === "IT_PROVISIONER" ? "Queue" : undefined,
      desc: "Device allocation & asset tracking",
    },
    { href: "/documents", label: t("documents", "Digital Documents"), shortLabel: t("documents", "Docs"), icon: FileText, desc: "E-signatures & policy handbook" },
    { href: "/org-chart", label: t("orgChart", "Visual Org Chart"), shortLabel: t("orgChart", "Org Chart"), icon: Network, desc: "Hierarchy & reporting graph" },
    { href: "/ai", label: t("ai", "Enterprise AI Hub"), shortLabel: t("ai", "AI Hub"), icon: Bot, badge: "AI", desc: "Resume parsing & assistance bot" },
    { href: "/whistleblower", label: t("whistleblower", "Anonymous Whistleblower"), shortLabel: t("whistleblower", "Whistleblower"), icon: ShieldAlert, badge: "Zero-Knowledge", desc: "Encrypted compliance reporting" },
    { href: "/settings", label: t("settings", "System Settings"), shortLabel: t("settings", "Settings"), icon: Settings, desc: "Tenant config, SSO & custom fields" },
  ];

  const visiblePrimary = primaryNavLinks.filter((link) => isRouteAllowedForRole(currentRole, link.href));
  const visibleSecondary = secondaryNavLinks.filter((link) => isRouteAllowedForRole(currentRole, link.href));

  // Determine if any link in secondary is currently active
  const isSecondaryActive = visibleSecondary.some(
    (link) => pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
  );

  const activeSecondaryItem = visibleSecondary.find(
    (link) => pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#181D20]/95 backdrop-blur-md border-b border-[#D8DFDE] dark:border-graphite-borderDark shadow-subtle transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-2 lg:gap-3 xl:gap-5 min-w-0 shrink-0">
            <OnboardXLogo size="md" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 shrink-0">
              {visiblePrimary.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`items-center gap-1.5 px-2 xl:px-2.5 py-1.5 text-xs font-headline font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      link.xlOnly ? "hidden xl:inline-flex" : "inline-flex"
                    } ${
                      isActive
                        ? "bg-pine dark:bg-pine-600 text-ivory font-semibold shadow-subtle"
                        : "text-graphite dark:text-gray-300 hover:bg-mist dark:hover:bg-graphite-dark hover:text-pine dark:hover:text-amberSignal"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden 2xl:inline">{link.label}</span>
                    <span className="2xl:hidden">{link.shortLabel}</span>
                    {link.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amberSignal text-white leading-none whitespace-nowrap shrink-0">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* "More Tools" Dropdown for secondary items */}
              {visibleSecondary.length > 0 && (
                <div className="relative shrink-0" ref={moreDropdownRef}>
                  <button
                    onClick={() => {
                      setIsMoreOpen(!isMoreOpen);
                      setIsRoleDropdownOpen(false);
                      setIsNotificationOpen(false);
                      setIsProfileOpen(false);
                      setIsLanguageOpen(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 text-xs font-headline font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      isSecondaryActive
                        ? "bg-pine/10 dark:bg-pine/30 text-pine dark:text-amberSignal font-semibold border border-pine/30"
                        : "text-graphite dark:text-gray-300 hover:bg-mist dark:hover:bg-graphite-dark"
                    }`}
                    aria-label="More Workspaces"
                  >
                    {activeSecondaryItem ? (
                      <>
                        <activeSecondaryItem.icon className="w-3.5 h-3.5 text-pine dark:text-amberSignal shrink-0" />
                        <span className="hidden 2xl:inline">{activeSecondaryItem.shortLabel}</span>
                        <span className="2xl:hidden">{t("more", "More")}</span>
                      </>
                    ) : (
                      <>
                        <MoreHorizontal className="w-3.5 h-3.5 shrink-0" />
                        <span>{t("more", "More")}</span>
                      </>
                    )}
                    <ChevronDown className="w-3 h-3 text-graphite-muted transition-transform" />
                  </button>

                  {isMoreOpen && (
                    <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white dark:bg-graphite-cardDark border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-graphite-muted dark:text-gray-400 border-b border-mist-dark dark:border-graphite-borderDark mb-1">
                        Enterprise Modules
                      </div>
                      <div className="space-y-0.5 max-h-[70vh] overflow-y-auto">
                        {visibleSecondary.map((link) => {
                          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.href + (link.xlHidden ? "_mob" : "")}
                              href={link.href}
                              onClick={() => setIsMoreOpen(false)}
                              className={`flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                                link.xlHidden ? "xl:hidden" : ""
                              } ${
                                isActive
                                  ? "bg-pine text-ivory font-semibold shadow-xs"
                                  : "hover:bg-mist dark:hover:bg-graphite-dark text-graphite dark:text-gray-300"
                              }`}
                            >
                              <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
                                isActive ? "bg-white/20 text-ivory" : "bg-mist dark:bg-graphite-dark text-pine dark:text-amberSignal"
                              }`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-semibold truncate">{link.label}</span>
                                  {link.badge && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none shrink-0 ${
                                      isActive ? "bg-white text-pine" : "bg-amberSignal text-white"
                                    }`}>
                                      {link.badge}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-[11px] truncate leading-tight ${isActive ? "text-ivory/80" : "text-graphite-muted dark:text-gray-400"}`}>
                                  {link.desc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 shrink-0">
            {/* Real-time 8-Language Switcher Dropdown */}
            <div className="relative shrink-0" ref={languageDropdownRef}>
              <button
                onClick={() => {
                  setIsLanguageOpen(!isLanguageOpen);
                  setIsRoleDropdownOpen(false);
                  setIsNotificationOpen(false);
                  setIsProfileOpen(false);
                  setIsMoreOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-cardDark hover:bg-mist dark:hover:bg-graphite-dark transition-colors cursor-pointer text-xs"
                title="Change display language in real time"
              >
                <Globe className="w-3.5 h-3.5 text-pine dark:text-amberSignal shrink-0" />
                <span className="font-mono font-bold uppercase text-[11px] text-graphite dark:text-ivory">
                  {language}
                </span>
                <ChevronDown className="w-3 h-3 text-graphite-muted" />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-graphite-cardDark border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2 py-1 border-b border-mist-dark dark:border-graphite-borderDark text-[10px] font-bold text-graphite-muted uppercase tracking-wider flex items-center justify-between">
                    <span>{t("language", "Language")}</span>
                    <span className="font-mono text-[9px] text-forest">8 Languages</span>
                  </div>
                  <div className="space-y-0.5 mt-1 max-h-64 overflow-y-auto pr-0.5">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          language === lang.code
                            ? "bg-pine text-ivory font-bold shadow-xs"
                            : "hover:bg-mist dark:hover:bg-graphite-dark text-graphite dark:text-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            language === lang.code ? "bg-white/20 text-ivory" : "bg-mist dark:bg-graphite-dark text-graphite dark:text-gray-300"
                          }`}>
                            {lang.code.toUpperCase()}
                          </span>
                          <span className="font-medium">{lang.nativeName}</span>
                        </div>
                        {language === lang.code && (
                          <CheckCheck className="w-3.5 h-3.5 text-ivory shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Slack / Teams Enterprise Bot Preview Button */}
            <button
              onClick={() => setIsSlackModalOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-[#4A154B]/30 dark:border-purple-800 bg-[#4A154B]/10 dark:bg-purple-950/30 text-[#4A154B] dark:text-purple-300 hover:bg-[#4A154B]/20 transition-colors cursor-pointer text-xs font-semibold shrink-0"
              title="Slack & Teams Approvals Bot"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#4A154B] dark:text-purple-300 shrink-0" />
              <span className="hidden xl:inline">{t("slackBot", "Slack Bot")}</span>
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* 1-Click Role Switcher Dropdown */}
            <div className="relative hidden sm:block shrink-0" ref={roleDropdownRef}>
              <button
                onClick={() => {
                  setIsRoleDropdownOpen(!isRoleDropdownOpen);
                  setIsNotificationOpen(false);
                  setIsProfileOpen(false);
                  setIsLanguageOpen(false);
                  setIsMoreOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 xl:px-2.5 rounded-lg border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-cardDark hover:bg-mist dark:hover:bg-graphite-dark transition-colors cursor-pointer text-xs whitespace-nowrap shrink-0"
                title="Switch active user persona for demo testing"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-pine dark:text-amberSignal shrink-0" />
                  <span className="hidden 2xl:inline text-graphite-muted dark:text-gray-400">{t("role", "Role")}:</span>
                  <span className="font-semibold font-headline text-pine dark:text-ivory">
                    {currentRole.replace("_", " ")}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-graphite-muted dark:text-gray-400 shrink-0" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-graphite-cardDark border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-mist-dark dark:border-graphite-borderDark text-[11px] font-semibold text-graphite-muted dark:text-gray-400 uppercase tracking-wider">
                    Switch Test Persona & Role
                  </div>
                  <div className="space-y-1 mt-1">
                    {(Object.keys(DEMO_USERS) as RoleType[]).map((roleKey) => {
                      const user = DEMO_USERS[roleKey];
                      const isSelected = currentRole === roleKey;

                      return (
                        <button
                          key={roleKey}
                          onClick={() => handleRoleSelect(roleKey)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-pine/10 dark:bg-pine/30 text-pine dark:text-ivory font-semibold border border-pine/20 dark:border-pine/40"
                              : "hover:bg-mist dark:hover:bg-graphite-dark text-graphite dark:text-gray-300"
                          }`}
                        >
                          <div>
                            <div className="font-medium text-graphite dark:text-ivory">{user.name}</div>
                            <div className="text-[11px] text-graphite-muted dark:text-gray-400">{user.title}</div>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-mist dark:bg-graphite-dark text-graphite-muted dark:text-gray-400">
                            {roleKey.replace("_", " ")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell with Rich Dropdown Popover */}
            <div className="relative shrink-0" ref={notifDropdownRef}>
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsRoleDropdownOpen(false);
                  setIsProfileOpen(false);
                  setIsLanguageOpen(false);
                  setIsMoreOpen(false);
                }}
                className="relative p-1.5 sm:p-2 rounded-lg text-graphite-muted dark:text-gray-300 hover:text-pine dark:hover:text-amberSignal hover:bg-mist dark:hover:bg-graphite-dark transition-colors cursor-pointer shrink-0"
                title="Activity & Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amberSignal ring-2 ring-white dark:ring-graphite-cardDark animate-pulse" />
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-graphite-cardDark border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-mist-dark dark:border-graphite-borderDark">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-headline text-graphite dark:text-ivory">
                        Activity & Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amberSignal text-white leading-none">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllNotificationsAsRead()}
                          className="text-[10px] font-semibold text-pine dark:text-amberSignal hover:underline flex items-center gap-1 cursor-pointer"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Mark All Read</span>
                        </button>
                      )}
                      <button
                        onClick={() => clearAllNotifications()}
                        className="text-[10px] text-graphite-muted dark:text-gray-400 hover:text-brick flex items-center gap-1 cursor-pointer"
                        title="Clear all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2 pt-2 pb-1 text-[11px]">
                    <button
                      onClick={() => setNotifFilter("ALL")}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        notifFilter === "ALL"
                          ? "bg-pine text-ivory font-bold"
                          : "text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
                      }`}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotifFilter("UNREAD")}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        notifFilter === "UNREAD"
                          ? "bg-pine text-ivory font-bold"
                          : "text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
                      }`}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="mt-2 space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-graphite-muted dark:text-gray-400">
                        No notifications in this view.
                      </div>
                    ) : (
                      filteredNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.link) {
                              setIsNotificationOpen(false);
                            }
                          }}
                          className={`p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                            notif.read
                              ? "bg-mist/30 dark:bg-graphite-dark/30 border-transparent hover:bg-mist dark:hover:bg-graphite-dark text-graphite-muted dark:text-gray-400"
                              : "bg-white dark:bg-graphite-dark border-pine/20 dark:border-amberSignal/20 shadow-subtle text-graphite dark:text-ivory"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded-md bg-mist dark:bg-graphite-cardDark text-pine dark:text-amberSignal shrink-0 mt-0.5">
                              {notif.type === "hardware" && <Laptop className="w-3.5 h-3.5" />}
                              {notif.type === "document" && <FileText className="w-3.5 h-3.5" />}
                              {notif.type === "employee" && <UserCheck className="w-3.5 h-3.5" />}
                              {notif.type === "audit" && <Shield className="w-3.5 h-3.5 text-forest" />}
                              {notif.type === "system" && <Sparkles className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold font-headline truncate">{notif.title}</span>
                                {!notif.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amberSignal shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] leading-tight text-graphite-muted dark:text-gray-400 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <span className="text-[9px] text-graphite-muted dark:text-gray-500 font-mono mt-1 inline-block">
                                {formatTimeAgo(notif.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active User Profile Dropdown */}
            <div className="relative hidden lg:block shrink-0" ref={profileDropdownRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationOpen(false);
                  setIsRoleDropdownOpen(false);
                  setIsLanguageOpen(false);
                  setIsMoreOpen(false);
                }}
                className="flex items-center gap-2 pl-2 border-l border-mist-dark dark:border-graphite-borderDark shrink-0 hover:opacity-85 transition-opacity cursor-pointer"
                title="View user profile & session options"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg object-cover border border-[#D0D8D7] dark:border-graphite-borderDark shrink-0"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-forest ring-2 ring-white dark:ring-graphite-cardDark" />
                </div>
                <div className="hidden xl:block text-left whitespace-nowrap">
                  <div className="text-xs font-semibold font-headline text-graphite dark:text-ivory leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-graphite-muted dark:text-gray-400 leading-tight">
                    {currentUser.title.split(" ")[0]}
                  </div>
                </div>
                <ChevronDown className="hidden xl:block w-3 h-3 text-graphite-muted dark:text-gray-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-graphite-cardDark border border-[#D8DFDE] dark:border-graphite-borderDark shadow-elevation p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Profile Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-mist-dark dark:border-graphite-borderDark">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-xl object-cover border border-mist-dark dark:border-graphite-borderDark"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold font-headline text-graphite dark:text-ivory truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-graphite-muted dark:text-gray-400 truncate">
                        {currentUser.email}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-pine/10 dark:bg-pine/30 text-pine dark:text-amberSignal border border-pine/20">
                          {currentUser.role.replace("_", " ")}
                        </span>
                        <span className="text-[9px] font-mono text-forest">● Active SSO</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="py-2.5 space-y-1 text-xs text-graphite dark:text-gray-300">
                    <div className="text-[10px] text-graphite-muted dark:text-gray-400 font-semibold uppercase tracking-wider px-2 py-1">
                      Organization & Identity
                    </div>
                    <div className="px-2 py-1 rounded-lg bg-mist/40 dark:bg-graphite-dark/40 flex items-center justify-between text-[11px]">
                      <span className="text-graphite-muted dark:text-gray-400">Tenant:</span>
                      <span className="font-semibold text-graphite dark:text-ivory">Acme Enterprises SME</span>
                    </div>
                    <div className="px-2 py-1 rounded-lg bg-mist/40 dark:bg-graphite-dark/40 flex items-center justify-between text-[11px]">
                      <span className="text-graphite-muted dark:text-gray-400">Position:</span>
                      <span className="font-semibold text-graphite dark:text-ivory truncate max-w-[140px]">{currentUser.title}</span>
                    </div>
                    <div className="px-2 py-1 rounded-lg bg-mist/40 dark:bg-graphite-dark/40 flex items-center justify-between text-[11px]">
                      <span className="text-graphite-muted dark:text-gray-400">Security:</span>
                      <span className="font-semibold text-forest">SOC2 Verified Session</span>
                    </div>
                  </div>

                  {/* Quick Navigation Links */}
                  <div className="pt-2 border-t border-mist-dark dark:border-graphite-borderDark space-y-1">
                    <Link
                      href="/portal"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-mist dark:hover:bg-graphite-dark text-graphite dark:text-gray-300 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
                      <span>My Onboarding Portal</span>
                    </Link>
                    <Link
                      href="/whistleblower"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-mist dark:hover:bg-graphite-dark text-graphite dark:text-gray-300 transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-steelBlue" />
                      <span>Anonymous Whistleblower</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-mist dark:hover:bg-graphite-dark text-graphite dark:text-gray-300 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-graphite-muted dark:text-gray-400" />
                      <span>Settings & Compliance</span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-2 mt-2 border-t border-mist-dark dark:border-graphite-borderDark">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-brick hover:bg-brick/10 transition-colors cursor-pointer font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t("logout", "Log Out")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-graphite dark:text-ivory hover:bg-mist dark:hover:bg-graphite-cardDark transition-colors cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#181D20] border-b border-[#D8DFDE] dark:border-graphite-borderDark px-4 pt-3 pb-6 space-y-4 shadow-elevation animate-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
          {/* Mobile Persona Switcher */}
          <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-cardDark border border-[#D8DFDE] dark:border-graphite-borderDark space-y-2">
            <div className="flex items-center justify-between text-xs font-bold font-headline text-graphite dark:text-ivory">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
                <span>Active Role Persona</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-pine text-ivory font-bold">
                {currentRole.replace("_", " ")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {(Object.keys(DEMO_USERS) as RoleType[]).map((roleKey) => (
                <button
                  key={roleKey}
                  onClick={() => handleRoleSelect(roleKey)}
                  className={`p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    currentRole === roleKey
                      ? "bg-pine text-ivory font-bold shadow-xs"
                      : "bg-white dark:bg-graphite-dark text-graphite dark:text-gray-300 border border-mist-dark dark:border-graphite-borderDark"
                  }`}
                >
                  <div className="truncate font-semibold">{DEMO_USERS[roleKey].name}</div>
                  <div className="text-[10px] opacity-80 truncate">{roleKey.replace("_", " ")}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Language Selector Chips */}
          <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-cardDark border border-[#D8DFDE] dark:border-graphite-borderDark space-y-2">
            <div className="flex items-center justify-between text-xs font-bold font-headline text-graphite dark:text-ivory">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
                <span>Display Language</span>
              </span>
              <span className="text-[10px] font-mono text-graphite-muted dark:text-gray-400">
                {language.toUpperCase()} active
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-1.5 rounded-lg text-center text-xs transition-colors cursor-pointer ${
                    language === lang.code
                      ? "bg-pine text-ivory font-bold shadow-xs"
                      : "bg-white dark:bg-graphite-dark text-graphite dark:text-gray-300 border border-mist-dark dark:border-graphite-borderDark"
                  }`}
                >
                  <div className="font-mono font-bold text-[11px] uppercase">{lang.code}</div>
                  <div className="text-[9px] truncate opacity-80">{lang.nativeName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Slack Bot Quick Launch */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSlackModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#4A154B]/30 bg-[#4A154B]/10 text-[#4A154B] dark:text-purple-300 font-semibold text-xs cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Launch Slack / Teams Approvals Bot</span>
          </button>

          {/* Mobile Profile & Logout */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-mist/50 dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark">
            <div className="flex items-center gap-2">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div>
                <div className="text-xs font-bold text-graphite dark:text-ivory">{currentUser.name}</div>
                <div className="text-[10px] text-graphite-muted dark:text-gray-400">{currentUser.title}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-brick hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>{t("logout", "Log Out")}</span>
            </button>
          </div>

          {/* Categorized Mobile Navigation Links */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-graphite-muted dark:text-gray-400 px-1 mb-1.5">
                Core Workspaces
              </div>
              <div className="grid grid-cols-2 gap-2">
                {visiblePrimary.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-headline font-medium transition-colors ${
                        isActive
                          ? "bg-pine text-ivory font-bold shadow-subtle"
                          : "bg-ivory dark:bg-graphite-cardDark text-graphite dark:text-gray-300 border border-mist-dark dark:border-graphite-borderDark hover:bg-mist dark:hover:bg-graphite-dark"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-graphite-muted dark:text-gray-400 px-1 mb-1.5">
                Operations & Tools
              </div>
              <div className="grid grid-cols-2 gap-2">
                {visibleSecondary.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-headline font-medium transition-colors ${
                        isActive
                          ? "bg-pine text-ivory font-bold shadow-subtle"
                          : "bg-ivory dark:bg-graphite-cardDark text-graphite dark:text-gray-300 border border-mist-dark dark:border-graphite-borderDark hover:bg-mist dark:hover:bg-graphite-dark"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      </header>

      {/* Interactive Slack Enterprise Bot Modal */}
      <SlackBotModal
        isOpen={isSlackModalOpen}
        onClose={() => setIsSlackModalOpen(false)}
      />
    </>
  );
}
