"use client";

import { useState, FormEvent } from "react";
import { submitScoreAction } from "@/app/protected/submit-score/actions";
import { SubmitButton } from "@/components/submit-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SubmitScoreForm({ matchId }: { matchId: string }) {
  const [submitting, setSubmitting] = useState(false);
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
      }, 1000);
      
    } catch (error: any) {
      // Error toast
      toast.error("Failed to submit score", {
        description: error.message || "Please try again.",
      });
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm mx-auto p-6 bg-background border rounded-lg shadow-sm flex flex-col space-y-4"
    >
      <input type="hidden" name="matchId" value={matchId} />

      {[1, 2, 3].map((setNumber) => (
        <div
          key={setNumber}
          className="border rounded-lg p-4 shadow-sm flex flex-col space-y-3"
        >
          <h3 className="font-semibold text-lg mb-2">Set {setNumber}</h3>

          <div>
            <label
              htmlFor={`set${setNumber}_team1`}
              className="block text-sm font-medium mb-1"
            >
              Team 1 Games
            </label>
            <select
              id={`set${setNumber}_team1`}
              name={`set${setNumber}_team1`}
              required
              disabled={submitting}
              className="w-full p-3 rounded-lg border text-sm disabled:opacity-50"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`set${setNumber}_team2`}
              className="block text-sm font-medium mb-1"
            >
              Team 2 Games
            </label>
            <select
              id={`set${setNumber}_team2`}
              name={`set${setNumber}_team2`}
              required
              disabled={submitting}
              className="w-full p-3 rounded-lg border text-sm disabled:opacity-50"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`set${setNumber}_winner`}
              className="block text-sm font-medium mb-1"
            >
              Set Winner
            </label>
            <select
              id={`set${setNumber}_winner`}
              name={`set${setNumber}_winner`}
              required
              disabled={submitting}
              className="w-full p-3 rounded-lg border text-sm disabled:opacity-50"
            >
              <option value="">-- Select Winner --</option>
              <option value="1">Team 1</option>
              <option value="2">Team 2</option>
            </select>
          </div>
        </div>
      ))}

      <SubmitButton 
        type="submit" 
        className="w-full" 
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit Scores"}
      </SubmitButton>
    </form>
  );
}