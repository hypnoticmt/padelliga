// app/protected/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { SubmitButton } from "@/components/submit-button";
import { addTeammateByCode } from "./add-teammate/actions";
import { removeTeammateAction } from "./actions";
import { calculateLeagueLeaderboard, calculateTeamStats } from "@/lib/leaderboard";
import MatchCard from "@/components/match-card";

interface PlayerRow {
  id: string;
  user_id: string;
  name: string;
  surname: string;
  player_code?: string;
}
interface TeamRow {
  id: string;
  name: string;
  league_id: string | null;
  region_id: string;
  captain_id: string;
}
interface JoinedTeam { id: string; name: string }

export default async function PrivatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { error: rawError } = await searchParams;
  const queryErrorMessage = rawError ? decodeURIComponent(rawError) : null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: you } = await supabase
    .from("players")
    .select("id, user_id, name, surname, player_code")
    .eq("user_id", user.id)
    .maybeSingle();
  
  const userName = you?.name && you?.surname 
    ? `${you.name} ${you.surname}` 
    : user.user_metadata?.name && user.user_metadata?.surname
    ? `${user.user_metadata.name} ${user.user_metadata.surname}`
    : user.user_metadata?.name || user.email!;
  
  if (!you) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hey, {userName}! Please complete your player profile to get started.
          </p>
          <Link
            href="/protected/edit-profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("player_id", you.id)
    .maybeSingle();
  const teamId = membership?.team_id;

  let team: TeamRow | null = null;
  if (teamId) {
    const { data: t } = await supabase
      .from("teams")
      .select("id, name, league_id, region_id, captain_id")
      .eq("id", teamId)
      .maybeSingle();
    team = t ?? null;
  }

  let teammates: PlayerRow[] = [];
  if (teamId) {
    const { data: rows } = await supabase
      .from("team_members")
      .select("player:players(id, user_id, name, surname)")
      .eq("team_id", teamId);
    const all = (rows ?? []).flatMap((r: any) => r.player as PlayerRow[]);
    teammates = all.filter((p) => p.user_id !== user.id);
  }

  const extractTeam = (v: any): JoinedTeam | null => {
    if (!v) return null;
    return Array.isArray(v) ? v[0] : v;
  };

  let upcomingMatches: any[] = [];
  if (teamId) {
    const { data: matches } = await supabase
      .from("matches")
      .select(`
        id,
        team1_id,
        team2_id,
        team1:team1_id ( id, name ),
        team2:team2_id ( id, name )
      `)
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`);
    
    const matchesWithPlayers = await Promise.all(
      (matches ?? []).map(async (m: any) => {
        try {
          const { data: existingSets } = await supabase
            .from("match_sets")
            .select("id")
            .eq("match_id", m.id)
            .limit(1);
          
          if (existingSets && existingSets.length > 0) {
            return null;
          }
          
          const { data: team1Members } = await supabase
            .from("team_members")
            .select("player:players(id, name, surname, phone)")
            .eq("team_id", m.team1_id);
          
          const { data: team2Members } = await supabase
            .from("team_members")
            .select("player:players(id, name, surname, phone)")
            .eq("team_id", m.team2_id);

          return {
            id: m.id,
            team1_id: m.team1_id,
            team2_id: m.team2_id,
            team1: extractTeam(m.team1),
            team2: extractTeam(m.team2),
            team1Players: (team1Members ?? []).flatMap((tm: any) => 
              Array.isArray(tm.player) ? tm.player : [tm.player]
            ).filter(Boolean),
            team2Players: (team2Members ?? []).flatMap((tm: any) => 
              Array.isArray(tm.player) ? tm.player : [tm.player]
            ).filter(Boolean),
          };
        } catch (error) {
          return null;
        }
      })
    );

    upcomingMatches = matchesWithPlayers.filter(Boolean);
  }

  let ownStats = null;
  if (teamId) {
    ownStats = await calculateTeamStats(supabase, teamId);
  }

  let leaderboard: any[] = [];
  if (team?.league_id) {
    leaderboard = await calculateLeagueLeaderboard(supabase, team.league_id);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
          Welcome back, {userName}! 🎾
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your padel league
        </p>
      </div>

      {/* Error Banner */}
      {queryErrorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-800 dark:text-red-200">Error</p>
            <p className="text-red-700 dark:text-red-300">{queryErrorMessage}</p>
          </div>
        </div>
      )}

      {/* Player Code Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🆔</span>
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
              Your Player Code
            </p>
          </div>
          <code className="text-4xl font-bold font-mono tracking-wider bg-white dark:bg-gray-800 px-6 py-3 rounded-xl inline-block shadow-md border-2 border-purple-200 dark:border-purple-700">
            {you.player_code ?? "—"}
          </code>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 flex items-center gap-2">
            <span className="text-lg">👥</span>
            Share this code with teammates to join your team
          </p>
        </div>
      </div>

      {/* Your Team Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500 rounded-xl shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Your Team</h2>
        </div>
        
        {team ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{team.name}</p>
            </div>

            {/* Teammates */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span>👥</span> Teammates
              </h3>
              {teammates.length > 0 ? (
                <div className="grid gap-3">
                  {teammates.map((t) => (
                    <div key={t.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                          {t.name.charAt(0)}
                        </div>
                        <span className="font-medium">{t.name} {t.surname}</span>
                      </div>
                      <form action={removeTeammateAction} className="inline">
                        <input type="hidden" name="teamId" value={team.id} />
                        <input type="hidden" name="playerId" value={t.id} />
                        <button className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">👋</span>
                    <div>
                      <p className="font-medium mb-1">Find a Teammate</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Add a teammate using their player code to complete your team.
                      </p>
                      <form action={addTeammateByCode} className="flex gap-2">
                        <input
                          name="playerCode"
                          placeholder="Enter player code"
                          className="flex-1 px-4 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 outline-none transition-all"
                          required
                        />
                        <SubmitButton className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                          Add
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Performance Stats */}
            {team.league_id ? (
              ownStats ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <span>📊</span> Your Performance
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Points" value={ownStats.points} color="blue" />
                    <StatCard label="Matches Won" value={`${ownStats.matchesWon}/${ownStats.matchesPlayed}`} color="green" />
                    <StatCard label="Set Diff" value={ownStats.setsWon - ownStats.setsLost} color="purple" />
                    <StatCard label="Games Diff" value={ownStats.gamesWon - ownStats.gamesLost} color="pink" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <span className="text-4xl mb-2 block">🎾</span>
                  <p className="text-gray-500 dark:text-gray-400">No matches played yet</p>
                </div>
              )
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Not Assigned to League
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your team is not assigned to a league yet. Contact an admin to get started.
                  </p>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            {team.league_id && leaderboard.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span>🏆</span> League Leaderboard
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                        <th className="pb-3 pr-4 text-left font-semibold">Rank</th>
                        <th className="pb-3 pr-4 text-left font-semibold">Team</th>
                        <th className="pb-3 pr-4 text-center font-semibold">Pts</th>
                        <th className="pb-3 pr-4 text-center font-semibold">P</th>
                        <th className="pb-3 pr-4 text-center font-semibold">W</th>
                        <th className="pb-3 pr-4 text-center font-semibold">Sets</th>
                        <th className="pb-3 text-center font-semibold">Games</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((row, index) => (
                        <tr
                          key={row.teamId}
                          className={`
                            transition-all duration-200 border-b border-gray-100 dark:border-gray-800
                            hover:bg-blue-50 dark:hover:bg-blue-900/20
                            ${row.teamId === team?.id ? 'bg-blue-100 dark:bg-blue-900/40 font-bold ring-2 ring-blue-500' : ''}
                            ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20' : ''}
                            ${index === 1 ? 'bg-gray-50 dark:bg-gray-800/40' : ''}
                            ${index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20' : ''}
                          `}
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              {index === 0 && <span className="text-2xl">🥇</span>}
                              {index === 1 && <span className="text-2xl">🥈</span>}
                              {index === 2 && <span className="text-2xl">🥉</span>}
                              <span className={`${index < 3 ? 'text-lg font-bold' : ''}`}>{index + 1}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">{row.teamName}</td>
                          <td className="py-3 pr-4 text-center font-bold text-blue-600 dark:text-blue-400">{row.points}</td>
                          <td className="py-3 pr-4 text-center text-gray-600 dark:text-gray-400">{row.matchesPlayed}</td>
                          <td className="py-3 pr-4 text-center text-gray-600 dark:text-gray-400">{row.matchesWon}</td>
                          <td className="py-3 pr-4 text-center">
                            <span className={row.setsWon - row.setsLost > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {row.setsWon - row.setsLost > 0 ? '+' : ''}{row.setsWon - row.setsLost}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={row.gamesWon - row.gamesLost > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {row.gamesWon - row.gamesLost > 0 ? '+' : ''}{row.gamesWon - row.gamesLost}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">👥</span>
            <h3 className="text-xl font-semibold mb-2">No Team Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't joined a team yet. Create one or join an existing team to get started!
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/protected/create-team"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
              >
                ➕ Create Team
              </Link>
              <Link
                href="/protected/join-team"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
              >
                🤝 Join Team
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Pending Matches */}
      <section className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500 rounded-xl shadow-md">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Pending Matches</h2>
          </div>
          {upcomingMatches.length > 0 && (
            <span className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-semibold shadow-sm">
              {upcomingMatches.length} {upcomingMatches.length === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>
        
        {upcomingMatches.length > 0 ? (
          <div className="space-y-3 stagger-container">
            {upcomingMatches.map((m, index) => (
              <div key={m.id} className="stagger-item" style={{ animationDelay: `${index * 50}ms` }}>
                <MatchCard
                  matchId={m.id}
                  team1Name={m.team1?.name ?? "TBD"}
                  team2Name={m.team2?.name ?? "TBD"}
                  team1Players={m.team1Players}
                  team2Players={m.team2Players}
                  isTeam1={m.team1_id === teamId}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎾</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-700 dark:text-gray-300">
              All Clear!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              No pending matches at the moment. All matches have been completed! 🎉
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  }[color];

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold bg-gradient-to-r ${colorClasses} bg-clip-text text-transparent mb-1`}>
        {value}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
}