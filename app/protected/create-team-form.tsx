"use client";
import { useState, FormEvent } from "react";
import { createTeamAction } from "@/app/protected/actions";
import { SubmitButton } from "@/components/submit-button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createTeamAction(new FormData(e.currentTarget));
      
      setTeamName("");
      setRegionId("");
      setLeagueId("");
      setTeammateCodes("");
      
      toast.success("Team created successfully! 🎾", {
        description: `${teamName} has been added to the league.`,
      });
      
      setTimeout(() => {
        router.push("/protected");
      }, 1000);
      
    } catch (error: any) {
      toast.error("Failed to create team", {
        description: error.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg space-y-6"
    >
      {/* Team Name */}
      <div>
        <label htmlFor="teamName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          <span className="text-lg">🎯</span>
          Team Name
        </label>
        <input
          id="teamName"
          name="teamName"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter your team name"
          required
          disabled={submitting}
          className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Region */}
      <div>
        <label htmlFor="regionId" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          <span className="text-lg">📍</span>
          Region
        </label>
        <select
          id="regionId"
          name="regionId"
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          required
          disabled={submitting}
          className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">-- Select Region --</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <span>⚠️</span>
          Region cannot be changed after team creation
        </p>
      </div>

      {/* Teammate Code */}
      <div>
        <label htmlFor="teammateCodes" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          <span className="text-lg">👤</span>
          Teammate Player Code
        </label>
        <input
          id="teammateCodes"
          name="teammateCodes"
          type="text"
          placeholder="e.g. 12345"
          value={teammateCodes}
          onChange={(e) => setTeammateCodes(e.target.value)}
          disabled={submitting}
          className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Optional: Add one teammate now or invite them later
        </p>
      </div>

      {/* Submit Button */}
      <SubmitButton 
        type="submit" 
        className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:transform-none" 
        disabled={submitting}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>✨</span>
            Create Team
          </span>
        )}
      </SubmitButton>
    </form>
  );
}