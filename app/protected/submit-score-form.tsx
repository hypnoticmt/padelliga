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
              className="w-full p-3 rounded-lg border text-sm"
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
              className="w-full p-3 rounded-lg border text-sm"
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
              className="w-full p-3 rounded-lg border text-sm"
            >
              <option value="">-- Select Winner --</option>
              <option value="1">Team 1</option>
              <option value="2">Team 2</option>
            </select>
          </div>
        </div>
      ))}

      <SubmitButton type="submit" className="w-full">
        Submit Scores
      </SubmitButton>

      {message && (
        <p className="text-sm text-green-600 mt-2 text-center">{message}</p>
      )}
    </form>
  );
}
