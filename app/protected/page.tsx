// app/protected/page.tsx
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { SubmitButton } from "@/components/submit-button"

interface PlayerRow {
  id: string
  user_id: string
  name: string
  surname: string
  phone?: string
}

interface TeamRow {
  id: string
  name: string
  league_id?: string
  region_id?: string
  captain_id?: string
}

interface JoinedTeam {
  id: string
  name: string
}

interface JoinedMatch {
  id: string
  match_date: string
  team1: JoinedTeam | null
  team2: JoinedTeam | null
}

export default async function PrivatePage() {
  const supabase = await createClient()

  // 1️⃣ Ensure logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")
  const userName = user.user_metadata?.name || user.email

  // 2️⃣ Lookup this player's PK
  const { data: player, error: pErr } = await supabase
    .from("players")
    .select("id, user_id")
    .eq("user_id", user.id)
    .maybeSingle()
  if (pErr) console.error("Error fetching player record:", pErr.message)
  if (!player) {
    return (
      <div className="p-5">
        <p className="text-lg">Welcome, {userName}!</p>
        <p className="text-sm text-foreground/70">
          You need to complete your player profile first.
        </p>
      </div>
    )
  }

  // 3️⃣ Fetch your single membership AND the team in one go
  const { data: membership, error: memErr } = await supabase
    .from("team_members")
    .select(`
      team:teams(
        id, name, league_id, region_id, captain_id
      )
    `)
    .eq("player_id", player.id)
    .maybeSingle()
  console.log("membership raw:", membership, "error:", memErr)
  if (memErr) console.error("Error fetching membership:", memErr.message)

  // unpack the team directly
  const team: TeamRow | null = Array.isArray(membership?.team) ? membership.team[0] ?? null : membership?.team ?? null

  // 4️⃣ Fetch teammates via the same bridge
  let teammates: PlayerRow[] = []
  if (team) {
    const { data: rows, error: tmErr } = await supabase
      .from("team_members")
      .select("player:players(id, user_id, name, surname)")
      .eq("team_id", team.id)
    if (tmErr) {
      console.error("Error fetching teammates:", tmErr.message)
    } else {
      const allP = (rows ?? []).flatMap(r => r.player as PlayerRow[])
      teammates = allP
        .filter(p => p.user_id !== user.id)
        .map(p => ({
          id: p.id,
          user_id: p.user_id,
          name: p.name,
          surname: p.surname,
        }))
    }
  }

  // helper for unwrapping joined teams in matches
  const extractTeam = (v: any): JoinedTeam | null => {
    if (!v) return null
    return Array.isArray(v) ? v[0] ?? null : v
  }

  // 5️⃣ Upcoming matches
  const now = new Date().toISOString()
  let upcomingMatches: JoinedMatch[] = []
  if (team) {
    const { data: matches, error: mkErr } = await supabase
      .from("matches")
      .select(`
        id,
        match_date,
        team1:team1_id ( id, name ),
        team2:team2_id ( id, name )
      `)
      .or(`team1_id.eq.${team.id},team2_id.eq.${team.id}`)
      .gte("match_date", now)
    if (mkErr) console.error("Error fetching upcoming matches:", mkErr.message)
    else {
      upcomingMatches = (matches as any[]).map(m => ({
        id: m.id,
        match_date: m.match_date,
        team1: extractTeam(m.team1),
        team2: extractTeam(m.team2),
      }))
    }
  }

  // 6️⃣ Compute team performance
  let points = 0,
    setDiff = 0,
    gamesDiff = 0
  if (team) {
    const { data: allM, error: aErr } = await supabase
      .from("matches")
      .select("*")
      .or(`team1_id.eq.${team.id},team2_id.eq.${team.id}`)
    if (aErr) console.error("Error fetching all matches:", aErr.message)
    else {
      for (const m of (allM ?? []) as any[]) {
        let won = 0,
          lost = 0,
          tg = 0,
          og = 0
        const { data: sets, error: sErr } = await supabase
          .from("match_sets")
          .select("*")
          .eq("match_id", m.id)
          .order("set_number", { ascending: true })
        if (sErr) continue

        for (const s of sets ?? []) {
          const is1 = m.team1_id === team.id
          if ((is1 && s.set_winner === 1) || (!is1 && s.set_winner === 2)) {
            won++
          } else {
            lost++
          }
          tg += is1 ? s.team1_games : s.team2_games
          og += is1 ? s.team2_games : s.team1_games
        }
        if (won > lost) points++
        setDiff += won - lost
        gamesDiff += tg - og
      }
    }
  }

  return (
    <div className="p-5 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-lg">Welcome, {userName}!</p>

      {/* Your Team Section */}
      <section className="border border-gray-200 rounded-md p-4">
        <h2 className="text-xl font-semibold mb-2">Your Team</h2>
        {team ? (
          <>
            <p className="text-lg">{team.name}</p>

            <div className="mt-4">
              <h3 className="text-lg font-semibold">Teammates:</h3>
              {teammates.length > 0 ? (
                <ul className="list-disc pl-6">
                  {teammates.map(t => (
                    <li key={t.id}>{t.name} {t.surname}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No teammates registered yet.
                </p>
              )}
            </div>

            <div className="mt-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Team Performance</h3>
              <p>Points: {points}</p>
              <p>Set Difference: {setDiff}</p>
              <p>Games Difference: {gamesDiff}</p>
            </div>
          </>
        ) : (
          <p>You are not assigned to a team yet.</p>
        )}
      </section>

      {/* Upcoming Matches Section */}
      <section className="border border-gray-200 rounded-md p-4">
        <h2 className="text-xl font-semibold mb-2">Upcoming Matches</h2>
        {upcomingMatches.length > 0 ? (
          <ul className="list-disc pl-6">
            {upcomingMatches.map(m => (
              <li key={m.id} className="flex items-center gap-2">
                {m.team1?.name ?? "TBD"} vs {m.team2?.name ?? "TBD"} on{' '}
                {new Date(m.match_date).toLocaleString()}
                <Link href={`/protected/submit-score?matchId=${m.id}`}>
                  <SubmitButton className="px-3 py-1">Submit Score</SubmitButton>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            No upcoming matches scheduled.
          </p>
        )}
      </section>
    </div>
  )
}
