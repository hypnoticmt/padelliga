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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
          console.error('Error fetching teams:', teamsError);
          setError('Failed to load teams');
          return;
        }

        const leaderboardData: TeamLeaderboardRow[] = [];

        for (const team of teams ?? []) {
          // Fetch team members with a simpler query approach
          const { data: memberRows, error: memberError } = await supabase
            .from('team_members')
            .select('player_id')
            .eq('team_id', team.id)
            .order('id', { ascending: true })
            .limit(2);

          if (memberError) {
            console.error(`Error fetching members for team ${team.id}:`, memberError);
          }

          // Fetch player details separately for each member
          const players: string[] = [];
          for (const member of memberRows ?? []) {
            const { data: player } = await supabase
              .from('players')
              .select('name, surname')
              .eq('id', member.player_id)
              .single();
            
            if (player && player.name && player.surname) {
              players.push(`${player.name} ${player.surname}`);
            }
          }

          const player1 = players[0] || 'TBD';
          const player2 = players[1] || 'TBD';

          // Fetch matches for this team
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

            if (won > lost) points += 3; // 3 points for a win
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
      } catch (err: any) {
        console.error('Error in fetchData:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId]);

  if (loading) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No teams in this league yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full border-collapse text-sm text-left">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Rank</th>
                  <th className="border px-4 py-2">Team Name</th>
                  <th className="border px-4 py-2">Player 1</th>
                  <th className="border px-4 py-2">Player 2</th>
                  <th className="border px-4 py-2">Points</th>
                  <th className="border px-4 py-2">Set Difference</th>
                  <th className="border px-4 py-2">Games Difference</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => (
                  <tr key={row.teamId}>
                    <td className="border px-4 py-2 font-semibold">{index + 1}</td>
                    <td className="border px-4 py-2">{row.teamName}</td>
                    <td className="border px-4 py-2">{row.player1}</td>
                    <td className="border px-4 py-2">{row.player2}</td>
                    <td className="border px-4 py-2 font-bold">{row.points}</td>
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
                  <div className="font-semibold">Points: {row.points}</div>
                  <div>Set Difference: {row.setDifference}</div>
                  <div>Games Difference: {row.gamesDifference}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}