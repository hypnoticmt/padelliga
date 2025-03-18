"use client";
import { SubmitButton } from "@/components/submit-button";
import { createTeamAction } from "./actions";
import { useState, FormEvent } from "react";

export default function CreateTeamForm({ leagues }: { leagues: any[] }) {
  const [teamName, setTeamName] = useState("");
  const [leagueId, setLeagueId] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createTeamAction(new FormData(e.currentTarget));
    alert("Team created successfully!");
    setTeamName("");
    setLeagueId("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm">Team Name</span>
        <input
          type="text"
          name="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          className="border border-foreground/20 p-2 rounded"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">League</span>
        <select
          name="leagueId"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          required
          className="border border-foreground/20 p-2 rounded"
        >
          <option value="">-- Select League --</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>
      </label>

      <SubmitButton
        type="submit"
        className="px-4 py-2 rounded transition self-start"
      >
        Create Team
      </SubmitButton>
    </form>
  );
}
