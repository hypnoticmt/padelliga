"use client";  // MUST be at the very top

import { useState, FormEvent } from "react";
import { submitScoreAction } from "@/app/protected/submit-score/actions";
import { SubmitButton } from "@/components/submit-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SubmitScoreClientProps {
  matchId: string;
  team1Name: string;
  team2Name: string;
}

export default function SubmitScoreClient({
  matchId,
  team1Name,
  team2Name,
}: SubmitScoreClientProps) {
  const [submitting, setSubmitting] = useState(false);
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]); // Today's date
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      await submitScoreAction(formData);
      
      // Success toast
      toast.success("Score submitted successfully! 🎾", {
        description: "The leaderboard has been updated.",
      });
      
      // Redirect back to dashboard after a brief delay
      setTimeout(() => {
        router.push("/protected");
        router.refresh(); // Force refresh to update the data
      }, 1500);
      
    } catch (error: any) {
      // Error toast
      toast.error("Failed to submit score", {
        description: error.message || "Please try again.",
      });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto">
      <input type="hidden" name="matchId" value={matchId} />
      
      {/* Match Date Selection */}
      <div className="border border-border p-5 rounded-xl bg-card">
        <label className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-foreground">When was this match played?</span>
          <input
            type="date"
            name="matchDate"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]} // Can't select future dates
            required
            disabled={submitting}
            className="border border-border p-3 rounded-lg bg-background text-foreground disabled:opacity-50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all text-base"
          />
        </label>
      </div>

      {[1, 2, 3].map((setNumber) => (
        <div key={setNumber} className="border border-border p-5 rounded-xl bg-card space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Set {setNumber}</h3>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-foreground">{team1Name} Games</span>
            <select 
              name={`set${setNumber}_team1`} 
              required 
              disabled={submitting}
              className="border border-border p-3 rounded-lg bg-background text-foreground disabled:opacity-50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all text-base"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-foreground">{team2Name} Games</span>
            <select 
              name={`set${setNumber}_team2`} 
              required 
              disabled={submitting}
              className="border border-border p-3 rounded-lg bg-background text-foreground disabled:opacity-50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all text-base"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-foreground">Set Winner</span>
            <select 
              name={`set${setNumber}_winner`} 
              required 
              disabled={submitting}
              className="border border-border p-3 rounded-lg bg-background text-foreground disabled:opacity-50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all text-base"
            >
              <option value="">-- Select Winner --</option>
              <option value="1">{team1Name}</option>
              <option value="2">{team2Name}</option>
            </select>
          </label>
        </div>
      ))}

      <SubmitButton
        type="submit"
        className="w-full py-4 px-6 rounded-lg transition text-base font-semibold bg-brand-orange hover:bg-brand-orange/90 shadow-sm"
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit Scores"}
      </SubmitButton>
    </form>
  );
}