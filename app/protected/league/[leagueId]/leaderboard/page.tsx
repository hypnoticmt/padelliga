// app/protected/league/[leagueId]/leaderboard/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface TeamLeaderboardRow {
  teamId: string;
  teamName: string;
  player1: string;
  player2: string;
  points: number;
  setDifference: number;
  gamesDifference: number;
}

// Using "any" for the props is a common workaround until a stricter type can be defined.
export default async function LeaderboardPage({ params, searchParams }: any) {
  const supabase = await createClient();

  // (Optional) Check if the user is logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { leagueId } = params;

  // 1. Fetch teams in the league.
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .eq("league_id", leagueId);
  if (teamsError) {
    console.error("Error fetching teams:", teamsError.message);
    return <p>Error fetching teams.</p>;
  }
  const teamList = teams ?? [];

  // Prepare an array for leaderboard rows.
  const leaderboard: TeamLeaderboardRow[] = [];

  // For each team, gather players and compute match statistics.
  for (const team of teamList) {
    // 2. Fetch players for the team.
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("name, surname")
      .eq("team_id", team.id);
    if (playersError) {
      console.error(
        `Error fetching players for team ${team.id}:`,
        playersError.message
      );
      continue;
    }
    const teamPlayers = players ?? [];
    // Sort players by name to ensure a consistent order
    const sortedPlayers = (teamPlayers as any[]).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const player1 = sortedPlayers[0]
      ? `${sortedPlayers[0].name} ${sortedPlayers[0].surname}`
      : "";
    const player2 = sortedPlayers[1]
      ? `${sortedPlayers[1].name} ${sortedPlayers[1].surname}`
      : "";

    // 3. Fetch all matches in which the team played.
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .or(`team1_id.eq.${team.id},team2_id.eq.${team.id}`);
    if (matchesError) {
      console.error(
        `Error fetching matches for team ${team.id}:`,
        matchesError.message
      );
      continue;
    }
    const matchList = matches ?? [];

    // Initialize totals for this team across ALL matches
    let points = 0;
    let setDiff = 0;
    let gamesDiff = 0;

    // Process each match
    for (const match of matchList) {
      let setsWon = 0;
      let setsLost = 0;
      let teamGames = 0;
      let opponentGames = 0;

      // 3B. Fetch match sets for the match.
      const { data: sets, error: setsError } = await supabase
        .from("match_sets")
        .select("*")
        .eq("match_id", match.id)
        .order("set_number", { ascending: true });

      if (setsError) {
        console.error(
          `Error fetching sets for match ${match.id}:`,
          setsError.message
        );
        continue;
      }
      const setList = sets ?? [];

      console.log(
        `Match: ${match.id}, Team: ${team.id} => Found ${setList.length} sets`
      );
      // For each set, see if this team is match.team1_id or match.team2_id
      for (const set of setList) {
        console.log("  Processing set:", set);

        if (match.team1_id === team.id) {
          if (set.set_winner === 1) setsWon++;
          else if (set.set_winner === 2) setsLost++;

          teamGames += set.team1_games;
          opponentGames += set.team2_games;
        } else if (match.team2_id === team.id) {
          if (set.set_winner === 2) setsWon++;
          else if (set.set_winner === 1) setsLost++;

          teamGames += set.team2_games;
          opponentGames += set.team1_games;
        }
      }

      console.log(
        `  => setsWon: ${setsWon}, setsLost: ${setsLost}, teamGames: ${teamGames}, oppGames: ${opponentGames}`
      );

      // If setsWon > setsLost => team wins that match => +1 point
      if (setsWon > setsLost) {
        points++;
      }
      setDiff += setsWon - setsLost;
      gamesDiff += teamGames - opponentGames;
    }

    leaderboard.push({
      teamId: team.id,
      teamName: team.name,
      player1,
      player2,
      points,
      setDifference: setDiff,
      gamesDifference: gamesDiff,
    });
  }

  // 4. Sort the leaderboard by points, then set difference, then games difference.
  leaderboard.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.setDifference !== a.setDifference) return b.setDifference - a.setDifference;
    return b.gamesDifference - a.gamesDifference;
  });

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">Team Name</th>
            <th className="border px-4 py-2">Player 1</th>
            <th className="border px-4 py-2">Player 2</th>
            <th className="border px-4 py-2">Points</th>
            <th className="border px-4 py-2">Set Difference</th>
            <th className="border px-4 py-2">Games Difference</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((row) => (
            <tr key={row.teamId}>
              <td className="border px-4 py-2">{row.teamName}</td>
              <td className="border px-4 py-2">{row.player1}</td>
              <td className="border px-4 py-2">{row.player2}</td>
              <td className="border px-4 py-2">{row.points}</td>
              <td className="border px-4 py-2">{row.setDifference}</td>
              <td className="border px-4 py-2">{row.gamesDifference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
