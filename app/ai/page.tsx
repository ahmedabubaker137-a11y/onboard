"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notifyDataChanged } from "@/lib/events";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  Bot,
  FileSearch,
  Sparkles,
  Send,
  Upload,
  CheckCircle2,
  ShieldCheck,
  User,
  Mail,
  Copy,
  Check,
  ArrowRight,
  Cpu,
  Laptop,
  CheckSquare,
  DollarSign,
  Lock,
  TrendingUp,
} from "lucide-react";

export default function AIHubPage() {
  const [activeTab, setActiveTab] = useState<"BOT" | "OCR" | "WELCOME" | "PROVISIONING">("BOT");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chatbot State
  const [messages, setMessages] = useState([
    {
      id: "m1",
      sender: "bot",
      text: "Hello! I am your OnboardX AI Assistant. I have indexed Acme's employee handbook, IT security policies, benefits, and payroll schedules. Ask me anything about your first 30 days!",
      timestamp: "10:00 AM",
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);

  // OCR Hub State
  const [selectedDocType, setSelectedDocType] = useState<"PASSPORT" | "DRIVERS_LICENSE">("PASSPORT");
  const [isParsing, setIsParsing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    firstName: string;
    lastName: string;
    docNumber: string;
    dob: string;
    expiry: string;
    nationality: string;
    confidence: number;
  } | null>(null);

  // Welcome Generator State
  const [welcomeRole, setWelcomeRole] = useState("Staff Distributed Systems Engineer");
  const [welcomeName, setWelcomeName] = useState("Kaelen Chen");
  const [welcomeEmail, setWelcomeEmail] = useState("kaelen.chen@acme-enterprises.com");
  const [generatedWelcome, setGeneratedWelcome] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // AI Provisioning Recommender State
  const [provisionRole, setProvisionRole] = useState("Staff Distributed Systems Engineer");
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendedStack, setRecommendedStack] = useState<{
    hardware: string[];
    software: string[];
    compliance: string[];
  } | null>(null);
  const [isProvisioned, setIsProvisioned] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // FAQ answers
  const FAQ_RESPONSES: Record<string, string> = {
    payday:
      "Acme Technologies distributes payroll semi-monthly on the 15th and the final business day of each month via direct deposit. Your first payroll deposit will be processed on October 15th.",
    vpn: "To configure the Acme internal VPN: 1) Open the pre-installed WireGuard client on your managed MacBook, 2) Retrieve credentials from your 1Password 'Acme Engineering' vault, and 3) Authenticate with your hardware YubiKey 5C NFC token.",
    "401k":
      "Acme matches 100% of employee 401(k) contributions up to 5% of your base salary via Vanguard. Vesting is 100% immediate from day one. You can manage allocations in your Benefits portal tab.",
    equipment:
      "Standard engineering equipment includes a 16-inch MacBook Pro M3 Max, Dell 32-inch 4K UltraSharp monitor, and YubiKey. If you require an ergonomic keyboard or additional dongles, submit a ticket in the IT Support tab.",
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim()) return;

    const userText = inputQuestion;
    const userMsg = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setIsBotThinking(true);

    setTimeout(() => {
      let botAnswer =
        "I've searched Acme's HR policies: Your direct hiring manager Sofia Calderon and our People Operations partner Marcus Thorne are available for any specific questions. You can also review your full checklist in the New Hire Portal!";

      const lower = userText.toLowerCase();
      if (lower.includes("pay") || lower.includes("salary") || lower.includes("when do i get paid")) {
        botAnswer = FAQ_RESPONSES.payday;
      } else if (lower.includes("vpn") || lower.includes("network") || lower.includes("tunnel")) {
        botAnswer = FAQ_RESPONSES.vpn;
      } else if (lower.includes("401") || lower.includes("retirement") || lower.includes("match")) {
        botAnswer = FAQ_RESPONSES["401k"];
      } else if (lower.includes("equipment") || lower.includes("laptop") || lower.includes("monitor")) {
        botAnswer = FAQ_RESPONSES.equipment;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `b_${Date.now()}`,
          sender: "bot",
          text: botAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsBotThinking(false);
    }, 600);
  };

  const handleSimulateOCR = () => {
    setIsParsing(true);
    setExtractedData(null);
    setIsSynced(false);

    setTimeout(() => {
      if (selectedDocType === "PASSPORT") {
        setExtractedData({
          firstName: "KAELEN",
          lastName: "CHEN",
          docNumber: "USA-98421034-P",
          dob: "1994-06-12",
          expiry: "2034-06-11",
          nationality: "United States (USA)",
          confidence: 99.4,
        });
      } else {
        setExtractedData({
          firstName: "MAYA",
          lastName: "LIN",
          docNumber: "DL-CA-449102-X",
          dob: "1996-11-24",
          expiry: "2029-11-23",
          nationality: "United States (CA)",
          confidence: 98.7,
        });
      }
      setIsParsing(false);
    }, 800);
  };

  const handleSyncToProfile = async () => {
    if (!extractedData) return;

    try {
      await fetch("/api/v1/employees/emp_kaelen_01", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: extractedData.firstName.charAt(0) + extractedData.firstName.slice(1).toLowerCase(),
          lastName: extractedData.lastName.charAt(0) + extractedData.lastName.slice(1).toLowerCase(),
        }),
      });

      await fetch("/api/v1/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorEmail: "marcus.thorne@acme-enterprises.com",
          actorRole: "HR_MANAGER",
          action: "I9_VERIFICATION_SYNCED",
          targetType: "Employee",
          targetId: "emp_kaelen_01",
          metadata: { docNumber: extractedData.docNumber, confidence: extractedData.confidence },
        }),
      });
    } catch (e) {
      console.error("Failed to sync I-9 to employee record:", e);
    }

    setIsSynced(true);
    notifyDataChanged("employee", { employeeId: "emp_kaelen_01", action: "sync_i9" });
    showToast(`Synced verified I-9 document data (${extractedData.docNumber}) to employee record.`);
  };

  const handleGenerateWelcome = () => {
    setGeneratedWelcome(
      `Subject: Welcome to the Engineering Team at Acme, ${welcomeName}!\n\nHi ${welcomeName},\n\nWe are absolutely delighted to welcome you to Acme Technologies as our new ${welcomeRole}!\n\nYour proven background in distributed systems and cloud infrastructure makes you an invaluable addition to Sofia Calderon's team. Your pre-configured 16" MacBook Pro and hardware security tokens are en route, and your personalized onboarding roadmap is ready in OnboardX.\n\nPlease take a look at your Day 1 checklist, and we look forward to meeting you on Monday morning!\n\nWarm regards,\nMarcus Thorne\nDirector of People & Culture, Acme Technologies`
    );
    setIsSent(false);
  };

  const copyToClipboard = () => {
    if (!generatedWelcome) return;
    navigator.clipboard.writeText(generatedWelcome);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast("Welcome letter copied to clipboard.");
  };

  const handleSendWelcomeEmail = async () => {
    if (!generatedWelcome) return;

    try {
      await fetch("/api/v1/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorEmail: "marcus.thorne@acme-enterprises.com",
          actorRole: "HR_MANAGER",
          action: "WELCOME_EMAIL_DISPATCHED",
          targetType: "Employee",
          targetId: "emp_kaelen_01",
          metadata: { recipient: welcomeEmail, recipientName: welcomeName },
        }),
      });
    } catch (e) {
      console.error("Failed to log welcome email dispatch:", e);
    }

    setIsSent(true);
    showToast(`Welcome email successfully dispatched to ${welcomeEmail} via SMTP relay.`);
  };

  const handleRecommendStack = () => {
    setIsRecommending(true);
    setIsProvisioned(false);

    setTimeout(() => {
      if (provisionRole.includes("Engineer")) {
        setRecommendedStack({
          hardware: [
            "Apple MacBook Pro 16\" (M3 Max / 64GB / 1TB)",
            "Dell UltraSharp 32\" 4K USB-C Hub Monitor",
            "YubiKey 5C NFC Dual Hardware Security Keys",
          ],
          software: [
            "GitHub Enterprise Cloud (Full Repo & Actions Access)",
            "AWS Staging & Development Sandbox IAM Access",
            "1Password Enterprise Engineering Team Vault",
            "Datadog Log Streaming & APM APM Token",
          ],
          compliance: [
            "SOC2 Type II Confidentiality Agreement",
            "Remote Hardware Custody & Encryption Rider",
          ],
        });
      } else {
        setRecommendedStack({
          hardware: [
            "Apple MacBook Pro 14\" (M3 Pro / 36GB / 512GB)",
            "LG UltraFine 27\" 4K Ergonomic Monitor",
            "YubiKey 5C NFC Token",
          ],
          software: [
            "Figma Professional Enterprise Design System Seat",
            "Salesforce Enterprise CRM License",
            "Google Workspace Enterprise Standard",
          ],
          compliance: [
            "Proprietary Information & Inventions Agreement (PIIA)",
            "GDPR PII Data Handling Protocol Certification",
          ],
        });
      }
      setIsRecommending(false);
    }, 600);
  };

  const handleApproveAutoProvision = async () => {
    if (!recommendedStack) return;

    try {
      await fetch("/api/v1/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorEmail: "devon.reed@acme-enterprises.com",
          actorRole: "IT_PROVISIONER",
          action: "AI_AUTO_PROVISIONING_APPROVED",
          targetType: "CohortProvisioning",
          targetId: `role_${Date.now()}`,
          metadata: {
            role: provisionRole,
            hardwareCount: recommendedStack.hardware.length,
            softwareCount: recommendedStack.software.length,
          },
        }),
      });
    } catch (e) {
      console.error("Failed to log auto provisioning approval:", e);
    }

    setIsProvisioned(true);
    notifyDataChanged("asset", { action: "ai_provision", role: provisionRole });
    showToast(`Auto-provisioning pipeline executed for ${provisionRole}. Tickets & accounts dispatched.`);
  };

  return (
    <RoleGuard
      allowedRoles={["ADMIN", "HR_MANAGER"]}
      moduleName="AI Automation & Intelligence Hub"
      description="Document OCR parsing, automated welcome generators, and cohort provisioning intelligence are restricted to HR Managers and Administrators."
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-headline text-graphite dark:text-ivory tracking-tight">
              OnboardX AI Hub
            </h1>
            <Badge variant="amber">Vision OCR & NLP Intelligence</Badge>
          </div>
          <p className="text-xs text-graphite-muted dark:text-gray-400 mt-1">
            Automating new-hire document extraction, 24/7 policy support, and personalized welcome messaging.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D8DFDE] dark:border-graphite-borderDark gap-4 text-xs font-headline font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("BOT")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "BOT"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>24/7 AI New-Hire Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab("OCR")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "OCR"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>Smart Document Parsing (OCR)</span>
        </button>

        <button
          onClick={() => setActiveTab("WELCOME")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "WELCOME"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Automated Welcome Emails</span>
        </button>

        <button
          onClick={() => setActiveTab("PROVISIONING")}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "PROVISIONING"
              ? "border-pine dark:border-amberSignal text-pine dark:text-amberSignal"
              : "border-transparent text-graphite-muted dark:text-gray-400 hover:text-graphite dark:hover:text-ivory"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AI Tech Stack Provisioner</span>
        </button>
      </div>

      {/* TAB 1: AI Chatbot */}
      {activeTab === "BOT" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[520px] flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pine dark:bg-pine-600 text-ivory flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Acme AI Onboarding Companion</CardTitle>
                    <CardDescription>Trained on Acme Handbook, Payroll & IT SOPs</CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Message Scroll */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                        m.sender === "user"
                          ? "bg-pine dark:bg-[#32615E] text-ivory font-medium"
                          : "bg-mist dark:bg-graphite-dark text-graphite dark:text-ivory border border-mist-dark dark:border-graphite-borderDark"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-graphite-muted dark:text-gray-400 mt-1 px-1">{m.timestamp}</span>
                  </div>
                ))}

                {isBotThinking && (
                  <div className="flex items-center gap-2 text-graphite-muted dark:text-gray-400 text-xs p-2">
                    <div className="w-2 h-2 rounded-full bg-pine dark:bg-amberSignal animate-ping" />
                    <span>Searching Acme knowledge base...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E3ECEB] dark:border-graphite-borderDark flex gap-2">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder="Ask a question (e.g. 'When is payday?', 'How do I setup VPN?')..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory placeholder:text-graphite-muted dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none focus:ring-1 focus:ring-pine dark:focus:ring-amberSignal transition-colors"
                />
                <Button size="sm" variant="primary" type="submit" className="h-9 px-4">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </Card>
          </div>

          {/* Suggested Queries */}
          <div className="space-y-4">
            <Card className="p-5 space-y-3">
              <h4 className="font-semibold font-headline text-xs text-graphite dark:text-ivory uppercase tracking-wider">
                Suggested New-Hire Inquiries
              </h4>
              <p className="text-[11px] text-graphite-muted dark:text-gray-400 leading-relaxed">
                Click any prompt below to test the AI answer engine against SME policies:
              </p>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => setInputQuestion("When is my first payday and how is it paid?")}
                  className="w-full flex items-center gap-2 text-left p-2.5 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark hover:border-pine/40 dark:hover:border-pine hover:bg-white dark:hover:bg-graphite-cardDark text-graphite dark:text-ivory transition-colors cursor-pointer text-xs group"
                >
                  <DollarSign className="w-3.5 h-3.5 text-forest shrink-0" />
                  <span>When is my first payday?</span>
                </button>
                <button
                  onClick={() => setInputQuestion("How do I setup the corporate VPN with YubiKey?")}
                  className="w-full flex items-center gap-2 text-left p-2.5 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark hover:border-pine/40 dark:hover:border-pine hover:bg-white dark:hover:bg-graphite-cardDark text-graphite dark:text-ivory transition-colors cursor-pointer text-xs group"
                >
                  <Lock className="w-3.5 h-3.5 text-steelBlue shrink-0" />
                  <span>How do I setup the corporate VPN?</span>
                </button>
                <button
                  onClick={() => setInputQuestion("What is the 401(k) company matching percentage?")}
                  className="w-full flex items-center gap-2 text-left p-2.5 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark hover:border-pine/40 dark:hover:border-pine hover:bg-white dark:hover:bg-graphite-cardDark text-graphite dark:text-ivory transition-colors cursor-pointer text-xs group"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amberSignal shrink-0" />
                  <span>What is the 401(k) company match?</span>
                </button>
                <button
                  onClick={() => setInputQuestion("How do I request additional monitor or accessories?")}
                  className="w-full flex items-center gap-2 text-left p-2.5 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark hover:border-pine/40 dark:hover:border-pine hover:bg-white dark:hover:bg-graphite-cardDark text-graphite dark:text-ivory transition-colors cursor-pointer text-xs group"
                >
                  <Laptop className="w-3.5 h-3.5 text-pine dark:text-amberSignal shrink-0" />
                  <span>How do I request equipment?</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Smart OCR Hub */}
      {activeTab === "OCR" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div>
              <CardTitle className="text-base">Document Parsing & OCR Extraction</CardTitle>
              <CardDescription>
                Upload passport or government ID. AI reads identity fields and auto-populates employee I-9 records.
              </CardDescription>
            </div>

            <div className="flex gap-3 text-xs">
              <button
                onClick={() => {
                  setSelectedDocType("PASSPORT");
                  setExtractedData(null);
                  setIsSynced(false);
                }}
                className={`flex-1 p-2.5 rounded-xl border font-semibold transition-colors cursor-pointer ${
                  selectedDocType === "PASSPORT"
                    ? "bg-pine dark:bg-pine-600 text-ivory border-pine"
                    : "bg-ivory dark:bg-graphite-dark border-graphite-border dark:border-graphite-borderDark text-graphite dark:text-ivory"
                }`}
              >
                Sample US Passport
              </button>
              <button
                onClick={() => {
                  setSelectedDocType("DRIVERS_LICENSE");
                  setExtractedData(null);
                  setIsSynced(false);
                }}
                className={`flex-1 p-2.5 rounded-xl border font-semibold transition-colors cursor-pointer ${
                  selectedDocType === "DRIVERS_LICENSE"
                    ? "bg-pine dark:bg-pine-600 text-ivory border-pine"
                    : "bg-ivory dark:bg-graphite-dark border-graphite-border dark:border-graphite-borderDark text-graphite dark:text-ivory"
                }`}
              >
                Sample Driver's License
              </button>
            </div>

            <div className="border border-dashed border-pine/40 dark:border-pine/60 rounded-xl bg-ivory dark:bg-graphite-dark p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-pine/10 dark:bg-pine/30 text-pine dark:text-ivory mx-auto flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-graphite dark:text-ivory">
                Selected: {selectedDocType === "PASSPORT" ? "passport_scan_kaelen.jpg" : "drivers_license_maya.jpg"}
              </div>
              <p className="text-[11px] text-graphite-muted dark:text-gray-400">
                Vision OCR pipeline extracts text, checks expiry dates, and validates checksums.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSimulateOCR}
                isLoading={isParsing}
                className="mt-2 text-xs"
              >
                {isParsing ? "Extracting Fields..." : "Run AI OCR Extraction"}
              </Button>
            </div>
          </Card>

          {/* OCR Extracted Results Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Extracted Profile Form</CardTitle>
              {extractedData && (
                <div className="flex items-center gap-2">
                  <Badge variant="forest" size="sm">
                    Confidence {extractedData.confidence}%
                  </Badge>
                  {isSynced && (
                    <Badge variant="pine" size="sm">
                      Synced to Record
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <CardDescription>
              Auto-filled verified attributes ready to sync with payroll & HR records.
            </CardDescription>

            {extractedData ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark">
                    <span className="text-[10px] text-graphite-muted dark:text-gray-400 uppercase font-semibold">First Name</span>
                    <div className="font-bold text-graphite dark:text-ivory mt-0.5">{extractedData.firstName}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark">
                    <span className="text-[10px] text-graphite-muted dark:text-gray-400 uppercase font-semibold">Last Name</span>
                    <div className="font-bold text-graphite dark:text-ivory mt-0.5">{extractedData.lastName}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark">
                  <span className="text-[10px] text-graphite-muted dark:text-gray-400 uppercase font-semibold">
                    Document ID Number
                  </span>
                  <div className="font-mono font-bold text-pine dark:text-[#6BB3AF] mt-0.5">
                    {extractedData.docNumber}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark">
                    <span className="text-[10px] text-graphite-muted dark:text-gray-400 uppercase font-semibold">Date of Birth</span>
                    <div className="font-bold text-graphite dark:text-ivory mt-0.5">{extractedData.dob}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark">
                    <span className="text-[10px] text-graphite-muted dark:text-gray-400 uppercase font-semibold">Expiration Date</span>
                    <div className="font-bold text-graphite dark:text-ivory mt-0.5">{extractedData.expiry}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark">
                  <span className="text-[10px] text-graphite-muted dark:text-gray-400 uppercase font-semibold">Nationality</span>
                  <div className="font-bold text-graphite dark:text-ivory mt-0.5">{extractedData.nationality}</div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isSynced}
                    onClick={handleSyncToProfile}
                    className="text-xs"
                  >
                    {isSynced ? "Data Persisted to Profile" : "Sync to Employee Profile"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-graphite-muted dark:text-gray-400 border border-dashed border-[#D8DFDE] dark:border-graphite-borderDark rounded-xl p-6">
                <FileSearch className="w-8 h-8 text-graphite-muted/50 dark:text-gray-500 mb-2" />
                <span>Run extraction on the left to view auto-populated fields.</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: Automated Welcome Message Generator */}
      {activeTab === "WELCOME" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div>
              <CardTitle className="text-base">Personalized Welcome Email Generator</CardTitle>
              <CardDescription>
                LLM synthesizes role context, manager relationships, and equipment tracking into a warm greeting.
              </CardDescription>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Employee Full Name</label>
                <input
                  type="text"
                  value={welcomeName}
                  onChange={(e) => setWelcomeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  value={welcomeEmail}
                  onChange={(e) => setWelcomeEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Role Title</label>
                <input
                  type="text"
                  value={welcomeRole}
                  onChange={(e) => setWelcomeRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <Button size="sm" variant="primary" onClick={handleGenerateWelcome} className="text-xs">
                  Generate Personalized Welcome Email
                </Button>
              </div>
            </div>
          </Card>

          {/* Generated Result */}
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
                <CardTitle className="text-sm">Generated Welcome Letter</CardTitle>
                <div className="flex items-center gap-2">
                  {generatedWelcome && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyToClipboard}
                        className="h-7 text-[11px] gap-1"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-forest dark:text-[#38B38A]" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? "Copied" : "Copy"}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleSendWelcomeEmail}
                        className="h-7 text-[11px] gap-1"
                        disabled={isSent}
                      >
                        <Send className="w-3 h-3" />
                        <span>{isSent ? "Email Dispatched" : "Send via SMTP"}</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark text-xs font-mono text-graphite dark:text-ivory whitespace-pre-wrap leading-relaxed min-h-[220px]">
                {generatedWelcome || "Click 'Generate' to create a personalized onboarding invitation."}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: AI Tech Stack Provisioner */}
      {activeTab === "PROVISIONING" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <div>
              <CardTitle className="text-base">Role-Based Stack Recommender</CardTitle>
              <CardDescription>
                AI predicts required hardware models, cloud sandbox credentials, and SaaS tool permissions by job title.
              </CardDescription>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-ivory mb-1">Target Role Title</label>
                <select
                  value={provisionRole}
                  onChange={(e) => {
                    setProvisionRole(e.target.value);
                    setRecommendedStack(null);
                    setIsProvisioned(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-graphite-border dark:border-graphite-borderDark bg-ivory dark:bg-graphite-dark text-graphite dark:text-ivory focus:bg-white dark:focus:bg-graphite-cardDark focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="Staff Distributed Systems Engineer">Staff Distributed Systems Engineer (Engineering)</option>
                  <option value="Senior Product Designer">Senior Product Designer (Product & UX)</option>
                  <option value="Enterprise Account Executive">Enterprise Account Executive (Sales / GTM)</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleRecommendStack}
                  isLoading={isRecommending}
                  className="text-xs"
                >
                  Analyze Role & Recommend Stack
                </Button>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
                <div>
                  <CardTitle className="text-sm">Recommended Provisioning Matrix</CardTitle>
                  <span className="text-[11px] text-graphite-muted dark:text-gray-400 font-mono">
                    Target: {provisionRole}
                  </span>
                </div>
                {isProvisioned && (
                  <Badge variant="forest" size="sm">
                    Provisioned Successfully
                  </Badge>
                )}
              </div>

              {recommendedStack ? (
                <div className="mt-4 space-y-4 text-xs">
                  <div>
                    <h5 className="font-bold text-graphite dark:text-ivory flex items-center gap-1.5 mb-2">
                      <Laptop className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
                      <span>Hardware Allocations</span>
                    </h5>
                    <div className="space-y-1.5">
                      {recommendedStack.hardware.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark flex items-center justify-between">
                          <span>{item}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-graphite dark:text-ivory flex items-center gap-1.5 mb-2">
                      <CheckSquare className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
                      <span>Software SaaS Accounts</span>
                    </h5>
                    <div className="space-y-1.5">
                      {recommendedStack.software.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark flex items-center justify-between">
                          <span>{item}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-graphite dark:text-ivory flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-pine dark:text-amberSignal" />
                      <span>Compliance & Policy Riders</span>
                    </h5>
                    <div className="space-y-1.5">
                      {recommendedStack.compliance.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-ivory dark:bg-graphite-dark border border-mist-dark dark:border-graphite-borderDark flex items-center justify-between">
                          <span>{item}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-graphite-muted dark:text-gray-400 border border-dashed border-[#D8DFDE] dark:border-graphite-borderDark rounded-xl p-6 mt-4">
                  <Cpu className="w-8 h-8 text-graphite-muted/50 dark:text-gray-500 mb-2" />
                  <span>Select a role on the left and click 'Analyze' to generate provisioning recommendations.</span>
                </div>
              )}
            </div>

            {recommendedStack && (
              <div className="pt-4 mt-4 border-t border-[#E3ECEB] dark:border-graphite-borderDark flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleApproveAutoProvision}
                  disabled={isProvisioned}
                  className="text-xs"
                >
                  {isProvisioned ? "All Requirements Dispatched" : "1-Click Approve & Auto-Provision All"}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
      </div>
    </RoleGuard>
  );
}
