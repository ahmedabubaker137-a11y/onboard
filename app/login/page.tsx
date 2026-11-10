"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardXLogo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEMO_USERS, RoleType } from "@/lib/rbac";
import { Mail, ArrowRight, Shield, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSendMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setMagicLinkSent(true);
  };

  const handleQuickLogin = (role: RoleType) => {
    localStorage.setItem("onboardx_current_role", role);
    if (role === "EMPLOYEE") {
      router.push("/portal");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <OnboardXLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold font-headline text-graphite dark:text-ivory tracking-tight">
            Sign in to OnboardX
          </h1>
          <p className="text-xs text-graphite-muted dark:text-gray-400">
            Passwordless magic links for new hires and enterprise SSO for administrators.
          </p>
        </div>

        <Card className="p-6">
          <CardContent className="p-0 space-y-5">
            {magicLinkSent ? (
              <div className="p-4 rounded-xl border border-forest/30 bg-forest/5 dark:bg-forest/10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-forest dark:text-[#38B38A] mx-auto" />
                <h3 className="font-bold font-headline text-sm text-graphite dark:text-ivory">Magic Link Sent!</h3>
                <p className="text-xs text-graphite-muted dark:text-gray-400">
                  We sent a secure login link to <span className="font-semibold text-graphite dark:text-ivory">{email}</span>. Click it to access your portal immediately.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/portal")}
                  className="mt-3 text-xs"
                >
                  Enter Demo Portal Directly
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendMagicLink} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-graphite dark:text-ivory mb-1">Work Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-graphite-muted dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@acme-enterprises.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory placeholder:text-graphite-muted dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                    />
                  </div>
                </div>

                <Button size="md" variant="primary" type="submit" className="w-full text-xs">
                  <span>Send Passwordless Magic Link</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </form>
            )}

            <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#D8DFDE] dark:border-graphite-borderDark" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-semibold text-graphite-muted dark:text-gray-400 tracking-wider">
                <span className="bg-white dark:bg-[#1A1F22] px-2">1-Click Quick Demo Personas</span>
              </div>
            </div>

            {/* Quick Demo Personas Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickLogin("HR_MANAGER")}
                className="p-2.5 rounded-xl border border-mist-dark dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark hover:bg-white dark:hover:bg-graphite-cardDark hover:border-pine dark:hover:border-pine text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-graphite dark:text-ivory text-xs">Marcus Thorne</div>
                <div className="text-[10px] text-graphite-muted dark:text-gray-400">HR Manager</div>
              </button>

              <button
                onClick={() => handleQuickLogin("EMPLOYEE")}
                className="p-2.5 rounded-xl border border-mist-dark dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark hover:bg-white dark:hover:bg-graphite-cardDark hover:border-pine dark:hover:border-pine text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-graphite dark:text-ivory text-xs">Kaelen Chen</div>
                <div className="text-[10px] text-pine dark:text-amberSignal font-medium">New Hire (Staff Eng)</div>
              </button>

              <button
                onClick={() => handleQuickLogin("IT_PROVISIONER")}
                className="p-2.5 rounded-xl border border-mist-dark dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark hover:bg-white dark:hover:bg-graphite-cardDark hover:border-pine dark:hover:border-pine text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-graphite dark:text-ivory text-xs">Devon Reed</div>
                <div className="text-[10px] text-graphite-muted dark:text-gray-400">IT Lead</div>
              </button>

              <button
                onClick={() => handleQuickLogin("ADMIN")}
                className="p-2.5 rounded-xl border border-mist-dark dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark hover:bg-white dark:hover:bg-graphite-cardDark hover:border-pine dark:hover:border-pine text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-graphite dark:text-ivory text-xs">Eleanor Vance</div>
                <div className="text-[10px] text-graphite-muted dark:text-gray-400">Admin / COO</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
