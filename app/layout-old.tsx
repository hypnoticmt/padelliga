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
            {/* Enhanced Navigation Bar */}
            <nav className="w-full border-b border-b-foreground/10 h-16 fixed top-0 left-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm">
              <div className="w-full max-w-7xl mx-auto flex justify-between items-center h-full px-5">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                    🎾
                  </span>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 hidden sm:inline-block">
                    Padel Liga
                  </span>
                  {/* Mobile - just text */}
                  <span className="text-xl font-bold text-gray-900 dark:text-white sm:hidden">
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

            {/* Enhanced Footer */}
            <footer className="w-full border-t mx-auto py-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
              <div className="max-w-7xl mx-auto px-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Footer Logo */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎾</span>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
                      Padel Liga
                    </span>
                  </div>

                  {/* Footer Links */}
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      Home
                    </Link>
                    <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      About Us
                    </Link>
                    <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      Contact
                    </Link>
                    <ThemeSwitcher />
                  </div>

                  {/* Copyright */}
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    © 2026 Padel Liga. All rights reserved.
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