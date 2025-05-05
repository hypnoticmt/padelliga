"use client";
import { useState, FormEvent } from "react";
import { SubmitButton } from "@/components/submit-button";
import { createTeamAction } from "./actions";

interface League { id: string; name: string; }
interface Region { id: string; name: string; }

export default function CreateTeamForm({
  leagues,
  regions,
}: {
  leagues: League[];
  regions: Region[];
}) {
  const [teamName, setTeamName]       = useState("");
  const [regionId, setRegionId]       = useState("");
  const [leagueId, setLeagueId]       = useState("");
  const [teammateCodes, setCodes]     = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createTeamAction(new FormData(e.currentTarget));
    alert("Team created successfully!");
    setTeamName("");
    setRegionId("");
    setLeagueId("");
    setCodes("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm">Team Name</span>
        <input
          name="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          className="border p-2 rounded"
        />
      </label>

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
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>

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
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Teammate Codes (comma-separated)</span>
        <input
          name="teammateCodes"
          placeholder="e.g. 12345, 67890"
          value={teammateCodes}
          onChange={(e) => setCodes(e.target.value)}
          className="border p-2 rounded"
        />
      </label>

      <SubmitButton type="submit">Create Team</SubmitButton>
    </form>
  );
}
