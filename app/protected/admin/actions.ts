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

export async function assignTeamToLeague(teamId: string, leagueId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("teams")
    .update({ league_id: leagueId })
    .eq("id", teamId);

  if (error) throw new Error(error.message);
}

export async function startLeagueAction(leagueId: string) {
  const supabase = await createClient();

  // Verify admin status
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("players")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    throw new Error("Unauthorized: Admin access required");
  }

  // Fetch teams
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name")
    .eq("league_id", leagueId);

  if (teamsError) throw new Error(teamsError.message);
  if (!teams || teams.length < 2) {
    throw new Error(`Need at least 2 teams (found ${teams?.length || 0})`);
  }

  // Generate matches
  const base = Date.now();
  let offset = 0;
  const matchesToInsert = [];

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matchesToInsert.push({
        league_id: leagueId,
        team1_id: teams[i].id,
        team2_id: teams[j].id,
        match_date: new Date(base + offset * 24 * 60 * 60 * 1000).toISOString(),
        status: "Scheduled",
      });
      offset++;
    }
  }

  // Insert all matches at once
  const { error: insertError } = await supabase
    .from("matches")
    .insert(matchesToInsert);

  if (insertError) {
    console.error("Error inserting matches:", insertError);
    throw new Error(`Failed to create matches: ${insertError.message}`);
  }

  // Mark league as started
  const { error: updateError } = await supabase
    .from("leagues")
    .update({ league_started: true })
    .eq("id", leagueId);

  if (updateError) throw new Error(updateError.message);

  return { 
    success: true, 
    matchesCreated: matchesToInsert.length,
    teamsCount: teams.length 
  };
}