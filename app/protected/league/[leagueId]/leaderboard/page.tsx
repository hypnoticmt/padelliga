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

export default async function LeaderboardPage({ params }: any) {
  const supabase = await createClient();

  // auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const leagueId = params.leagueId as string;

  // 1️⃣ fetch all teams in league
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name")
    .eq("league_id", leagueId);

  if (teamsError) {
    console.error("Error fetching teams:", teamsError.message);
    return <p>Error fetching teams.</p>;
  }

  const leaderboard: TeamLeaderboardRow[] = [];

  for (const team of teams ?? []) {
    // 2️⃣ fetch exactly two players via the bridge
    const { data: memberRows, error: membersError } = await supabase
      .from("team_members")
      .select("player:players(name, surname)")
      .eq("team_id", team.id)
      .order("id", { ascending: true }) // ensure deterministic order
      .limit(2);

    if (membersError) {
      console.error(`Error fetching players for team ${team.id}:`, membersError.message);
      continue;
    }

    // supabase returns an array of objects like { player: { name, surname } }
    const players = (memberRows ?? []).map((r: any) =>
      `${r.player.name} ${r.player.surname}`
    );

    const player1 = players[0] || "";
    const player2 = players[1] || "";

    // 3️⃣ compute stats
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

    let points = 0;
    let setDiff = 0;
    let gamesDiff = 0;

    for (const match of matches ?? []) {
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

      let won = 0;
      let lost = 0;
      let tg = 0;
      let og = 0;

      for (const s of sets ?? []) {
        const isTeam1 = match.team1_id === team.id;
        // who won this set?
        if ((isTeam1 && s.set_winner === 1) || (!isTeam1 && s.set_winner === 2)) {
          won++;
        } else {
          lost++;
        }
        tg += isTeam1 ? s.team1_games : s.team2_games;
        og += isTeam1 ? s.team2_games : s.team1_games;
      }

      if (won > lost) points++;
      setDiff += won - lost;
      gamesDiff += tg - og;
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

  // 4️⃣ sort the leaderboard
  leaderboard.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.setDifference !== a.setDifference)
      return b.setDifference - a.setDifference;
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
