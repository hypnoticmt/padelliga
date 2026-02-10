// app/protected/submit-score/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Define interfaces for our joined match data
interface JoinedTeamData {
  id: string;
  name: string;
}

interface JoinedMatchData {
  id: string;
  match_date: string;
  status: string;
  score_summary: string | null;
  team1: JoinedTeamData | JoinedTeamData[] | null;
  team2: JoinedTeamData | JoinedTeamData[] | null;
}

export default async function SubmitScorePage({
  searchParams,
}: {
  searchParams: Promise<{ matchId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const matchId = resolvedSearchParams.matchId;
  
  if (!matchId) {
    return <p>No match selected.</p>;
  }

  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Get player info to check if admin
  const { data: player } = await supabase
    .from("players")
    .select("id, is_admin")
    .eq("user_id", user.id)
    .single();

  // Fetch the match with joined team names and status
  const { data: rawMatchData, error: matchError } = await supabase
    .from("matches")
    .select(`
      id,
      match_date,
      status,
      score_summary,
      team1:team1_id ( id, name ),
      team2:team2_id ( id, name )
    `)
    .eq("id", matchId)
    .maybeSingle();

  if (matchError) {
    console.error("Error fetching match:", matchError.message);
    return <p>Error fetching match.</p>;
  }
  
  if (!rawMatchData) {
    return <p>Match not found.</p>;
  }

  const matchData = rawMatchData as unknown as JoinedMatchData;

  // Check if match is already completed and user is not admin
  if (matchData.status === "Completed" && !player?.is_admin) {
    return (
      <div className="max-w-6xl mx-auto px-5 pt-8 pb-10 animate-fade-in">
        <div className="max-w-md mx-auto border border-border rounded-xl p-8 bg-card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-3 text-foreground">Score Already Submitted</h2>
          <p className="mb-4 text-muted-foreground">
            This match has already been completed. The final score is:
          </p>
          <p className="text-3xl font-bold text-brand-orange my-6">
            {matchData.score_summary || "N/A"}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            If you believe there's an error, please contact an administrator to modify the scores.
          </p>
          <a 
            href="/protected" 
            className="inline-block w-full sm:w-auto px-6 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Extract team names
  const team1Name = Array.isArray(matchData.team1)
    ? matchData.team1[0]?.name
    : matchData.team1?.name;
  const team2Name = Array.isArray(matchData.team2)
    ? matchData.team2[0]?.name
    : matchData.team2?.name;

  // Show admin notice if editing existing scores
  const isEditing = matchData.status === "Completed" && player?.is_admin;

  // Import the client component dynamically
  const SubmitScoreClient = (await import("./SubmitScoreClient")).default;

  return (
    <div className="max-w-6xl mx-auto px-5 pt-8 pb-10 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-2">
          {isEditing ? "Edit Match Score (Admin)" : "Submit Match Score"}
        </h1>
        <p className="text-muted-foreground">Enter the results for this match</p>
      </div>
      
      {isEditing && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-orange-800 dark:text-orange-200 font-semibold">
            ⚠️ You are editing an already submitted score. Current score: {matchData.score_summary}
          </p>
        </div>
      )}

      <SubmitScoreClient
        matchId={matchData.id}
        team1Name={team1Name ?? "Team 1"}
        team2Name={team2Name ?? "Team 2"}
      />
    </div>
  );
}