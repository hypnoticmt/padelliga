export const dynamic = "force-dynamic";

import { EnvVarWarning } from "@/components/env-var-warning";
import { Analytics } from "@vercel/analytics/react";
import AuthButtonWrapper from "@/components/AuthButtonWrapper";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
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
            <nav className="w-full border-b border-b-foreground/10 h-16 fixed top-0 left-0 z-50 bg-background">
              <div className="w-full max-w-5xl mx-auto flex justify-between items-center p-3 px-5 text-sm">
                <div className="text-xl flex gap-5 items-center font-bold">
                  <Link href={"/"}>Padel Liga</Link>
                </div>
                {!hasEnvVars ? <EnvVarWarning /> : <AuthButtonWrapper />}
              </div>
            </nav>

            {/* Spacer so content does not go under fixed navbar */}
            <div className="h-16" />

            <div className="flex-1 flex flex-col gap-10 px-5 max-w-5xl mx-auto pt-5 pb-10">
              {children}
              <Analytics />
            </div>

            <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
              <p>Padel Liga</p>
              <ThemeSwitcher />
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
