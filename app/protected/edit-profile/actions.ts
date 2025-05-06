// app/protected/edit-profile/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const name    = formData.get("name")    as string;
  const surname = formData.get("surname") as string;
  const phone   = formData.get("phone")   as string | null;

  // 1️⃣ ensure auth
  const {
    data: { user },
    error: authErr
  } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Not authenticated");

  // 2️⃣ write to players
  const { error: updateErr } = await supabase
    .from("players")
    .update({ name, surname, phone })
    .eq("user_id", user.id);

  if (updateErr) {
    console.error("Profile update failed:", updateErr.message);
    throw new Error("Could not update profile");
  }

  // 3️⃣ redirect back *with* updated=1
  redirect("/protected/edit-profile?updated=1");
}
