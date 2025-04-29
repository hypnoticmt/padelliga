// app/protected/actions.ts
"use server"

import { createClient } from "@/utils/supabase/server"

export async function createTeamAction(formData: FormData) {
  const supabase = await createClient()
  const teamName = formData.get("teamName") as string
  const leagueId = formData.get("leagueId") as string
  const regionId = formData.get("regionId") as string

  // 1. Get current user
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Not authenticated")
  }

  // 2. Create the team
  const { data: newTeam, error: teamError } = await supabase
    .from("teams")
    .insert({
      name: teamName,
      league_id: leagueId,
      region_id: regionId,
      captain_id: user.id,
    })
    .select()
    .maybeSingle()

  if (teamError || !newTeam) {
    console.error("Error creating team:", teamError?.message)
    throw new Error("Could not create team")
  }

  // 3. Insert into team_members
  const { error: tmError } = await supabase
    .from("team_members")
    .insert({
      player_id: user.id,
      team_id: newTeam.id,
    })

  if (tmError) {
    console.error("Error inserting team_members row:", tmError.message)
    // we don’t necessarily want to blow up the entire flow here—
    // but you can throw if you prefer strict consistency
  }
}

export async function bookMatchAction(formData: FormData) {
  const supabase = await createClient()
  const team1Id = formData.get("team1_id") as string
  const team2Id = formData.get("team2_id") as string
  const matchDate = formData.get("match_date") as string

  if (team1Id === team2Id) {
    throw new Error("A team cannot play against itself")
  }
  if (!matchDate) {
    throw new Error("Match date is required")
  }

  const { error } = await supabase.from("matches").insert({
    team1_id: team1Id,
    team2_id: team2Id,
    match_date: matchDate,
    status: "scheduled",
  })

  if (error) {
    console.error("Error booking match:", error.message)
    throw new Error("Could not book match")
  }
}

export async function createLeagueAction(formData: FormData) {
  const supabase = await createClient()
  const leagueName = formData.get("leagueName") as string

  const { error } = await supabase.from("leagues").insert({ name: leagueName })
  if (error) {
    console.error("Error creating league:", error.message)
    throw new Error("Could not create league")
  }
}
