// Don't forget to import your JoinTeamForm at the top:
import JoinTeamForm from "@/app/protected/join-team-form";
// app/join-team/page.tsx
import { createClient } from "@/utils/supabase/server";

export default async function JoinTeamPage() {
  const supabase = await createClient();

  // 1. Fetch leagues
  const { data: leaguesData, error: leaguesError } = await supabase
    .from("leagues")
    .select("id, name");
  if (leaguesError) {
    console.error("Error fetching leagues:", leaguesError.message);
  }
  const leagues = leaguesData ?? [];

  // 2. Fetch teams (with league_id) so we can filter client-side
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, league_id");
  if (teamsError) {
    console.error("Error fetching teams:", teamsError.message);
  }
  const teams = teamsData ?? [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Join a Team</h1>
      <JoinTeamForm leagues={leagues} teams={teams} />
    </div>
  );
}
