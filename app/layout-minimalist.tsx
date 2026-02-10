export const dynamic = "force-dynamic";

import { EnvVarWarning } from "@/components/env-var-warning";
import { Analytics } from "@vercel/analytics/react";
import AuthButtonWrapper from "@/components/AuthButtonWrapper";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Padel Liga",
  description: "Padel Liga",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col relative bg-background text-foreground">
            {/* Minimalist Navigation Bar */}
            <nav className="w-full border-b border-gray-200 dark:border-gray-800 h-16 fixed top-0 left-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
              <div className="w-full max-w-7xl mx-auto flex justify-between items-center h-full px-5">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                  <span className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    Padel Liga
                  </span>
                </Link>

                {/* Auth Buttons / Navigation */}
                {!hasEnvVars ? <EnvVarWarning /> : <AuthButtonWrapper />}
              </div>
            </nav>

            {/* Spacer so content does not go under fixed navbar */}
            <div className="h-16" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-10 px-5 max-w-7xl mx-auto w-full pt-5 pb-10">
              {children}
              <Analytics />
            </div>

            {/* Minimalist Footer */}
            <footer className="w-full border-t border-gray-200 dark:border-gray-800 mx-auto py-8 bg-white dark:bg-gray-950">
              <div className="max-w-7xl mx-auto px-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Footer Logo */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Padel Liga
                    </span>
                  </div>

                  {/* Footer Links */}
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                      Home
                    </Link>
                    <Link href="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                      About
                    </Link>
                    <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                      Contact
                    </Link>
                    <ThemeSwitcher />
                  </div>

                  {/* Copyright */}
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    © 2026 Padel Liga
                  </p>
                </div>
              </div>
            </footer>
          </main>
          
          {/* Toast Notifications */}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
