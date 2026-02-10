export const dynamic = "force-dynamic";

import { EnvVarWarning } from "@/components/env-var-warning";
import { Analytics } from "@vercel/analytics/react";
import AuthButtonWrapper from "@/components/AuthButtonWrapper";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Poppins } from "next/font/google";
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

const poppins = Poppins({
  weight: ['400', '600'],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col relative bg-background text-foreground">
            {/* Minimalist Navigation Bar */}
            <nav className="w-full border-b border-border h-16 fixed top-0 left-0 z-50 bg-background/80 backdrop-blur-md">
              <div className="w-full max-w-7xl mx-auto flex justify-between items-center h-full px-5">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                  <span className="text-xl font-semibold text-brand-orange tracking-tight">
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
            <div className="flex-1 flex flex-col w-full md:pb-20">
              {children}
              <Analytics />
            </div>

            {/* Footer - Fixed on desktop, relative on mobile */}
            <footer className="w-full border-t border-border py-6 bg-background relative md:fixed md:bottom-0 md:left-0 z-40">
              <div className="max-w-7xl mx-auto px-5">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  {/* Footer Logo */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-brand-orange">
                      Padel Liga
                    </span>
                  </div>

                  {/* Footer Links */}
                  <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-brand-orange transition-colors">
                      Home
                    </Link>
                    <Link href="/about" className="hover:text-brand-orange transition-colors">
                      About
                    </Link>
                    <Link href="/contact" className="hover:text-brand-orange transition-colors">
                      Contact
                    </Link>
                    <Link href="/faq" className="hover:text-brand-orange transition-colors">
                      FAQ
                    </Link>
                    <ThemeSwitcher />
                  </div>

                  {/* Copyright */}
                  <p className="text-xs text-muted-foreground text-center md:text-left">
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
