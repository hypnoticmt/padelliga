// app/join-team/join-team-form.tsx
"use client"

import { joinTeamAction } from "@/app/protected/join-team/actions"
import { SubmitButton } from "@/components/submit-button";
import { useState, FormEvent } from "react";

interface Team {
  id: string;
  name: string;
}

interface JoinTeamFormProps {
  teams: Team[];
}

export default function JoinTeamForm({ teams }: JoinTeamFormProps) {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      await joinTeamAction(formData);
      setMessage("You have joined the team successfully!");
    } catch (error: any) {
      setMessage(error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1">
        <span className="text-sm">Select a Team to Join</span>
        <select
          name="teamId"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          required
          className="border border-foreground/20 p-2 rounded"
        >
          <option value="">-- Choose a Team --</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton
        type="submit"
        className="px-4 py-2 rounded transition self-start"
      >
        Join Team
      </SubmitButton>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
