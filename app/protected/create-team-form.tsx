<<<<<<< HEAD
// app/create-team-form.tsx
"use client";

=======
// app/protected/create-team-form.tsx
"use client";
>>>>>>> f923b2bb8b060579454a8879858ffbcc6ee0d454
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
<<<<<<< HEAD
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await createTeamAction(new FormData(e.currentTarget));
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Could not create team");
    }
  }

  if (submitted) {
    return (
      <p className="text-green-600">
        🎉 Team created successfully!
      </p>
    );
=======

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createTeamAction(new FormData(e.currentTarget));
    setTeamName("");
    setLeagueId("");
    setRegionId("");
    alert("Team created successfully!");
>>>>>>> f923b2bb8b060579454a8879858ffbcc6ee0d454
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm">Team Name</span>
        <input
          type="text"
          name="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          className="border p-2 rounded"
        />
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
            <option key={l.id} value={l.id}>
              {l.name}
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
<<<<<<< HEAD
          className="border p-2 rounded"
        >
          <option value="">-- Select Region --</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
=======
          className="border border-foreground/20 p-2 rounded"
        >
          <option value="">-- Select Region --</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
>>>>>>> f923b2bb8b060579454a8879858ffbcc6ee0d454
            </option>
          ))}
        </select>
      </label>

<<<<<<< HEAD
      <SubmitButton type="submit">
=======
      <SubmitButton type="submit" className="flex flex-col gap-1">
>>>>>>> f923b2bb8b060579454a8879858ffbcc6ee0d454
        Create Team
      </SubmitButton>
    </form>
  );
}
