// app/protected/create-team-form.tsx
"use client";
import { useState, FormEvent } from "react";
import { SubmitButton } from "@/components/submit-button";
import { createTeamAction } from "./actions";

export default function CreateTeamForm({
  leagues,
  regions,
}: {
  leagues: { id: string; name: string }[];
  regions: { id: string; name: string }[];
}) {
  const [teamName, setTeamName] = useState("");
  const [leagueId, setLeagueId] = useState("");
  const [regionId, setRegionId] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createTeamAction(new FormData(e.currentTarget));
    setTeamName("");
    setLeagueId("");
    setRegionId("");
    alert("Team created successfully!");
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

      <label className="flex flex-col gap-1">
        <span className="text-sm">Region</span>
        <select
          name="regionId"
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          required
          className="border border-foreground/20 p-2 rounded"
        >
          <option value="">-- Select Region --</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </label>

      <SubmitButton type="submit" className="flex flex-col gap-1">
        Create Team
      </SubmitButton>
    </form>
  );
}
