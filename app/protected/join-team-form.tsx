// app/join-team/join-team-form.tsx
"use client";

import { useState, FormEvent, useMemo } from "react";
import { joinTeamAction } from "@/app/protected/join-team/actions";

interface League {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  league_id: string;
}

interface JoinTeamFormProps {
  leagues: League[];
  teams: Team[];
}

export default function JoinTeamForm({ leagues, teams }: JoinTeamFormProps) {
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [message, setMessage] = useState("");

  // Filter teams by the selected league
  const filteredTeams = useMemo(() => {
    if (!selectedLeague) return [];
    return teams.filter((team) => team.league_id === selectedLeague);
  }, [selectedLeague, teams]);

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
      {/* League Dropdown */}
      <label className="flex flex-col gap-1">
        <span className="text-sm">Select a League</span>
        <select
          name="leagueId" // not strictly needed for the join action, but we can keep it
          value={selectedLeague}
          onChange={(e) => {
            setSelectedLeague(e.target.value);
            setSelectedTeam(""); // reset team selection
          }}
          required
          className="border border-foreground/20 p-2 rounded"
        >
          <option value="">-- Choose a League --</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>
      </label>

      {/* Team Dropdown (Filtered by selectedLeague) */}
      <label className="flex flex-col gap-1">
        <span className="text-sm">Select a Team</span>
        <select
          name="teamId"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          required
          className="border border-foreground/20 p-2 rounded"
        >
          <option value="">-- Choose a Team --</option>
          {filteredTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition self-start"
      >
        Join Team
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
