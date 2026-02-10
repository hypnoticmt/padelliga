"use client";

import { useState, FormEvent, useMemo } from "react";
import { joinTeamAction } from "@/app/protected/join-team/actions";
import { SubmitButton } from "@/components/submit-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const filteredTeams = useMemo(() => {
    if (!selectedLeague) return [];
    return teams.filter((team) => team.league_id === selectedLeague);
  }, [selectedLeague, teams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await joinTeamAction(formData);
      
      toast.success("Team joined successfully", {
        description: "Welcome to your new team!",
      });
      
      setTimeout(() => {
        router.push("/protected");
      }, 1000);
    } catch (error: any) {
      toast.error("Failed to join team", {
        description: error.message || "Please try again.",
      });
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 space-y-6"
    >
      {/* League Dropdown */}
      <div>
        <label htmlFor="leagueId" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
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
          disabled={submitting}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
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
        <label htmlFor="teamId" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Select a Team
        </label>
        <select
          id="teamId"
          name="teamId"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          required
          disabled={submitting || !selectedLeague}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
        >
          <option value="">-- Choose a Team --</option>
          {filteredTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        {selectedLeague && filteredTeams.length === 0 && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            No teams available in this league
          </p>
        )}
      </div>

      {/* Submit Button */}
      <SubmitButton 
        type="submit" 
        disabled={submitting || !selectedLeague || !selectedTeam}
        className="w-full py-3 text-base font-medium bg-orange-500 hover:bg-orange-600 rounded-lg transition-all disabled:opacity-50"
      >
        {submitting ? "Joining..." : "Join Team"}
      </SubmitButton>
    </form>
  );
}
