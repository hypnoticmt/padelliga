// app/protected/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { SubmitButton } from "@/components/submit-button";
import { addTeammateByCode } from "./add-teammate/actions";
import { removeTeammateAction } from "./actions";
import { calculateLeagueLeaderboard, calculateTeamStats } from "@/lib/leaderboard";

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
interface JoinedMatch {
  id: string;
  match_date: string;
  status?: string;
  score_summary?: string | null;
  team1: JoinedTeam | null;
  team2: JoinedTeam | null;
}

export default async function PrivatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();

  // 0️⃣ Await and read any ?error=… param
  const { error: rawError } = await searchParams;
  const queryErrorMessage = rawError ? decodeURIComponent(rawError) : null;

  // 1️⃣ Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  // 2️⃣ Fetch this player's record
  const { data: you } = await supabase
    .from("players")
    .select("id, user_id, name, surname, player_code")
    .eq("user_id", user.id)
    .maybeSingle();
  
  // Use full name if available (name + surname from metadata or player record)
  const userName = you?.name && you?.surname 
    ? `${you.name} ${you.surname}` 
    : user.user_metadata?.name && user.user_metadata?.surname
    ? `${user.user_metadata.name} ${user.user_metadata.surname}`
    : user.user_metadata?.name || user.email!;
  
  if (!you) {
    return (
      <div className="p-5">
        <p className="text-lg">Hey, {userName}!</p>
        <p className="text-sm text-gray-500">
          Please complete your player profile first.
        </p>
      </div>
    );
  }

  // 3️⃣ Find your team via the bridge
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("player_id", you.id)
    .maybeSingle();
  const teamId = membership?.team_id;

  // 4️⃣ Load team info
  let team: TeamRow | null = null;
  if (teamId) {
    const { data: t } = await supabase
      .from("teams")
      .select("id, name, league_id, region_id, captain_id")
      .eq("id", teamId)
      .maybeSingle();
    team = t ?? null;
  }

  // 5️⃣ Teammates
  let teammates: PlayerRow[] = [];
  if (teamId) {
    const { data: rows } = await supabase
      .from("team_members")
      .select("player:players(id, user_id, name, surname)")
      .eq("team_id", teamId);
    const all = (rows ?? []).flatMap((r: any) => r.player as PlayerRow[]);
    teammates = all.filter((p) => p.user_id !== user.id);
  }

  // 6️⃣ Upcoming matches helper
  const extractTeam = (v: any): JoinedTeam | null => {
    if (!v) return null;
    return Array.isArray(v) ? v[0] : v;
  };

  // 7️⃣ Upcoming matches (matches that haven't been completed yet)
  let upcomingMatches: JoinedMatch[] = [];
  let completedMatches: JoinedMatch[] = [];
  
  if (teamId) {
    // Get pending matches
    const { data: pendingMatchesData } = await supabase
      .from("matches")
      .select(`
        id,
        match_date,
        status,
        score_summary,
        team1:team1_id ( id, name ),
        team2:team2_id ( id, name )
      `)
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
      .in("status", ["Scheduled", "In Progress"]);
    
    upcomingMatches = (pendingMatchesData ?? []).map((m: any) => ({
      id: m.id,
      match_date: m.match_date,
      status: m.status,
      score_summary: m.score_summary,
      team1: extractTeam(m.team1),
      team2: extractTeam(m.team2),
    }));

    // Get completed matches
    const { data: completedMatchesData } = await supabase
      .from("matches")
      .select(`
        id,
        match_date,
        status,
        score_summary,
        team1:team1_id ( id, name ),
        team2:team2_id ( id, name )
      `)
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
      .eq("status", "Completed")
      .order("match_date", { ascending: false })
      .limit(10);
    
    completedMatches = (completedMatchesData ?? []).map((m: any) => ({
      id: m.id,
      match_date: m.match_date,
      status: m.status,
      score_summary: m.score_summary,
      team1: extractTeam(m.team1),
      team2: extractTeam(m.team2),
    }));
  }

  // 8️⃣ 🚀 NEW: Use optimized team stats calculation
  let ownStats = null;
  if (teamId) {
    ownStats = await calculateTeamStats(supabase, teamId);
  }

  // 9️⃣ 🚀 NEW: Use optimized leaderboard calculation
  let leaderboard: any[] = [];
  if (team?.league_id) {
    leaderboard = await calculateLeagueLeaderboard(supabase, team.league_id);
  }

  return (
    <div className="p-5 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* 🚨 global error banner */}
      {queryErrorMessage && (
        <div className="bg-red-600 text-white p-3 rounded">
          {queryErrorMessage}
        </div>
      )}

      <p className="text-lg">Welcome, {userName}!</p>

      {/* 🆔 Your Player Code */}
      <div className="border rounded p-4">
        <strong>Your Player Code:</strong>{" "}
        <code className="text-xl">{you.player_code ?? "—"}</code>
      </div>

      {/* 👥 Your Team */}
      <section className="border rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Your Team</h2>
        {team ? (
          <>
            <p className="text-lg">{team.name}</p>

            {/* Teammates */}
            <div className="mt-4">
              <h3 className="font-medium">Teammates:</h3>
              {teammates.length > 0 ? (
                <ul className="list-disc pl-6">
                  {teammates.map((t) => (
                    <li key={t.id}>
                      {t.name} {t.surname}{" "}
                      <form
                        action={removeTeammateAction}
                        className="inline ml-2"
                      >
                        <input type="hidden" name="teamId" value={team.id} />
                        <input type="hidden" name="playerId" value={t.id} />
                        <button className="text-red-500">&times;</button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No teammates yet.</p>
              )}
            </div>

            {/* Add by code (only if you have 0 teammates) */}
            {teammates.length === 0 && (
              <form
                action={addTeammateByCode}
                className="mt-4 flex gap-2 items-center"
              >
                <input
                  name="playerCode"
                  placeholder="Enter player code"
                  className="border px-2 py-1 rounded flex-1"
                  required
                />
                <SubmitButton>Add Teammate</SubmitButton>
              </form>
            )}

            {/* 🚀 NEW: Your Performance with optimized calculation */}
            {team.league_id ? (
              ownStats ? (
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-medium">Your Performance</h3>
                  <p>Points: {ownStats.points}</p>
                  <p>Matches: {ownStats.matchesWon} / {ownStats.matchesPlayed}</p>
                  <p>Set Diff: {ownStats.setsWon - ownStats.setsLost}</p>
                  <p>Games Diff: {ownStats.gamesWon - ownStats.gamesLost}</p>
                </div>
              ) : (
                <div className="mt-4 border-t pt-4">
                  <p className="text-gray-500">No matches played yet.</p>
                </div>
              )
            ) : (
              <div className="mt-4 border-t pt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                <p className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ Your team is not assigned to a league yet. Contact an admin to assign your team to a league.
                </p>
              </div>
            )}

            {/* 🚀 NEW: League Leaderboard with optimized calculation */}
            {team.league_id && leaderboard.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-3">League Leaderboard</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 pr-4">Rank</th>
                        <th className="pb-2 pr-4">Team</th>
                        <th className="pb-2 pr-4 text-center">Pts</th>
                        <th className="pb-2 pr-4 text-center">P</th>
                        <th className="pb-2 pr-4 text-center">W</th>
                        <th className="pb-2 pr-4 text-center">Sets</th>
                        <th className="pb-2 text-center">Games</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((row, index) => (
                        <tr
                          key={row.teamId}
                          className={
                            row.teamId === team?.id 
                              ? "font-bold bg-blue-50 dark:bg-blue-900/20" 
                              : ""
                          }
                        >
                          <td className="py-2 pr-4">{index + 1}</td>
                          <td className="py-2 pr-4">{row.teamName}</td>
                          <td className="py-2 pr-4 text-center font-semibold">{row.points}</td>
                          <td className="py-2 pr-4 text-center text-sm text-gray-600 dark:text-gray-400">
                            {row.matchesPlayed}
                          </td>
                          <td className="py-2 pr-4 text-center text-sm text-gray-600 dark:text-gray-400">
                            {row.matchesWon}
                          </td>
                          <td className="py-2 pr-4 text-center text-sm">
                            {row.setsWon - row.setsLost > 0 ? '+' : ''}{row.setsWon - row.setsLost}
                          </td>
                          <td className="py-2 text-center text-sm">
                            {row.gamesWon - row.gamesLost > 0 ? '+' : ''}{row.gamesWon - row.gamesLost}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <p>You are not assigned to a team yet.</p>
        )}
      </section>

      {/* 📅 Pending Matches */}
      <section className="border rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Pending Matches</h2>
        {upcomingMatches.length > 0 ? (
          <ul className="space-y-2">
            {upcomingMatches.map((m) => (
              <li key={m.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-900">
                <span className="font-medium">
                  {m.team1?.name ?? "TBD"} vs {m.team2?.name ?? "TBD"}
                </span>
                <Link
                  href={`/protected/submit-score?matchId=${m.id}`}
                >
                  <SubmitButton>Submit Score</SubmitButton>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No pending matches. All matches have been played!</p>
        )}
      </section>

      {/* 📊 Match History */}
      {completedMatches.length > 0 && (
        <section className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Recent Match Results</h2>
          <ul className="space-y-2">
            {completedMatches.map((m) => {
              const matchDate = m.match_date ? new Date(m.match_date).toLocaleDateString() : 'Date N/A';
              return (
                <li key={m.id} className="flex items-center justify-between p-3 border rounded bg-gray-50 dark:bg-gray-900">
                  <div className="flex-1">
                    <div className="font-medium">
                      {m.team1?.name ?? "TBD"} vs {m.team2?.name ?? "TBD"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {matchDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {m.score_summary || "N/A"}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}