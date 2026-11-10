"use client";

import React from "react";
import Link from "next/link";
import { useRole } from "@/lib/use-role";
import { RoleType, DEMO_USERS } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ArrowLeft, ArrowRight, Lock, UserCheck } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: RoleType[];
  moduleName: string;
  description?: string;
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, moduleName, description, children }: RoleGuardProps) {
  const { currentRole, currentUser, switchRole, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-xs text-graphite-muted dark:text-gray-400 animate-pulse flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-pine border-t-transparent animate-spin" />
          <span>Verifying role authorization...</span>
        </div>
      </div>
    );
  }

  const isAllowed = allowedRoles.includes(currentRole);

  if (!isAllowed) {
    // Determine the user's primary authorized workspace
    let homeUrl = "/dashboard";
    let homeLabel = "Back to Dashboard";

    if (currentRole === "EMPLOYEE") {
      homeUrl = "/portal";
      homeLabel = "Return to My Onboarding Portal";
    } else if (currentRole === "IT_PROVISIONER") {
      homeUrl = "/assets";
      homeLabel = "Return to IT Assets Console";
    }

    const recommendedRole = allowedRoles[0];

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl border-2 border-clayGold/40 dark:border-clayGold/50 bg-white dark:bg-graphite-cardDark p-8 sm:p-10 shadow-elevation text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-clayGold/15 dark:bg-clayGold/25 text-[#8C620A] dark:text-amberSignal flex items-center justify-center mx-auto shadow-subtle">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-clayGold/10 dark:bg-clayGold/20 border border-clayGold/30 text-[11px] font-mono font-bold text-[#8C620A] dark:text-amberSignal">
              <Lock className="w-3 h-3" />
              <span>403 FORBIDDEN • RBAC ENFORCEMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline text-graphite dark:text-ivory tracking-tight">
              Access Restricted: {moduleName}
            </h1>
            <p className="text-xs sm:text-sm text-graphite-muted dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
              {description ||
                `According to Section 15 of the OnboardX Enterprise Security Specification, access to the ${moduleName} module is restricted to authorized roles.`}
            </p>
          </div>

          {/* Role Comparison Card */}
          <div className="p-4 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark max-w-lg mx-auto text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-mist-dark dark:border-graphite-borderDark">
              <span className="text-graphite-muted dark:text-gray-400">Your Current Persona:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-graphite dark:text-ivory">{currentUser.name}</span>
                <Badge variant="clay">{currentRole.replace("_", " ")}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-graphite-muted dark:text-gray-400">Authorized Roles:</span>
              <div className="flex flex-wrap gap-1">
                {allowedRoles.map((r) => (
                  <Badge key={r} variant="pine">
                    {r.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-graphite-muted dark:text-gray-400">
              <span>Security Rule:</span>
              <span className="font-mono">OnboardX.md §15 (User Roles)</span>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={homeUrl}>
              <Button variant="primary" size="md" className="gap-2 text-xs w-full sm:w-auto">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{homeLabel}</span>
              </Button>
            </Link>

            {recommendedRole && (
              <Button
                variant="outline"
                size="md"
                onClick={() => switchRole(recommendedRole)}
                className="gap-2 text-xs w-full sm:w-auto border-pine/30 hover:bg-mist dark:hover:bg-graphite-dark"
                title={`Switch active persona to ${DEMO_USERS[recommendedRole].name}`}
              >
                <UserCheck className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
                <span>Switch to {recommendedRole.replace("_", " ")} ({DEMO_USERS[recommendedRole].name.split(" ")[0]})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
