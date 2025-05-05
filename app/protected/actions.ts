// app/protected/actions.ts
"use server";

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

  // 6️⃣ Optionally parse comma-sep teammateCodes
  if (rawCodes) {
    const codes = rawCodes
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    for (const code of codes) {
      // look up each code
      const { data: p, error: pErr } = await supabase
        .from("players")
        .select("id")
        .eq("player_code", code)
        .maybeSingle();

      if (pErr) {
        console.warn(`Error looking up code ${code}:`, pErr.message);
        continue;
      }
      if (!p) {
        console.warn(`No player found with code ${code}, skipping.`);
        continue;
      }

      // insert into team_members (ignore duplicates silently)
      const { error: tmErr } = await supabase
        .from("team_members")
        .insert({ team_id: newTeam.id, player_id: p.id });
      if (tmErr && tmErr.code !== "23505") {
        console.error(
          `Error adding player ${p.id} to team_members:`,
          tmErr.message
        );
      }
    }
  }
}

// ——————————————————————
// If you still need createLeagueAction, keep it; otherwise delete it too.
//
// export async function createLeagueAction(formData: FormData) { ... }
// ——————————————————————
