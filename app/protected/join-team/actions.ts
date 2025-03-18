"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export async function joinTeamAction(formData: FormData) {
    const supabase = await createClient();
    const teamId = formData.get("teamId") as string;
    
    // Check if teamId was provided
    if (!teamId) {
      throw new Error("No team selected");
    }
    
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }
    
    // Optionally, check if a player record exists for this user
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (playerError) {
      console.error("Error fetching player:", playerError.message);
      throw new Error("Could not fetch player data");
    }
    
    // If the player record doesn't exist, you might want to create one first.
    if (!player) {
      throw new Error("Player record not found. Please complete your registration.");
    }
    
    // Update the player's team_id to the selected team
    const { error: updateError } = await supabase
      .from("players")
      .update({ team_id: teamId })
      .eq("user_id", user.id);
    
    if (updateError) {
      console.error("Error joining team:", updateError.message);
      throw new Error("Could not join the team");
    }
    
    // Optionally return a success message
    return { message: "Team joined successfully" };
  };