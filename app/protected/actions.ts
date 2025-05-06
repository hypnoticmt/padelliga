// app/protected/actions.ts
"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function createTeamAction(formData: FormData) {
  const supabase = await createClient();

  const teamName     = formData.get("teamName")      as string;
  const leagueId     = formData.get("leagueId")      as string;
  const regionId     = formData.get("regionId")      as string;
  const rawCodes     = formData.get("teammateCodes") as string | null;

  // 1️⃣ Ensure signed in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 2️⃣ Unique team‐name check
  const { data: already, error: existErr } = await supabase
    .from("teams")
    .select("id")
    .eq("name", teamName)
    .maybeSingle();
  if (existErr) {
    console.error("Error checking team name:", existErr.message);
    throw new Error("Could not verify team name");
  }
  if (already) {
    throw new Error(`Team name “${teamName}” is already taken.`);
  }

  // 2️⃣•5️⃣ Prevent more than one teammate code
  if (rawCodes) {
    const codes = rawCodes
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (codes.length > 1) {
      throw new Error("You may only add **one** teammate when creating a team.");
    }
  }

  // 3️⃣ Create the team
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
    console.error("Error creating team:", teamErr?.message);
    throw new Error("Could not create team");
  }

  // 4️⃣ Look up your player PK
  const { data: you, error: youErr } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (youErr || !you) {
    console.error("Error fetching your player record:", youErr?.message);
    throw new Error("Your player profile not found");
  }

  // 5️⃣ Add yourself as captain in team_members
  const { error: capErr } = await supabase
    .from("team_members")
    .insert({ team_id: newTeam.id, player_id: you.id });
  if (capErr) {
    console.error("Error adding captain to team_members:", capErr.message);
    throw new Error("Could not add captain to team");
  }

  // 6️⃣ Invite your single teammate (if provided)
  if (rawCodes) {
    const code = rawCodes.trim();
    const { data: p, error: pErr } = await supabase
      .from("players")
      .select("id")
      .eq("player_code", code)
      .maybeSingle();
    if (pErr) {
      console.warn(`Error looking up code ${code}:`, pErr.message);
    } else if (!p) {
      console.warn(`No player found with code ${code}, skipping.`);
    } else {
      const { error: tmErr } = await supabase
        .from("team_members")
        .insert({ team_id: newTeam.id, player_id: p.id });
      if (tmErr && tmErr.code !== "23505") {
        console.error(`Error inviting player ${p.id}:`, tmErr.message);
      }
    }
  }
}


export async function removeTeammateAction(formData: FormData) {
  const supabase = await createClient();
  const teamId   = formData.get("teamId")   as string;
  const playerId = formData.get("playerId") as string;

  // 1️⃣ Auth & fetch your user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 2️⃣ Make sure you’re the captain
  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .maybeSingle();

  if (team?.captain_id !== user.id) {
    // ✋ redirect back to dashboard with an error message
    return redirect(`/protected?error=${encodeURIComponent("Only the captain can remove teammates")}`);
  }

  // 3️⃣ Actually delete
  await supabase
    .from("team_members")
    .delete()
    .eq("team_id",   teamId)
    .eq("player_id", playerId);

  // 4️⃣ back home
  return redirect("/protected");
}