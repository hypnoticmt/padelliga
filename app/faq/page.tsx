"use client";

import { useState } from "react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Padel Liga?",
      answer: "Padel Liga is a modern platform designed to help you organize and manage padel leagues. It provides real-time leaderboards, team management tools, and comprehensive match tracking."
    },
    {
      question: "How do I create a team?",
      answer: "After signing up, navigate to your dashboard and click 'Create Team'. You'll need to provide a team name, select your region, and optionally add a teammate using their player code."
    },
    {
      question: "What is a player code?",
      answer: "A player code is a unique identifier assigned to each player when they create their profile. You can find your code on your dashboard and share it with teammates who want to join your team."
    },
    {
      question: "How do leaderboards work?",
      answer: "Leaderboards rank teams based on points earned from match wins. Teams receive 3 points for a win. Ties are broken by set difference, then game difference, and finally total games won."
    },
    {
      question: "Can I join multiple teams?",
      answer: "Currently, each player can only be part of one team at a time. If you want to switch teams, you'll need to leave your current team first."
    },
    {
      question: "How do I submit match scores?",
      answer: "Navigate to your pending matches and click 'Submit Score'. Enter the set scores for each set played. Both teams must confirm the score before it's finalized."
    },
    {
      question: "What happens if there's a score dispute?",
      answer: "Contact your league administrator if there's a dispute. They have the ability to modify or remove match results through the admin panel."
    },
    {
      question: "Can I edit my profile?",
      answer: "Yes! Go to your dashboard and click 'Edit Profile'. You can update your name, surname, and phone number at any time."
    },
    {
      question: "How do I see my team's statistics?",
      answer: "Your dashboard shows your team's performance, including points, matches played, matches won, and set/game differences. You can also view detailed league leaderboards."
    },
    {
      question: "Is Padel Liga free to use?",
      answer: "Yes, Padel Liga is currently free to use for all players and league administrators."
    },
    {
      question: "What if I forget my password?",
      answer: "Click 'Sign In' and then 'Forgot Password'. Enter your email address and you'll receive a password reset link."
    },
    {
      question: "Can I switch between light and dark mode?",
      answer: "Yes! Use the theme switcher in the footer to toggle between light mode, dark mode, or system preference."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 pt-8 pb-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-muted-foreground">
          Find answers to common questions about Padel Liga
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3 mb-8 w-full">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="w-full bg-card border border-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left grid grid-cols-[1fr_auto] items-center gap-4 hover:bg-muted/50 transition-colors"
            >
              <span className="min-w-0 font-semibold text-foreground break-words">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-brand-orange flex-shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 pr-12 text-muted-foreground break-words">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Still Have Questions */}
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          Still Have Questions?
        </h2>
        <p className="text-muted-foreground mb-6">
          Can't find what you're looking for? Get in touch with our support team
        </p>
        <a
          href="/contact"
          className="inline-block px-6 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-all"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
