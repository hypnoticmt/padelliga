// app/protected/actions.ts
"use server"

import { createClient } from "@/utils/supabase/server"

export async function createTeamAction(formData: FormData) {
  const supabase = await createClient()
  const teamName = formData.get("teamName") as string
  const leagueId = formData.get("leagueId") as string

  // 1. Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  console.log("User ID:", user.id);
  console.log("Team Name:", teamName, "League ID:", leagueId);

  // 2. Insert a new team and retrieve the inserted record (with the team id)
  const { data: newTeamData, error: teamError } = await supabase
    .from("teams")
    .insert({
      name: teamName,
      league_id: leagueId,
      captain_id: user.id,
    })
    .select() // return the inserted row
    .maybeSingle()

  if (teamError) {
    console.error("Error creating team:", teamError.message)
    throw new Error("Could not create team")
  }

  console.log("New team data:", newTeamData);

  // 3. Check if the player record exists
  const { data: playerData, error: playerSelectError } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  console.log("Player record before update:", playerData);
  if (playerSelectError) {
    console.error("Error fetching player record:", playerSelectError.message);
  }
  if (!playerData) {
    console.error("Player record not found for user:", user.id);
    throw new Error("Player record not found");
  }

  // 4. Update the player's record with the new team_id
  const teamId = newTeamData?.id;
  if (!teamId) {
    throw new Error("Team ID not returned");
  }

  console.log("Updating player record for user:", user.id, "with teamId:", teamId);

  const { data: updatedPlayerData, error: updatePlayerError } = await supabase
    .from("players")
    .update({ team_id: teamId })
    .eq("user_id", user.id);

  console.log("Player update result:", updatedPlayerData);
  if (updatePlayerError) {
    console.error("Error updating player's team:", updatePlayerError.message);
    throw new Error("Could not update player's team");
  }
}
export async function bookMatchAction(formData: FormData) {
  const supabase = await createClient();
  const team1Id = formData.get("team1_id") as string;
  const team2Id = formData.get("team2_id") as string;
  const matchDate = formData.get("match_date") as string;

  if (team1Id === team2Id) {
    throw new Error("A team cannot play against itself");
  }
  if (!matchDate) {
    throw new Error("Match date is required");
  }

  const { error } = await supabase.from("matches").insert({
    team1_id: team1Id,
    team2_id: team2Id,
    match_date: matchDate,
    status: "scheduled",
  });

  if (error) {
    console.error("Error booking match:", error.message);
    throw new Error("Could not book match");
  }
}


  export async function createLeagueAction(formData: FormData) {
    const supabase = await createClient()
    const leagueName = formData.get("leagueName") as string
  
    // Insert a new league
    const { error } = await supabase.from("leagues").insert({ name: leagueName })
    if (error) {
      console.error("Error creating league:", error.message)
      throw new Error("Could not create league")
    }
  }