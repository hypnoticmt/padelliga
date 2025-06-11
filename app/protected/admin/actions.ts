// app/protected/admin/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";

export async function generateMatchesForLeague(leagueId: string) {
  const supabase = await createClient();

  const { data: teams, error } = await supabase
    .from("teams")
    .select("id")
    .eq("league_id", leagueId);

  if (error) throw new Error(error.message);

  // Basic round robin:
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      await supabase.from("matches").insert({
        league_id: leagueId,
        team1_id: teams[i].id,
        team2_id: teams[j].id,
        // you can add other match fields here if needed (date, round, etc)
      });
    }
  }

  // Mark league as started:
  await supabase
    .from("leagues")
    .update({ league_started: true })
    .eq("id", leagueId);
}

// app/protected/admin/actions.ts (same file as above)

export async function assignTeamToLeague(teamId: string, leagueId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("teams")
    .update({ league_id: leagueId })
    .eq("id", teamId);

  if (error) throw new Error(error.message);
}
