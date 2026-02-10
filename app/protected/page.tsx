// app/protected/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/utils/supabase/server";
import { SubmitButton } from "@/components/submit-button";
import MatchCard from "@/components/match-card";
import { PlayerCodeCard } from "@/components/dashboard/PlayerCodeCard";
import { IconBadge } from "@/components/dashboard/IconBadge";

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
interface JoinedTeam {
  id: string;
  name: string;
}

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
  if (!user) redirect("/sign-in");

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

  // Profile incomplete
  if (!you) {
    return (
      <div className="max-w-md mx-auto px-5 pt-8 pb-10 animate-fade-in">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-xl bg-brand-orange flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-foreground">Complete your profile</h2>
          <p className="mt-2 text-muted-foreground">
            Hi {userName}. Add your details to join teams and play matches.
          </p>
          <Link
            href="/protected/edit-profile"
            className="mt-6 inline-block w-full sm:w-auto px-8 py-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-colors text-center"
          >
            Complete profile
          </Link>
        </div>
      </div>
    );
  }

  // Team membership
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

  // Pending matches
  let upcomingMatches: any[] = [];
  if (teamId) {
    const { data: matches } = await supabase
      .from("matches")
      .select(
        `
        id,
        team1_id,
        team2_id,
        team1:team1_id ( id, name ),
        team2:team2_id ( id, name )
      `
      )
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`);

    const matchesWithPlayers = await Promise.all(
      (matches ?? []).map(async (m: any) => {
        const { data: existingSets } = await supabase
          .from("match_sets")
          .select("id")
          .eq("match_id", m.id)
          .limit(1);

        // only pending matches
        if (existingSets && existingSets.length > 0) return null;

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
          team1Players: (team1Members ?? [])
            .flatMap((tm: any) => (Array.isArray(tm.player) ? tm.player : [tm.player]))
            .filter(Boolean),
          team2Players: (team2Members ?? [])
            .flatMap((tm: any) => (Array.isArray(tm.player) ? tm.player : [tm.player]))
            .filter(Boolean),
        };
      })
    );

    upcomingMatches = matchesWithPlayers.filter(Boolean);
  }

  // Stats + mini leaderboard
  const ownStats = teamId ? await calculateTeamStats(supabase, teamId) : null;
  const leaderboard = team?.league_id
    ? await calculateLeagueLeaderboard(supabase, team.league_id)
    : [];

  const topLeaderboard = leaderboard.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-5 pt-8 pb-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back, {userName}.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link
            href="/protected/edit-profile"
            className="w-full sm:w-auto px-5 py-3 rounded-lg border border-border bg-background text-foreground text-sm font-semibold hover:border-brand-orange transition-colors text-center"
          >
            Edit profile
          </Link>
          <Link
            href="/protected/leaderboards"
            className="w-full sm:w-auto px-5 py-3 rounded-lg border border-border bg-background text-foreground text-sm font-semibold hover:border-brand-orange transition-colors text-center"
          >
            Leaderboards
          </Link>
        </div>
      </div>

      {queryErrorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="font-semibold text-red-800 dark:text-red-200">Error</p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{queryErrorMessage}</p>
        </div>
      )}

      {/* Summary grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <PlayerCodeCard code={you.player_code} />

          {/* Team card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <IconBadge src="/icons/flaticon/team-people.png" alt="Team" />
                <div className="flex-1">
                  <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Team</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {team?.name ?? "No team"}
                  </p>
                </div>
              </div>
              {!team && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href="/protected/create-team"
                    className="w-full sm:flex-1 px-5 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white text-sm font-semibold rounded-lg text-center"
                  >
                    Create Team
                  </Link>
                  <Link
                    href="/protected/join-team"
                    className="w-full sm:flex-1 px-5 py-3 border border-border bg-background text-foreground text-sm font-semibold rounded-lg hover:border-brand-orange text-center"
                  >
                    Join Team
                  </Link>
                </div>
              )}
            </div>

            {team && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-foreground">Teammates</p>
                <div className="mt-3 space-y-2">
                  {teammates.length > 0 ? (
                    teammates.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {t.name} {t.surname}
                          </p>
                        </div>
                        <form action={removeTeammateAction} className="inline">
                          <input type="hidden" name="teamId" value={team.id} />
                          <input type="hidden" name="playerId" value={t.id} />
                          <button className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline">
                            Remove
                          </button>
                        </form>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-muted-foreground">No teammate yet.</p>
                      <form action={addTeammateByCode} className="mt-3 flex gap-2">
                        <input
                          name="playerCode"
                          placeholder="Enter player code"
                          className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none"
                          required
                        />
                        <SubmitButton className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                          Add
                        </SubmitButton>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {/* Performance */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <IconBadge src="/icons/flaticon/stats.png" alt="Performance" />
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Performance</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {team?.league_id ? "League stats" : "Your team is not in a league yet"}
                  </p>
                </div>
              </div>
            </div>

            {team?.league_id && ownStats ? (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Metric label="Points" value={ownStats.points} />
                <Metric label="Matches" value={ownStats.matchesPlayed} />
                <Metric label="Wins" value={ownStats.matchesWon} />
                <Metric label="Set diff" value={ownStats.setsWon - ownStats.setsLost} />
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">
                  {team ? "No matches played yet." : "Create or join a team to start playing."}
                </p>
              </div>
            )}
          </div>

          {/* Mini leaderboard */}
          {team?.league_id && leaderboard.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <IconBadge src="/icons/flaticon/leaderboard-podium.png" alt="Leaderboard" />
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">League</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">Top teams</p>
                  </div>
                </div>
                <Link
                  href={`/protected/league/${team.league_id}/leaderboard`}
                  className="text-sm font-semibold text-brand-orange hover:underline"
                >
                  View full
                </Link>
              </div>

              <div className="mt-4 space-y-2">
                {topLeaderboard.map((row, idx) => (
                  <div
                    key={row.teamId}
                    className={`flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 ${
                      row.teamId === team.id ? "ring-1 ring-brand-orange" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 text-sm font-semibold text-muted-foreground">{idx + 1}</span>
                      <span className="text-sm font-semibold text-foreground truncate">{row.teamName}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{row.points}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending matches */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <IconBadge src="/icons/flaticon/match-padel.png" alt="Matches" />
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Pending matches</h2>
              <p className="text-sm text-muted-foreground">Schedule and submit results for your upcoming matches.</p>
            </div>
          </div>
          {upcomingMatches.length > 0 && (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-muted text-muted-foreground">
              {upcomingMatches.length} {upcomingMatches.length === 1 ? "match" : "matches"}
            </span>
          )}
        </div>

        {upcomingMatches.length > 0 ? (
          <div className="space-y-3">
            {upcomingMatches.map((m: any) => (
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
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No pending matches.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
