// app/protected/add-teammate/action.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function addTeammateByCode(formData: FormData) {
  const supabase = await createClient();

  // 1️⃣ get the code they typed
  const code = formData.get("playerCode")?.toString().trim();
  if (!code) throw new Error("Player code is required");

  // 2️⃣ get the current authenticated user‐>player row 
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 3️⃣ lookup *you* in players to get your player.id
  const { data: you, error: youErr } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (youErr || !you) throw new Error("Your player profile not found");

  // 4️⃣ lookup *them* by code
  const { data: them, error: themErr } = await supabase
    .from("players")
    .select("id")
    .eq("player_code", code)
    .maybeSingle();
  if (themErr || !them) throw new Error("No player found with that code");

  // 5️⃣ find your team via bridge
  const { data: m, error: mErr } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("player_id", you.id)
    .maybeSingle();
  if (mErr || !m?.team_id) throw new Error("You must belong to a team first");
  const team_id = m.team_id;

  // 6️⃣ insert them into your team
  const { error: insErr } = await supabase
    .from("team_members")
    .insert({ team_id, player_id: them.id });
  if (insErr) {
    // if it’s a duplicate unique‐violation, swallow it (they’re already in)
    if (insErr.code === "23505") {
      // no-op
    } else {
      throw insErr;
    }
  }

  // 7️⃣ go back to dashboard and you’ll see the new teammate
  return redirect("/protected");
}
