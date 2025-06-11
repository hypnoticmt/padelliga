'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";

interface TeamLeaderboardRow {
  teamId: string;
  teamName: string;
  player1: string;
  player2: string;
  points: number;
  setDifference: number;
  gamesDifference: number;
}

export default function LeaderboardPage() {
  const pathname = usePathname();
  const leagueId = pathname.split('/')[3];

  return <LeaderboardPageContent leagueId={leagueId} />;
}

function LeaderboardPageContent({ leagueId }: { leagueId: string }) {
  const [leaderboard, setLeaderboard] = useState<TeamLeaderboardRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/sign-in';
        return;
      }

      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('league_id', leagueId);

      if (teamsError) {
        console.error('Error fetching teams:', teamsError.message);
        return;
      }

      const leaderboardData: TeamLeaderboardRow[] = [];

      for (const team of teams ?? []) {
        const { data: memberRows } = await supabase
          .from('team_members')
          .select('player:players(name, surname)')
          .eq('team_id', team.id)
          .order('id', { ascending: true })
          .limit(2);

        const players = (memberRows ?? []).map((r: any) =>
          `${r.player.name} ${r.player.surname}`
        );

        const player1 = players[0] || '';
        const player2 = players[1] || '';

        const { data: matches } = await supabase
          .from('matches')
          .select('*')
          .or(`team1_id.eq.${team.id},team2_id.eq.${team.id}`);

        let points = 0;
        let setDiff = 0;
        let gamesDiff = 0;

        for (const match of matches ?? []) {
          const { data: sets } = await supabase
            .from('match_sets')
            .select('*')
            .eq('match_id', match.id)
            .order('set_number', { ascending: true });

          let won = 0;
          let lost = 0;
          let tg = 0;
          let og = 0;

          for (const s of sets ?? []) {
            const isTeam1 = match.team1_id === team.id;
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

        leaderboardData.push({
          teamId: team.id,
          teamName: team.name,
          player1,
          player2,
          points,
          setDifference: setDiff,
          gamesDifference: gamesDiff,
        });
      }

      leaderboardData.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.setDifference !== a.setDifference)
          return b.setDifference - a.setDifference;
        return b.gamesDifference - a.gamesDifference;
      });

      setLeaderboard(leaderboardData);
    };

    fetchData();
  }, [leagueId]);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full border-collapse text-sm text-left">
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

      {/* Mobile stacked cards */}
      <div className="sm:hidden space-y-4">
        {leaderboard.map((row, index) => (
          <div
            key={row.teamId}
            className="border rounded-lg p-4 shadow-sm bg-background"
          >
            <div className="font-bold text-lg mb-2">
              #{index + 1} — {row.teamName}
            </div>
            <div className="text-sm space-y-1">
              <div>Player 1: {row.player1}</div>
              <div>Player 2: {row.player2}</div>
              <div>Points: {row.points}</div>
              <div>Set Difference: {row.setDifference}</div>
              <div>Games Difference: {row.gamesDifference}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
