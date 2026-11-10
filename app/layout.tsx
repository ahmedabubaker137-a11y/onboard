import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { OnboardXLogo } from "@/components/branding/logo";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "OnboardX | Enterprise Employee Onboarding Operating System",
  description:
    "Intelligent employee onboarding and HR portal for SMEs. Automating paperwork, equipment provisioning, and training checklists.",
  icons: {
    icon: [
      { url: "/onboardx-icon.ico" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/onboardx-icon.ico",
    apple: "/onboardx-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/x-icon" href="/onboardx-icon.ico" />
        <link rel="icon" type="image/png" href="/onboardx-logo.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/onboardx-logo.png" />
        {/* Anti-FOUC theme script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('onboardx_theme');
                  var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-ivory dark:bg-[#121517] text-graphite dark:text-[#F8F6F2] font-sans antialiased selection:bg-pine selection:text-ivory">
        <I18nProvider>
          <Navbar />
          <main className="flex-1 bg-ivory dark:bg-[#121517]">{children}</main>

        {/* Enterprise Architectural Footer */}
        <footer className="border-t border-[#D8DFDE] dark:border-graphite-borderDark bg-white dark:bg-[#161B1E] py-12 px-4 sm:px-6 lg:px-8 mt-12 transition-colors">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Top Footer: Single Clean Brand Entity */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E3ECEB] dark:border-graphite-borderDark">
              <div className="flex flex-col items-center md:items-start gap-3">
                <OnboardXLogo size="lg" showSubtitle />
                <p className="text-xs text-graphite-muted dark:text-gray-400 text-center md:text-left max-w-md">
                  The intelligent onboarding operating system designed to transform fragmented new-hire processes into structured momentum.
                </p>
              </div>

              {/* Navigation Columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
                <div>
                  <h4 className="font-bold font-headline text-graphite dark:text-ivory mb-2.5 uppercase tracking-wider text-[11px]">
                    Platform
                  </h4>
                  <ul className="space-y-2 text-graphite-muted dark:text-gray-400">
                    <li><Link href="/dashboard" className="hover:text-pine dark:hover:text-amberSignal transition-colors">HR Command</Link></li>
                    <li><Link href="/portal" className="hover:text-pine dark:hover:text-amberSignal transition-colors">New Hire Portal</Link></li>
                    <li><Link href="/templates" className="hover:text-pine dark:hover:text-amberSignal transition-colors">Workflow Engine</Link></li>
                    <li><Link href="/assets" className="hover:text-pine dark:hover:text-amberSignal transition-colors">IT Provisioning</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold font-headline text-graphite dark:text-ivory mb-2.5 uppercase tracking-wider text-[11px]">
                    Intelligence
                  </h4>
                  <ul className="space-y-2 text-graphite-muted dark:text-gray-400">
                    <li><Link href="/ai" className="hover:text-pine dark:hover:text-amberSignal transition-colors">Smart Vision OCR</Link></li>
                    <li><Link href="/ai" className="hover:text-pine dark:hover:text-amberSignal transition-colors">24/7 Policy Bot</Link></li>
                    <li><Link href="/documents" className="hover:text-pine dark:hover:text-amberSignal transition-colors">Digital Signatures</Link></li>
                    <li><Link href="/org-chart" className="hover:text-pine dark:hover:text-amberSignal transition-colors">Visual Org Chart</Link></li>
                  </ul>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <h4 className="font-bold font-headline text-graphite dark:text-ivory mb-2.5 uppercase tracking-wider text-[11px]">
                    Compliance
                  </h4>
                  <ul className="space-y-2 text-graphite-muted dark:text-gray-400">
                    <li><Link href="/settings" className="hover:text-pine dark:hover:text-amberSignal transition-colors">SHA-256 Audit Logs</Link></li>
                    <li><Link href="/settings" className="hover:text-pine dark:hover:text-amberSignal transition-colors">GDPR Privacy</Link></li>
                    <li><Link href="/settings" className="hover:text-pine dark:hover:text-amberSignal transition-colors">White-Labeling</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Disclaimer & Copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-graphite-muted dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-graphite dark:text-ivory">OnboardX™</span>
                <span>© {new Date().getFullYear()} Acme Technologies Inc. All rights reserved.</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px]">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-forest/10 dark:bg-forest/20 text-forest dark:text-[#38B38A] border border-forest/20 dark:border-forest/40 font-semibold">
                  ● SOC2 Type II Certified
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-pine/10 dark:bg-pine/30 text-pine dark:text-ivory border border-pine/20 font-semibold">
                  ● GDPR & HIPAA Compliant
                </span>
              </div>
            </div>
          </div>
        </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
