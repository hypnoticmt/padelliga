// app/protected/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { SubmitButton } from "@/components/submit-button";
import { addTeammateByCode } from "./add-teammate/actions";
import { removeTeammateAction } from "./actions";

interface PlayerRow {
  id: number;
  user_id: string;
  name: string;
  surname: string;
}
interface TeamRow {
  id: number;
  name: string;
  league_id: number; // Added league_id property
  region_id: number;
  captain_id: number;
}
interface JoinedTeam {
  id: number;
  name: string; // Added name property
}
interface JoinedMatch {
  id: number; // Added id property
  match_date: string;
  team1: JoinedTeam | null;
  team2: JoinedTeam | null;
}
interface TeamLeaderboardRow {
  teamId: number;
  teamName: string;
  points: number;
  setDiff: number;
  gamesDiff: number;
}

export default async function PrivatePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = await createClient();

  // 1️⃣ Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const userName = user.user_metadata?.name || user.email;

  // pull out any `?error=…`
  const errorMessage = searchParams.error;

  // 2️⃣ Fetch your player row (with code)
  const { data: you } = await supabase
    .from("players")
    .select("id, user_id, name, surname, player_code")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!you) return <p className="p-5">Please complete your profile first.</p>;

  // 3️⃣ Find your team membership
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

  // 5️⃣ Load teammates
  let teammates: PlayerRow[] = [];
  if (teamId) {
    const { data: rows } = await supabase
      .from("team_members")
      .select("player:players(id, user_id, name, surname)")
      .eq("team_id", teamId);
    const all = (rows ?? []).flatMap((r: any) => r.player as PlayerRow[]);
    teammates = all.filter((p) => p.user_id !== user.id);
  }

  // 6️⃣ Helper for upcoming‐match joins
  const extractTeam = (v: any): JoinedTeam | null => {
    if (!v) return null;
    return Array.isArray(v) ? v[0] : v;
  };

  // 7️⃣ Upcoming matches
  const now = new Date().toISOString();
  let upcomingMatches: JoinedMatch[] = [];
  if (teamId) {
    const { data: matches } = await supabase
      .from("matches")
      .select(`
        id,
        match_date,
        team1:team1_id ( id, name ),
        team2:team2_id ( id, name )
      `)
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
      .gte("match_date", now);
    upcomingMatches = (matches ?? []).map((m: any) => ({
      id: m.id,
      match_date: m.match_date,
      team1: extractTeam(m.team1),
      team2: extractTeam(m.team2),
    }));
  }

  // 8️⃣ Compute team performance just for your team
  let ownPoints = 0, ownSetDiff = 0, ownGamesDiff = 0;
  if (teamId) {
    const { data: allM } = await supabase
      .from("matches")
      .select("*")
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`);
    for (const m of allM ?? []) {
      let w = 0, l = 0, tg = 0, og = 0;
      const { data: sets } = await supabase
        .from("match_sets")
        .select("*")
        .eq("match_id", m.id)
        .order("set_number", { ascending: true });
      for (const s of sets ?? []) {
        const is1 = m.team1_id === teamId;
        if ((is1 && s.set_winner === 1) || (!is1 && s.set_winner === 2)) w++;
        else l++;
        tg += is1 ? s.team1_games : s.team2_games;
        og += is1 ? s.team2_games : s.team1_games;
      }
      if (w > l) ownPoints++;
      ownSetDiff += w - l;
      ownGamesDiff += tg - og;
    }
  }

  // 9️⃣ Build the _league_ leaderboard
  let leaderboard: TeamLeaderboardRow[] = [];
  if (team?.league_id) {
    const { data: teamsInLeague } = await supabase
      .from("teams")
      .select("id, name")
      .eq("league_id", team.league_id);

    for (const t of teamsInLeague ?? []) {
      let pts = 0, sd = 0, gd = 0;
      const { data: matches } = await supabase
        .from("matches")
        .select("*")
        .or(`team1_id.eq.${t.id},team2_id.eq.${t.id}`);
      for (const m of matches ?? []) {
        let w = 0, l = 0, tg = 0, og = 0;
        const { data: sets } = await supabase
          .from("match_sets")
          .select("*")
          .eq("match_id", m.id)
          .order("set_number", { ascending: true });
        for (const s of sets ?? []) {
          const is1 = m.team1_id === t.id;
          if ((is1 && s.set_winner === 1) || (!is1 && s.set_winner === 2)) w++;
          else l++;
          tg += is1 ? s.team1_games : s.team2_games;
          og += is1 ? s.team2_games : s.team1_games;
        }
        if (w > l) pts++;
        sd += w - l;
        gd += tg - og;
      }
      leaderboard.push({
        teamId: t.id,
        teamName: t.name,
        points: pts,
        setDiff: sd,
        gamesDiff: gd,
      });
    }

    leaderboard.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.setDiff !== a.setDiff) return b.setDiff - a.setDiff;
      return b.gamesDiff - a.gamesDiff;
    });
  }

  return (
    <div className="p-5 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* ← NEW: global error banner */}
      {errorMessage && (
        <div className="bg-red-600 text-white p-3 rounded">
          {decodeURIComponent(errorMessage)}
        </div>
      )}

      <p className="text-lg">Welcome, {userName}!</p>

      {/* Your Player Code */}
      <div className="border rounded p-4">
        <strong>Your Player Code:</strong>{" "}
        <code className="text-xl">{you.player_code ?? "—"}</code>
      </div>

      {/* Your Team */}
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
                      <form action={removeTeammateAction} className="inline ml-2">
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

            {/* Add-by-code only if no teammate */}
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

            {/* Your Team’s Performance */}
            <div className="mt-4 border-t pt-4">
              <h3 className="font-medium">Your Performance</h3>
              <p>Points: {ownPoints}</p>
              <p>Set Diff: {ownSetDiff}</p>
              <p>Games Diff: {ownGamesDiff}</p>
            </div>

            {/* League Leaderboard */}
            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium">League Leaderboard</h3>
              <table className="w-full text-left mt-2">
                <thead>
                  <tr>
                    <th className="pb-2">Team</th>
                    <th className="pb-2">Pts</th>
                    <th className="pb-2">Sets</th>
                    <th className="pb-2">Games</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row) => (
                    <tr
                      key={row.teamId}
                      className={
                        row.teamId === team?.id ? "font-bold bg-gray-800" : ""
                      }
                    >
                      <td className="py-1">{row.teamName}</td>
                      <td className="py-1">{row.points}</td>
                      <td className="py-1">{row.setDiff}</td>
                      <td className="py-1">{row.gamesDiff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>You are not assigned to a team yet.</p>
        )}
      </section>

      {/* Upcoming Matches */}
      <section className="border rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Upcoming Matches</h2>
        {upcomingMatches.length > 0 ? (
          <ul className="list-disc pl-6">
            {upcomingMatches.map((m) => (
              <li key={m.id} className="flex items-center gap-2">
                {m.team1?.name ?? "TBD"} vs {m.team2?.name ?? "TBD"} on{" "}
                {new Date(m.match_date).toLocaleString()}
                <Link
                  href={`/protected/submit-score?matchId=${m.id}`}
                  className="ml-auto"
                >
                  <SubmitButton>Submit Score</SubmitButton>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No upcoming matches scheduled.</p>
        )}
      </section>
    </div>
  );
}
