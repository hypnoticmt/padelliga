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
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
          <span className="text-3xl">🤝</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
          Join a Team
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Find and join an existing team in your region
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-medium text-green-900 dark:text-green-100 mb-1">
              Team Selection
            </p>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• First select your league</li>
              <li>• Then choose an available team</li>
              <li>• You can only join teams in your region</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <JoinTeamForm leagues={leagues} teams={teams} />
    </div>
  );
}