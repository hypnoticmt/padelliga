// app/protected/join-team/page.tsx
import { createClient } from "@/utils/supabase/server";
import JoinTeamForm from "../join-team-form";

export default async function JoinTeamPage() {
  const supabase = await createClient();

  const { data: leaguesData, error: leaguesError } = await supabase
    .from("leagues")
    .select("id, name");
  if (leaguesError) {
    console.error("Error fetching leagues:", leaguesError.message);
  }
  const leagues = leaguesData ?? [];

  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, league_id");
  if (teamsError) {
    console.error("Error fetching teams:", teamsError.message);
  }
  const teams = teamsData ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
          Join a Team
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find and join an existing team in your region
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <p className="font-medium text-gray-900 dark:text-white mb-2">
          Team Selection
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• First select your league</li>
          <li>• Then choose an available team</li>
          <li>• You can only join teams in your region</li>
        </ul>
      </div>

      {/* Form */}
      <JoinTeamForm leagues={leagues} teams={teams} />
    </div>
  );
}
