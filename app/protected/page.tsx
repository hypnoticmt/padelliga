// app/protected/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { SubmitButton } from "@/components/submit-button";
import { addTeammateByCode } from "./add-teammate/actions";  // ← NEW

interface PlayerRow {
  id: string;
  user_id: string;
  name: string;
  surname: string;
  phone?: string;
  player_code?: string;        // ← include player_code
}

interface TeamRow {
  id: string;
  name: string;
  league_id?: string;
  region_id?: string;
  captain_id?: string;
}

interface JoinedTeam {
  id: string;
  name: string;
}

interface JoinedMatch {
  id: string;
  match_date: string;
  team1: JoinedTeam | null;
  team2: JoinedTeam | null;
}

export default async function PrivatePage() {
  const supabase = await createClient();

  // 1️⃣ Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const userName = user.user_metadata?.name || user.email;

  // 2️⃣ Fetch *your* player row (including your code)
  const { data: you, error: youErr } = await supabase
    .from("players")
    .select("id, user_id, name, surname, player_code")
    .eq("user_id", user.id)
    .maybeSingle();
  if (youErr) console.error(youErr);
  if (!you) {
    return (
      <div className="p-5">
        <p className="text-lg">Welcome, {userName}!</p>
        <p className="text-sm text-gray-500">
          Please complete your player profile first.
        </p>
      </div>
    );
  }

  // 3️⃣ Find *your* team via the bridge table
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("player_id", you.id)
    .maybeSingle();
  const teamId = membership?.team_id;

  // 4️⃣ Load that team’s info
  let team: TeamRow | null = null;
  if (teamId) {
    const { data: t } = await supabase
      .from("teams")
      .select("id, name, league_id, region_id, captain_id")
      .eq("id", teamId)
      .maybeSingle();
    team = t;
  }

  // 5️⃣ Load *all* teammates via join
  let teammates: PlayerRow[] = [];
  if (teamId) {
    const { data: rows } = await supabase
      .from("team_members")
      .select("player:players(id, user_id, name, surname)")
      .eq("team_id", teamId);
    const all = (rows ?? []).flatMap((r: any) => r.player as PlayerRow[]);
    teammates = all.filter((p) => p.user_id !== user.id);
  }

  // 6️⃣ Helper for matches …
  const extractTeam = (v: any): JoinedTeam | null => {
    if (!v) return null;
    return Array.isArray(v) ? v[0] : v;
  };

  // 7️⃣ Upcoming matches …
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

  // 8️⃣ Compute performance (same logic you already have)…
  let points = 0,
    setDiff = 0,
    gamesDiff = 0;
  if (teamId) {
    const { data: allM } = await supabase
      .from("matches")
      .select("*")
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`);
    for (const m of allM ?? []) {
      let won = 0,
        lost = 0,
        tg = 0,
        og = 0;
      const { data: sets } = await supabase
        .from("match_sets")
        .select("*")
        .eq("match_id", m.id)
        .order("set_number", { ascending: true });
      for (const s of sets ?? []) {
        const is1 = m.team1_id === teamId;
        if ((is1 && s.set_winner === 1) || (!is1 && s.set_winner === 2)) {
          won++;
        } else {
          lost++;
        }
        tg += is1 ? s.team1_games : s.team2_games;
        og += is1 ? s.team2_games : s.team1_games;
      }
      if (won > lost) points++;
      setDiff += won - lost;
      gamesDiff += tg - og;
    }
  }

  return (
    <div className="p-5 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-lg">Welcome, {userName}!</p>

      {/* 🔹 Show your player code */}
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
                      {t.name} {t.surname}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No teammates yet.</p>
              )}
            </div>

            {/* ➕ Add by code form */}
            <form
              action={addTeammateByCode}
              className="mt-4 flex gap-2 items-center"
            >
              <input
                type="text"
                name="playerCode"
                placeholder="Enter player code"
                className="border px-2 py-1 rounded"
                required
              />
              <SubmitButton
                type="submit"
                className=""
              >
                Add Teammate
              </SubmitButton>
            </form>

            {/* Performance */}
            <div className="mt-4 border-t pt-4">
              <h3 className="font-medium">Team Performance</h3>
              <p>Points: {points}</p>
              <p>Set Diff: {setDiff}</p>
              <p>Games Diff: {gamesDiff}</p>
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
