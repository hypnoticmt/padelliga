"use client";

import { useState, FormEvent, useMemo } from "react";
import { joinTeamAction } from "@/app/protected/join-team/actions";
import { SubmitButton } from "@/components/submit-button";

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
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm mx-auto p-6 bg-background border rounded-lg shadow-sm flex flex-col space-y-4"
    >
      {/* League Dropdown */}
      <div>
        <label htmlFor="leagueId" className="block text-sm font-medium mb-1">
          Select a League
        </label>
        <select
          id="leagueId"
          name="leagueId"
          value={selectedLeague}
          onChange={(e) => {
            setSelectedLeague(e.target.value);
            setSelectedTeam("");
          }}
          required
          className="w-full p-3 rounded-lg border text-sm"
        >
          <option value="">-- Choose a League --</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>
      </div>

      {/* Team Dropdown */}
      <div>
        <label htmlFor="teamId" className="block text-sm font-medium mb-1">
          Select a Team
        </label>
        <select
          id="teamId"
          name="teamId"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          required
          className="w-full p-3 rounded-lg border text-sm"
        >
          <option value="">-- Choose a Team --</option>
          {filteredTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton type="submit" className="w-full">
        Join Team
      </SubmitButton>

      {message && (
        <p className="text-sm text-green-600 mt-2 text-center">{message}</p>
      )}
    </form>
  );
}
