"use client";

import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { SubmitButton } from "./submit-button";
import { Menu, X } from "lucide-react";
import React, { useState } from "react";

export default function AuthButtonClient({
  isAuthenticated,
  displayName,
  isAdmin,
}: {
  isAuthenticated: boolean;
  displayName: string;
  isAdmin: boolean;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4 relative">
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-2">
          <Link href="/protected/" className="hover:underline">Dashboard</Link>
          <Link href="/protected/create-team" className="hover:underline">Create a Team</Link>
          <Link href="/protected/join-team" className="hover:underline">Join a Team</Link>
          <Link href="/protected/submit-score" className="hover:underline">Submit Score</Link>
          <Link href="/protected/leaderboards" className="hover:underline">Leaderboards</Link>
          <Link href="/protected/edit-profile" className="hover:underline">Edit Profile</Link>
          {isAdmin && (
            <Link href="/protected/admin" className="hover:underline">Admin</Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="hover:text-gray-300 focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <span className="hidden md:inline">Hey, {displayName}!</span>

        <form action={signOutAction} className="hidden md:block">
          <SubmitButton type="submit" variant="default">Sign out</SubmitButton>
        </form>

        {/* Mobile menu content */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Right-side drawer */}
            <div
              className={`
                fixed top-16 right-0 h-[calc(100vh-4rem)] w-64
                bg-background px-4 py-3 space-y-2 z-50 overflow-y-auto
                transition-transform duration-300 ease-out
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
              `}
            >
              <Link href="/protected/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 hover:text-gray-300">Dashboard</Link>
              <Link href="/protected/create-team" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 hover:text-gray-300">Create Team</Link>
              <Link href="/protected/join-team" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 hover:text-gray-300">Join Team</Link>
              <Link href="/protected/submit-score" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 hover:text-gray-300">Submit Score</Link>
              <Link href="/protected/leaderboards" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 hover:text-gray-300">Leaderboards</Link>
              <Link href="/protected/edit-profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 hover:text-gray-300">Edit Profile</Link>
              {isAdmin && (
                <Link href="/protected/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 hover:text-gray-300">Admin</Link>
              )}

              <div className="px-3 py-2">Hey, {displayName}!</div>

              <form action={signOutAction}>
                <SubmitButton type="submit" variant="default">Sign out</SubmitButton>
              </form>
            </div>
          </>
        )}
      </div>
    );
  }

  // Unauthenticated view
  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="default">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
