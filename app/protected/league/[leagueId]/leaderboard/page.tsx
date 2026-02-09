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
  matchesPlayed: number;
  matchesWon: number;
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
  const [leagueName, setLeagueName] = useState<string>("");
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

        // Fetch league name
        const { data: league } = await supabase
          .from('leagues')
          .select('name')
          .eq('id', leagueId)
          .single();
        
        if (league) {
          setLeagueName(league.name);
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
          const { data: memberRows, error: memberError } = await supabase
            .from('team_members')
            .select('player_id')
            .eq('team_id', team.id)
            .order('id', { ascending: true })
            .limit(2);

          if (memberError) {
            console.error(`Error fetching members for team ${team.id}:`, memberError);
          }

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

          const { data: matches } = await supabase
            .from('matches')
            .select('*')
            .or(`team1_id.eq.${team.id},team2_id.eq.${team.id}`);

          let points = 0;
          let matchesPlayed = 0;
          let matchesWon = 0;
          let setDiff = 0;
          let gamesDiff = 0;

          for (const match of matches ?? []) {
            const { data: sets } = await supabase
              .from('match_sets')
              .select('*')
              .eq('match_id', match.id)
              .order('set_number', { ascending: true });

            if (!sets || sets.length === 0) continue;

            matchesPlayed++;

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

            if (won > lost) {
              points += 3;
              matchesWon++;
            }
            setDiff += won - lost;
            gamesDiff += tg - og;
          }

          leaderboardData.push({
            teamId: team.id,
            teamName: team.name,
            player1,
            player2,
            points,
            matchesPlayed,
            matchesWon,
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
      <div className="max-w-6xl mx-auto p-5 space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800 shadow-lg animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-5">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-1">Error</h2>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
              {leagueName || "League"} Leaderboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Current standings and team rankings
            </p>
          </div>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-12 shadow-lg text-center">
          <span className="text-6xl mb-4 block">🎾</span>
          <h3 className="text-2xl font-bold mb-2">No Teams Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            This league doesn't have any teams yet.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Team</th>
                  <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Players</th>
                  <th className="px-6 py-4 text-center font-bold text-sm uppercase tracking-wider">Points</th>
                  <th className="px-6 py-4 text-center font-bold text-sm uppercase tracking-wider">Played</th>
                  <th className="px-6 py-4 text-center font-bold text-sm uppercase tracking-wider">Won</th>
                  <th className="px-6 py-4 text-center font-bold text-sm uppercase tracking-wider">Set Diff</th>
                  <th className="px-6 py-4 text-center font-bold text-sm uppercase tracking-wider">Games Diff</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => (
                  <tr
                    key={row.teamId}
                    className={`
                      border-b border-gray-200 dark:border-gray-700 transition-all
                      hover:bg-blue-50 dark:hover:bg-blue-900/20
                      ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20' : ''}
                      ${index === 1 ? 'bg-gray-50 dark:bg-gray-800/40' : ''}
                      ${index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20' : ''}
                    `}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-3xl">🥇</span>}
                        {index === 1 && <span className="text-3xl">🥈</span>}
                        {index === 2 && <span className="text-3xl">🥉</span>}
                        <span className={`${index < 3 ? 'text-xl font-bold' : 'text-lg font-semibold'}`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-lg">{row.teamName}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {row.player1.charAt(0)}
                          </span>
                          {row.player1}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {row.player2.charAt(0)}
                          </span>
                          {row.player2}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 text-white font-bold text-lg rounded-xl shadow-md">
                        {row.points}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400 font-medium">
                      {row.matchesPlayed}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400 font-medium">
                      {row.matchesWon}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${row.setDifference > 0 ? 'text-green-600 dark:text-green-400' : row.setDifference < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {row.setDifference > 0 ? '+' : ''}{row.setDifference}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${row.gamesDifference > 0 ? 'text-green-600 dark:text-green-400' : row.gamesDifference < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {row.gamesDifference > 0 ? '+' : ''}{row.gamesDifference}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {leaderboard.map((row, index) => (
              <div
                key={row.teamId}
                className={`
                  border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg
                  ${index === 0 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700' : ''}
                  ${index === 1 ? 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/40 dark:to-slate-800/40 border-gray-300 dark:border-gray-600' : ''}
                  ${index === 2 ? 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-300 dark:border-orange-700' : ''}
                  ${index > 2 ? 'bg-white dark:bg-gray-800' : ''}
                `}
              >
                {/* Rank & Team */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {index === 0 && <span className="text-4xl">🥇</span>}
                    {index === 1 && <span className="text-4xl">🥈</span>}
                    {index === 2 && <span className="text-4xl">🥉</span>}
                    {index > 2 && (
                      <span className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                    )}
                    <div>
                      <div className="font-bold text-xl">{row.teamName}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Rank #{index + 1}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-green-600 bg-clip-text text-transparent">
                      {row.points}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">points</div>
                  </div>
                </div>

                {/* Players */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {row.player1.charAt(0)}
                    </span>
                    {row.player1}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {row.player2.charAt(0)}
                    </span>
                    {row.player2}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-bold">{row.matchesPlayed}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{row.matchesWon}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Won</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${row.setDifference > 0 ? 'text-green-600 dark:text-green-400' : row.setDifference < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                      {row.setDifference > 0 ? '+' : ''}{row.setDifference}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Set Diff</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${row.gamesDifference > 0 ? 'text-green-600 dark:text-green-400' : row.gamesDifference < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                      {row.gamesDifference > 0 ? '+' : ''}{row.gamesDifference}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Games Diff</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}