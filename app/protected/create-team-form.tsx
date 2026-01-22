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
      
      // Reset form
      setTeamName("");
      setRegionId("");
      setLeagueId("");
      setTeammateCodes("");
      
      // Success toast
      toast.success("Team created successfully! 🎾", {
        description: `${teamName} has been added to the league.`,
      });
      
      // Redirect to dashboard
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
          disabled={submitting}
          className="w-full p-3 rounded-lg border text-sm disabled:opacity-50"
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
          disabled={submitting}
          className="w-full p-3 rounded-lg border text-sm disabled:opacity-50"
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
          disabled={submitting}
          className="w-full p-3 rounded-lg border text-sm disabled:opacity-50"
        />
      </div>

      <SubmitButton 
        type="submit" 
        className="w-full" 
        disabled={submitting}
      >
        {submitting ? "Creating..." : "Create Team"}
      </SubmitButton>
    </form>
  );
}