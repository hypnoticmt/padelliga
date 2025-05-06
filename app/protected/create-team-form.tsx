"use client";
import { useState, FormEvent } from "react";
import { createTeamAction } from "@/app/protected/actions"; // adjust path if needed
import { SubmitButton } from "@/components/submit-button";

export interface League { id: string; name: string }
export interface Region { id: string; name: string }

export default function CreateTeamForm({
  leagues,
  regions,
}: {
  leagues: League[];
  regions: Region[];
}) {
  const [teamName, setTeamName] = useState("");
  const [regionId, setRegionId] = useState("");
  const [leagueId, setLeagueId] = useState("");
  const [teammateCodes, setTeammateCodes] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // calls your server‐side action:
    await createTeamAction(new FormData(e.currentTarget));
    // clear on success:
    setTeamName("");
    setRegionId("");
    setLeagueId("");
    setTeammateCodes("");
    alert("Team created!");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      {/* Team Name */}
      <label className="flex flex-col gap-1">
        <span className="text-sm">Team Name</span>
        <input
          name="teamName"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          className="border p-2 rounded"
        />
      </label>

      {/* Region */}
      <label className="flex flex-col gap-1">
        <span className="text-sm">Region</span>
        <select
          name="regionId"
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          required
          className="border p-2 rounded"
        >
          <option value="">-- Select Region --</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      {/* League */}
      <label className="flex flex-col gap-1">
        <span className="text-sm">League</span>
        <select
          name="leagueId"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          required
          className="border p-2 rounded"
        >
          <option value="">-- Select League --</option>
          {leagues.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      {/* Teammate Codes */}
      <label className="flex flex-col gap-1">
        <span className="text-sm">Teammate Player Code</span>
        <input
          name="teammateCodes"
          type="text"
          placeholder="e.g. 12345"
          value={teammateCodes}
          onChange={(e) => setTeammateCodes(e.target.value)}
          className="border p-2 rounded"
        />
      </label>

      <SubmitButton type="submit" className="mt-4">
        Create Team
      </SubmitButton>
    </form>
  );
}
