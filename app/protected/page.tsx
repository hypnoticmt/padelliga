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

  // 6️⃣ Extract team helper
  const extractTeam = (v: any): JoinedTeam | null => {
    if (!v) return null;
    return Array.isArray(v) ? v[0] : v;
  };

  // 7️⃣ Pending matches (no scores submitted yet) with player information
  let upcomingMatches: any[] = [];
  if (teamId) {
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        team1_id,
        team2_id,
        team1:team1_id ( id, name ),
        team2:team2_id ( id, name )
      `)
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`);
    
    if (matchesError) {
      console.error("Error fetching matches:", matchesError);
    }
    
    // Fetch player details for each match
    const matchesWithPlayers = await Promise.all(
      (matches ?? []).map(async (m: any) => {
        try {
          // Check if this match already has scores
          const { data: existingSets } = await supabase
            .from("match_sets")
            .select("id")
            .eq("match_id", m.id)
            .limit(1);
          
          // Skip matches that already have scores
          if (existingSets && existingSets.length > 0) {
            return null;
          }
          
          // Fetch team1 players
          const { data: team1Members } = await supabase
            .from("team_members")
            .select("player:players(id, name, surname, phone)")
            .eq("team_id", m.team1_id);
          
          // Fetch team2 players
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
          console.error(`Error fetching players for match ${m.id}:`, error);
          // Return match anyway, even if player fetch fails
          return {
            id: m.id,
            team1_id: m.team1_id,
            team2_id: m.team2_id,
            team1: extractTeam(m.team1),
            team2: extractTeam(m.team2),
            team1Players: [],
            team2Players: [],
          };
        }
      })
    );

    upcomingMatches = matchesWithPlayers.filter(Boolean); // Remove null entries (completed matches)
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

      {/* 📅 Pending Matches (no scores submitted yet) */}
      <section className="border rounded p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pending Matches</h2>
          <span className="text-sm text-muted-foreground">
            {upcomingMatches.length} {upcomingMatches.length === 1 ? 'match' : 'matches'}
          </span>
        </div>
        {upcomingMatches.length > 0 ? (
          <div className="space-y-3">
            {upcomingMatches.map((m) => (
              <MatchCard
                key={m.id}
                matchId={m.id}
                team1Name={m.team1?.name ?? "TBD"}
                team2Name={m.team2?.name ?? "TBD"}
                team1Players={m.team1Players}
                team2Players={m.team2Players}
                isTeam1={m.team1_id === teamId}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No pending matches. All matches have been completed!</p>
        )}
      </section>
    </div>
  );
}