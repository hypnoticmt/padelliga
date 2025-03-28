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
  team1: JoinedTeamData | JoinedTeamData[] | null;
  team2: JoinedTeamData | JoinedTeamData[] | null;
}

export default async function SubmitScorePage({
  searchParams,
}: {
  // Declare searchParams as a Promise to satisfy the PageProps constraint.
  searchParams: Promise<{ matchId?: string }>;
}) {
  // Await the searchParams to get the resolved object.
  const resolvedSearchParams = await searchParams;
  const matchId = resolvedSearchParams.matchId;
  if (!matchId) {
    return <p>No match selected.</p>;
  }

  const supabase = await createClient();

  // 1. Fetch the match with joined team names.
  const { data: rawMatchData, error: matchError } = await supabase
    .from("matches")
    .select(`
      id,
      match_date,
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

  // Cast the raw data to our expected interface.
  const matchData = rawMatchData as unknown as JoinedMatchData;

  // 2. Extract team names (handling if Supabase returns an array or a single object).
  const team1Name = Array.isArray(matchData.team1)
    ? matchData.team1[0]?.name
    : matchData.team1?.name;
  const team2Name = Array.isArray(matchData.team2)
    ? matchData.team2[0]?.name
    : matchData.team2?.name;

  // 3. Import the client component dynamically.
  const SubmitScoreClient = (await import("./SubmitScoreClient")).default;

  return (
    <SubmitScoreClient
      matchId={matchData.id}
      team1Name={team1Name ?? "Team 1"}
      team2Name={team2Name ?? "Team 2"}
    />
  );
}
