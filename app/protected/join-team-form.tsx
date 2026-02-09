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
      
      toast.success("Team joined successfully! 🎾", {
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
      className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg space-y-6"
    >
      {/* League Dropdown */}
      <div>
        <label htmlFor="leagueId" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          <span className="text-lg">🏆</span>
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
          className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        <label htmlFor="teamId" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          <span className="text-lg">👥</span>
          Select a Team
        </label>
        <select
          id="teamId"
          name="teamId"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          required
          disabled={submitting || !selectedLeague}
          className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">-- Choose a Team --</option>
          {filteredTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        {selectedLeague && filteredTeams.length === 0 && (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span>⚠️</span>
            No teams available in this league
          </p>
        )}
      </div>

      {/* Submit Button */}
      <SubmitButton 
        type="submit" 
        disabled={submitting || !selectedLeague || !selectedTeam}
        className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:transform-none"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Joining...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>✨</span>
            Join Team
          </span>
        )}
      </SubmitButton>
    </form>
  );
}