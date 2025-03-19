import { createClient } from "@/utils/supabase/server";

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
  searchParams: { matchId?: string };
}) {
  const matchId = searchParams.matchId;
  if (!matchId) {
    return <p>No match selected.</p>;
  }

  const supabase = await createClient();

  // Fetch the match with joined team names
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

  const matchData = rawMatchData as unknown as JoinedMatchData;

  // Extract team names
  const team1Name = Array.isArray(matchData.team1)
    ? matchData.team1[0]?.name
    : matchData.team1?.name;
  const team2Name = Array.isArray(matchData.team2)
    ? matchData.team2[0]?.name
    : matchData.team2?.name;

  // Import the client component (which is in its own file)
  const SubmitScoreClient = (await import("./SubmitScoreClient")).default;

  return (
    <SubmitScoreClient
      matchId={matchData.id}
      team1Name={team1Name ?? "Team 1"}
      team2Name={team2Name ?? "Team 2"}
    />
  );
}
