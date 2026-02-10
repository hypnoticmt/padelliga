import { createClient } from "@/utils/supabase/server";
import { calculateLeagueLeaderboard } from "@/lib/leaderboard";
import Link from "next/link";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const supabase = await createClient();

  // Fetch league name
  const { data: league } = await supabase
    .from('leagues')
    .select('name')
    .eq('id', leagueId)
    .single();

  // Use optimized leaderboard calculation (only 2 queries total!)
  const leaderboard = await calculateLeagueLeaderboard(supabase, leagueId);

  // Fetch player names for each team (optimized - 1 query for all teams)
  const teamIds = leaderboard.map(t => t.teamId);
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('team_id, player:players(name, surname)')
    .in('team_id', teamIds);

  // Build a map of team -> players
  const teamPlayersMap = new Map<string, string[]>();
  teamMembers?.forEach((member: any) => {
    const teamId = member.team_id;
    const playerName = member.player ? `${member.player.name} ${member.player.surname}` : 'TBD';
    
    if (!teamPlayersMap.has(teamId)) {
      teamPlayersMap.set(teamId, []);
    }
    teamPlayersMap.get(teamId)!.push(playerName);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              {league?.name || "League"} Leaderboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Current standings and team rankings
            </p>
          </div>
          <Link
            href="/protected/leaderboards"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-500 transition-colors"
          >
            ← Back to all leagues
          </Link>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Teams Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            This league doesn't have any teams yet.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Team</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Players</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Points</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Played</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Won</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Set Diff</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Games Diff</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => {
                  const players = teamPlayersMap.get(row.teamId) || ['TBD', 'TBD'];
                  const player1 = players[0] || 'TBD';
                  const player2 = players[1] || 'TBD';
                  const setDiff = row.setsWon - row.setsLost;
                  const gamesDiff = row.gamesWon - row.gamesLost;

                  return (
                    <tr
                      key={row.teamId}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{row.teamName}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="w-6 h-6 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900 text-xs font-medium">
                              {player1.charAt(0)}
                            </span>
                            {player1}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="w-6 h-6 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900 text-xs font-medium">
                              {player2.charAt(0)}
                            </span>
                            {player2}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-orange-500 text-white font-bold text-lg rounded-lg">
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
                        <span className={`font-semibold ${setDiff > 0 ? 'text-green-600 dark:text-green-400' : setDiff < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {setDiff > 0 ? '+' : ''}{setDiff}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-semibold ${gamesDiff > 0 ? 'text-green-600 dark:text-green-400' : gamesDiff < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {gamesDiff > 0 ? '+' : ''}{gamesDiff}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {leaderboard.map((row, index) => {
              const players = teamPlayersMap.get(row.teamId) || ['TBD', 'TBD'];
              const player1 = players[0] || 'TBD';
              const player2 = players[1] || 'TBD';
              const setDiff = row.setsWon - row.setsLost;
              const gamesDiff = row.gamesWon - row.gamesLost;

              return (
                <div
                  key={row.teamId}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-900"
                >
                  {/* Rank & Team */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-900 dark:text-white">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">{row.teamName}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Rank #{index + 1}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">
                        {row.points}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">points</div>
                    </div>
                  </div>

                  {/* Players */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-6 h-6 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900 text-xs font-medium">
                        {player1.charAt(0)}
                      </span>
                      {player1}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-6 h-6 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900 text-xs font-medium">
                        {player2.charAt(0)}
                      </span>
                      {player2}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{row.matchesPlayed}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Played</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{row.matchesWon}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Won</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${setDiff > 0 ? 'text-green-600 dark:text-green-400' : setDiff < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {setDiff > 0 ? '+' : ''}{setDiff}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Set Diff</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${gamesDiff > 0 ? 'text-green-600 dark:text-green-400' : gamesDiff < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {gamesDiff > 0 ? '+' : ''}{gamesDiff}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Games Diff</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
