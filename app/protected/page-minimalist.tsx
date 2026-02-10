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
        <div className="text-center max-w-md space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold">Complete Your Profile</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Hey, {userName}! Please complete your player profile to get started.
          </p>
          <Link
            href="/protected/edit-profile"
            className="inline-block px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
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
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Welcome back, {userName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your padel league
        </p>
      </div>

      {/* Error Banner */}
      {queryErrorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{queryErrorMessage}</p>
          </div>
        </div>
      )}

      {/* Player Code Card */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
              Your Player Code
            </p>
            <code className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
              {you.player_code ?? "—"}
            </code>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Share this code with teammates to join your team
            </p>
          </div>
        </div>
      </div>

      {/* Your Team Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Team</h2>
        </div>
        
        {team ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{team.name}</p>
            </div>

            {/* Teammates */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Teammates</h3>
              {teammates.length > 0 ? (
                <div className="space-y-2">
                  {teammates.map((t) => (
                    <div key={t.id} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900 font-medium text-sm">
                          {t.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{t.name} {t.surname}</span>
                      </div>
                      <form action={removeTeammateAction} className="inline">
                        <input type="hidden" name="teamId" value={team.id} />
                        <input type="hidden" name="playerId" value={t.id} />
                        <button className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">Find a Teammate</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Add a teammate using their player code to complete your team.
                  </p>
                  <form action={addTeammateByCode} className="flex gap-2">
                    <input
                      name="playerCode"
                      placeholder="Enter player code"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-gray-900 dark:focus:border-white focus:ring-1 focus:ring-gray-900 dark:focus:ring-white outline-none transition-all text-gray-900 dark:text-white"
                      required
                    />
                    <SubmitButton className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
                      Add
                    </SubmitButton>
                  </form>
                </div>
              )}
            </div>

            {/* Performance Stats */}
            {team.league_id ? (
              ownStats ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Your Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Points" value={ownStats.points} />
                    <StatCard label="Matches Won" value={`${ownStats.matchesWon}/${ownStats.matchesPlayed}`} />
                    <StatCard label="Set Diff" value={ownStats.setsWon - ownStats.setsLost} />
                    <StatCard label="Games Diff" value={ownStats.gamesWon - ownStats.gamesLost} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No matches played yet</p>
                </div>
              )
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  Not Assigned to League
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your team is not assigned to a league yet. Contact an admin to get started.
                </p>
              </div>
            )}

            {/* Leaderboard */}
            {team.league_id && leaderboard.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">League Leaderboard</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="pb-3 pr-4 text-left font-medium text-gray-600 dark:text-gray-400">Rank</th>
                        <th className="pb-3 pr-4 text-left font-medium text-gray-600 dark:text-gray-400">Team</th>
                        <th className="pb-3 pr-4 text-center font-medium text-gray-600 dark:text-gray-400">Pts</th>
                        <th className="pb-3 pr-4 text-center font-medium text-gray-600 dark:text-gray-400">P</th>
                        <th className="pb-3 pr-4 text-center font-medium text-gray-600 dark:text-gray-400">W</th>
                        <th className="pb-3 pr-4 text-center font-medium text-gray-600 dark:text-gray-400">Sets</th>
                        <th className="pb-3 text-center font-medium text-gray-600 dark:text-gray-400">Games</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((row, index) => (
                        <tr
                          key={row.teamId}
                          className={`
                            transition-all border-b border-gray-100 dark:border-gray-800
                            hover:bg-gray-50 dark:hover:bg-gray-800
                            ${row.teamId === team?.id ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''}
                          `}
                        >
                          <td className="py-3 pr-4 text-gray-900 dark:text-white">{index + 1}</td>
                          <td className="py-3 pr-4 text-gray-900 dark:text-white">{row.teamName}</td>
                          <td className="py-3 pr-4 text-center font-medium text-gray-900 dark:text-white">{row.points}</td>
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
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Team Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't joined a team yet. Create one or join an existing team to get started!
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/protected/create-team"
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
              >
                Create Team
              </Link>
              <Link
                href="/protected/join-team"
                className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:border-gray-900 dark:hover:border-white transition-all"
              >
                Join Team
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Pending Matches */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Pending Matches</h2>
          {upcomingMatches.length > 0 && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
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
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              All Clear!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No pending matches at the moment. All matches have been completed!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  );
}
