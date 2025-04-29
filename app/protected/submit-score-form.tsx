// app/submit-score/SubmitScoreForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { submitScoreAction } from "@/app/protected/submit-score/actions";
import { SubmitButton } from "@/components/submit-button";

export default function SubmitScoreForm({ matchId }: { matchId: string }) {
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      await submitScoreAction(formData);
      setMessage("Scores submitted successfully!");
    } catch (error: any) {
      setMessage(error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <input type="hidden" name="matchId" value={matchId} />
      {[1, 2, 3].map((setNumber) => (
        <div key={setNumber} className="border p-2 rounded">
          <h3 className="font-semibold">Set {setNumber}</h3>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Team 1 Games</span>
            <select name={`set${setNumber}_team1`} required className="border p-1">
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Team 2 Games</span>
            <select name={`set${setNumber}_team2`} required className="border p-1">
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Set Winner (1 or 2)</span>
            <select name={`set${setNumber}_winner`} required className="border p-1">
              <option value="">-- Select Winner --</option>
              <option value="1">Team 1</option>
              <option value="2">Team 2</option>
            </select>
          </label>
        </div>
      ))}
      <SubmitButton
        type="submit"
        className="bpx-4 py-2 transition"
      >
        Submit Scores
      </SubmitButton>
      {message && <p>{message}</p>}
    </form>
  );
}
