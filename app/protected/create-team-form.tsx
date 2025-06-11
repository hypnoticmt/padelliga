"use client";
import { useState, FormEvent } from "react";
import { createTeamAction } from "@/app/protected/actions";
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
    await createTeamAction(new FormData(e.currentTarget));
    setTeamName("");
    setRegionId("");
    setLeagueId("");
    setTeammateCodes("");
    alert("Team created!");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm mx-auto p-6 bg-background border rounded-lg shadow-sm flex flex-col space-y-4"
    >
      {/* Team Name */}
      <div>
        <label htmlFor="teamName" className="block text-sm font-medium mb-1">
          Team Name
        </label>
        <input
          id="teamName"
          name="teamName"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          className="w-full p-3 rounded-lg border text-sm"
        />
      </div>

      {/* Region */}
      <div>
        <label htmlFor="regionId" className="block text-sm font-medium mb-1">
          Region
        </label>
        <select
          id="regionId"
          name="regionId"
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          required
          className="w-full p-3 rounded-lg border text-sm"
        >
          <option value="">-- Select Region --</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Teammate Codes */}
      <div>
        <label htmlFor="teammateCodes" className="block text-sm font-medium mb-1">
          Teammate Player Code
        </label>
        <input
          id="teammateCodes"
          name="teammateCodes"
          type="text"
          placeholder="e.g. 12345"
          value={teammateCodes}
          onChange={(e) => setTeammateCodes(e.target.value)}
          className="w-full p-3 rounded-lg border text-sm"
        />
      </div>

      <SubmitButton type="submit" className="w-full">
        Create Team
      </SubmitButton>
    </form>
  );
}
