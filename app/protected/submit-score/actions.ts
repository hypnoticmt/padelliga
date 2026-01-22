// app/protected/submit-score/actions.ts
"use server"

import { createClient } from "@/utils/supabase/server";

export async function submitScoreAction(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get player ID
  const { data: player } = await supabase
    .from("players")
    .select("id, is_admin")
    .eq("user_id", user.id)
    .single();

  if (!player) throw new Error("Player profile not found");

  // Extract match ID and date
  const matchId = formData.get("matchId") as string;
  const matchDate = formData.get("matchDate") as string;
  
  if (!matchId) throw new Error("Match ID is required.");

  // Check if match exists and get its current status
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, status, score_submitted_by, team1_id, team2_id")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    throw new Error("Match not found");
  }

  // Check if scores already submitted (only admins can override)
  if (match.status === "Completed" && !player.is_admin) {
    throw new Error("Scores have already been submitted for this match. Contact an admin to modify.");
  }

  // Verify user is in one of the teams (or is admin)
  if (!player.is_admin) {
    const { data: isMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("player_id", player.id)
      .or(`team_id.eq.${match.team1_id},team_id.eq.${match.team2_id}`)
      .single();

    if (!isMember) {
      throw new Error("You can only submit scores for your own team's matches");
    }
  }

  // Extract set scores
  const sets = [1, 2, 3].map((setNumber) => {
    const team1_games = parseInt(formData.get(`set${setNumber}_team1`) as string, 10);
    const team2_games = parseInt(formData.get(`set${setNumber}_team2`) as string, 10);
    const set_winner = parseInt(formData.get(`set${setNumber}_winner`) as string, 10);
    return {
      set_number: setNumber,
      team1_games,
      team2_games,
      set_winner,
    };
  });

  // Validate match result
  const team1SetsWon = sets.filter(s => s.set_winner === 1).length;
  const team2SetsWon = sets.filter(s => s.set_winner === 2).length;
  const totalSets = team1SetsWon + team2SetsWon;

  // Valid results: 2-0, 2-1, or if they played all 3 sets
  const hasWinner = team1SetsWon >= 2 || team2SetsWon >= 2;
  
  if (!hasWinner) {
    throw new Error("Invalid match result. One team must win at least 2 sets.");
  }

  // Determine match winner
  const winnerTeamId = team1SetsWon === 2 ? match.team1_id : match.team2_id;

  // If updating existing scores, delete old ones first
  if (match.status === "Completed") {
    await supabase
      .from("match_sets")
      .delete()
      .eq("match_id", matchId);
  }

  // Insert match sets
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

  // Update match with completion info
  const scoreSummary = sets.map(s => `${s.team1_games}-${s.team2_games}`).join(", ");
  
  const { error: updateError } = await supabase
    .from("matches")
    .update({
      status: "Completed",
      score_summary: scoreSummary,
      winner_team_id: winnerTeamId,
      match_date: matchDate ? new Date(matchDate).toISOString() : new Date().toISOString(),
      score_submitted_by: player.id,
      score_submitted_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (updateError) {
    console.error("Error updating match:", updateError.message);
    throw new Error("Could not update match status.");
  }

  return { message: "Scores submitted successfully." };
}