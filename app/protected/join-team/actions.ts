// app/protected/join-team/actions.ts
"use server";
import { createClient } from "@/utils/supabase/server";

export async function joinTeamAction(formData: FormData) {
  const supabase = await createClient();
  const teamId = formData.get("teamId") as string;
  if (!teamId) throw new Error("No team selected");

  // 1️⃣ Ensure logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 2️⃣ Lookup the team’s region_id
  const { data: teamRec, error: tErr } = await supabase
    .from("teams")
    .select("region_id")
    .eq("id", teamId)
    .maybeSingle();

  if (tErr || !teamRec) {
    console.error("Error fetching team record:", tErr?.message);
    throw new Error("Team not found");
  }
  const regionId = teamRec.region_id;

  // 3️⃣ Make sure you’re not already in another team in that region
  const { data: memberRows, error: mErr } = await supabase
    .from("team_members")
    .select("team:teams(region_id)")
    .eq("player_id", user.id);

  if (mErr) {
    console.error("Error fetching memberships:", mErr.message);
    throw new Error("Could not verify existing teams");
  }

  if ((memberRows || []).some(r => r.team.some(t => t.region_id === regionId))) {
    throw new Error("You already belong to a team in this region");
  }

  // 4️⃣ Lookup your players.id
  const { data: playerRow, error: pErr } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (pErr || !playerRow) {
    console.error("Error fetching player record:", pErr?.message);
    throw new Error("Player profile missing");
  }

  // 5️⃣ Finally insert into the bridge table
  const { error: tmErr } = await supabase
    .from("team_members")
    .insert({ team_id: teamId, player_id: playerRow.id });

  if (tmErr) {
    console.error("Error joining team:", tmErr.message);
    throw new Error("Could not join the team");
  }

  return { message: "Team joined successfully" };
}
