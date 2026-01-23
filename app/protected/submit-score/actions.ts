// app/protected/submit-score/actions.ts
"use server"

import { createClient } from "@/utils/supabase/server";

// This action receives a match id and scores for 3 sets.
export async function submitScoreAction(formData: FormData) {
  const supabase = await createClient();

  // Extract the match id from the form
  const matchId = formData.get("matchId") as string;
  if (!matchId) throw new Error("Match ID is required.");

  // For each set, extract team1_games, team2_games, and set_winner.
  const sets = [1, 2, 3].map((setNumber) => {
    const team1_games = parseInt(formData.get(`set${setNumber}_team1`) as string, 10);
    const team2_games = parseInt(formData.get(`set${setNumber}_team2`) as string, 10);
    const set_winner = parseInt(formData.get(`set${setNumber}_winner`) as string, 10); // 1 or 2
    return {
      set_number: setNumber,
      team1_games,
      team2_games,
      set_winner,
    };
  });

  // Insert all set records
  const { error: setsError } = await supabase.from("match_sets").insert(
    sets.map((set) => ({
      match_id: matchId,
      ...set,
    }))
  );

  if (setsError) {
    console.error("Error submitting scores:", setsError.message);
    throw new Error("Could not submit scores.");
  }

  // Update the match with the date played and status
  const { error: matchError } = await supabase
    .from("matches")
    .update({
      match_date: new Date().toISOString(), // Set to current timestamp
      status: "Completed", // Mark as completed
    })
    .eq("id", matchId);

  if (matchError) {
    console.error("Error updating match:", matchError.message);
    throw new Error("Could not update match status.");
  }

  return { message: "Scores submitted successfully." };
}