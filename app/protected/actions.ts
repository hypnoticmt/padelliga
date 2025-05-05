// app/protected/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";

export async function createTeamAction(formData: FormData) {
  const supabase = await createClient();
  const teamName = formData.get("teamName") as string;
  const leagueId  = formData.get("leagueId") as string;
  const regionId  = formData.get("regionId") as string;

  // 1️⃣ Ensure logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1️⃣•5️⃣ Check existing memberships in this region
  {
    const { data: memberRows, error: memErr } = await supabase
      .from("team_members")
      .select("team:teams(region_id)")
      .eq("player_id", user.id) as { data: { team: { region_id: string } | null }[] | null, error: any };

    if (memErr) throw memErr;
    const inSameRegion = (memberRows ?? []).some((r) =>
      Array.isArray(r.team)
        ? r.team.some((t) => t.region_id === regionId)
        : (r.team?.region_id === regionId)
    );
    if (inSameRegion) {
      throw new Error("You are already in a team in that region");
    }
  }

  // 2️⃣ Create the new team
  const { data: newTeam, error: teamErr } = await supabase
    .from("teams")
    .insert({
      name:       teamName,
      league_id:  leagueId,
      region_id:  regionId,
      captain_id: user.id,
    })
    .select("id")
    .maybeSingle();
  if (teamErr || !newTeam) {
    console.error(teamErr);
    throw new Error("Could not create team");
  }

  // 3️⃣ Look up this player’s PK
  const { data: playerRow, error: plyErr } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (plyErr || !playerRow) {
    console.error(plyErr);
    throw new Error("Player record not found");
  }

  // 4️⃣ Insert into the bridge table
  const { error: tmErr } = await supabase
    .from("team_members")
    .insert({
      team_id:   newTeam.id,
      player_id: playerRow.id,
    });
  if (tmErr) {
    console.error(tmErr);
    throw new Error("Could not add you to your new team");
  }
}


  // success

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