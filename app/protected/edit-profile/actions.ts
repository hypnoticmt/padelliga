"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const phone = formData.get("phone") as string;

  // 1️⃣ Ensure user is signed in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // 2️⃣ Update player's record
  const { error } = await supabase
    .from("players")
    .update({ name, surname, phone })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating profile:", error.message);
    throw new Error("Could not update profile");
  }

  // 3️⃣ Redirect back to dashboard
  return redirect("/protected/edit-profile?updated=1");
}