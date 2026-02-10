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
      
      toast.success("Team created successfully", {
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
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 space-y-6"
    >
      {/* Team Name */}
      <div>
        <label htmlFor="teamName" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
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
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
        />
      </div>

      {/* Region */}
      <div>
        <label htmlFor="regionId" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Region
        </label>
        <select
          id="regionId"
          name="regionId"
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          required
          disabled={submitting}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
        >
          <option value="">-- Select Region --</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Region cannot be changed after team creation
        </p>
      </div>

      {/* Teammate Code */}
      <div>
        <label htmlFor="teammateCodes" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
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
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-gray-900 dark:text-white"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Optional: Add one teammate now or invite them later
        </p>
      </div>

      {/* Submit Button */}
      <SubmitButton 
        type="submit" 
        className="w-full py-3 text-base font-medium bg-orange-500 hover:bg-orange-600 rounded-lg transition-all disabled:opacity-50" 
        disabled={submitting}
      >
        {submitting ? "Creating..." : "Create Team"}
      </SubmitButton>
    </form>
  );
}
