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
}: {
  isAuthenticated: boolean;
  displayName: string;
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
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
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
          <div className="absolute top-16 left-0 w-full bg-white shadow-lg px-4 py-3 space-y-2 z-50">
            <Link href="/protected/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-blue-600">Dashboard</Link>
            <Link href="/protected/create-team" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-blue-600">Create a Team</Link>
            <Link href="/protected/join-team" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-blue-600">Join a Team</Link>
            <Link href="/protected/submit-score" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-blue-600">Submit Score</Link>
            <Link href="/protected/leaderboards" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-blue-600">Leaderboards</Link>
            <Link href="/protected/edit-profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-blue-600">Edit Profile</Link>

            <div className="px-3 py-2 text-gray-700">Hey, {displayName}!</div>

            <form action={signOutAction}>
              <SubmitButton type="submit" variant="default">Sign out</SubmitButton>
            </form>
          </div>
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
