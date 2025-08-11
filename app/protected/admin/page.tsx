// app/protected/admin/page.tsx
"use client";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";


import { useState, useEffect, useMemo } from "react";

export default function AdminPage() {
  const supabaseClient = createClient();

  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("");

  // lookups for names
  const leagueById = useMemo(() => {
    const m: Record<string, string> = {};
    leagues.forEach((l: any) => (m[l.id] = l.name));
    return m;
  }, [leagues]);

  const teamById = useMemo(() => {
    const m: Record<string, string> = {};
    teams.forEach((t: any) => (m[t.id] = t.name));
    return m;
  }, [teams]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m: any) => (leagueFilter ? m.league_id === leagueFilter : true));
  }, [matches, leagueFilter]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) {
        redirect("/sign-in");
      }

      const { data: profile } = await supabaseClient
        .from("players")
        .select("is_admin")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.is_admin) {
        redirect("/protected/");
      }

      const { data: leaguesData } = await supabaseClient.from("leagues").select("*");
      setLeagues(leaguesData || []);

      const { data: teamsData } = await supabaseClient
        .from("teams")
        .select("*, league_id");
      setTeams(teamsData || []);

      await refreshMatches();
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  async function refreshMatches() {
    const { data } = await supabaseClient
      .from("matches")
      .select("id, league_id, team1_id, team2_id, match_date, score_summary, status")
      .order("match_date", { ascending: false });
    setMatches(data || []);
  }

  async function handleStartLeague(formData: FormData) {
    const leagueId = formData.get("leagueId") as string;

    const { data: teamsData } = await supabaseClient
      .from("teams")
      .select("id")
      .eq("league_id", leagueId);

    const base = Date.now();
    let offset = 0; // 1 day between created matches

    for (let i = 0; i < (teamsData?.length || 0); i++) {
      for (let j = i + 1; j < (teamsData?.length || 0); j++) {
        await supabaseClient.from("matches").insert({
          league_id: leagueId,
          team1_id: teamsData![i].id,
          team2_id: teamsData![j].id,
          match_date: new Date(base + offset * 24 * 60 * 60 * 1000).toISOString(),
          status: "Scheduled",
        });
        offset++;
      }
    }

    await supabaseClient
      .from("leagues")
      .update({ league_started: true })
      .eq("id", leagueId);

    await refreshMatches();
    setMessage("League started!");
  }

  async function handleAssignTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const teamId = formData.get("teamId") as string;
    const leagueId = formData.get("leagueId") as string;

    const { error } = await supabaseClient
      .from("teams")
      .update({ league_id: leagueId, league_name: leagueById[leagueId] ?? null })
      .eq("id", teamId);

    if (error) {
      console.error("Error updating team league_id:", error.message);
      setMessage("Error assigning team to league!");
      return;
    }

    // Re-fetch teams after update
    const { data: teamsData } = await supabaseClient
      .from("teams")
      .select("*, league_id");

    setTeams(teamsData || []);
    setSelectedTeam("");
    setSelectedLeague("");
    setMessage("Team assigned to league!");
  }

  // Derived groups for cards
  const unassignedTeams = useMemo(() => teams.filter((t) => !t.league_id), [teams]);

  const teamsByLeague = useMemo(() => {
    const m: Record<string, any[]> = {};
    leagues.forEach((l) => (m[l.id] = []));
    teams.forEach((t) => {
      if (t.league_id && m[t.league_id]) m[t.league_id].push(t);
    });
    return m;
  }, [leagues, teams]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Manage Leagues */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Manage Leagues</h2>
        <ul className="space-y-2">
          {leagues?.map((league) => (
            <li
              key={league.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <span>
                {league.name} {league.league_started ? "(Started)" : "(Not started)"}
              </span>
              {!league.league_started && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleStartLeague(formData);
                  }}
                >
                  <input type="hidden" name="leagueId" value={league.id} />
                  <SubmitButton
                    type="submit"
                    className="bg-primary px-3 py-1 rounded"
                  >
                    Start League
                  </SubmitButton>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Assign Teams to League */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Assign Team to League</h2>
        <form onSubmit={handleAssignTeam} className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Select Team</label>
            <select
              name="teamId"
              required
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full p-3 rounded-lg border text-sm"
            >
              <option value="">-- Select Team --</option>
              {teams?.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} {team.league_id ? `→ ${leagueById[team.league_id] ?? team.league_name ?? "Unknown league"}` : "(Unassigned)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select League</label>
            <select
              name="leagueId"
              required
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full p-3 rounded-lg border text-sm"
            >
              <option value="">-- Select League --</option>
              {leagues?.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>

          <SubmitButton
            type="submit"
            className="w-full bg-primary px-4 py-2 rounded"
          >
            Assign Team to League
          </SubmitButton>
        </form>

        {message && (
          <p className="text-green-600 text-sm text-center mt-4">{message}</p>
        )}
      </section>

      {/* Teams by league (cards) */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Teams in Leagues</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {leagues.map((league) => {
            const list = teamsByLeague[league.id] || [];
            return (
              <div key={league.id} className="border rounded-lg p-4 shadow-sm bg-background">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{league.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full border">
                    {list.length} {list.length === 1 ? "team" : "teams"}
                  </span>
                </div>
                {list.length ? (
                  <ul className="text-sm space-y-1">
                    {list.map((t) => (
                      <li key={t.id} className="flex items-center justify-between">
                        <span>{t.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTeam(t.id);
                            setSelectedLeague(league.id);
                          }}
                          className="text-xs underline"
                        >
                          Reassign
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No teams yet.</p>
                )}
              </div>
            );
          })}

          {/* Unassigned */}
          <div className="border rounded-lg p-4 shadow-sm bg-background">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Unassigned</h3>
              <span className="text-xs px-2 py-1 rounded-full border">
                {unassignedTeams.length} {unassignedTeams.length === 1 ? "team" : "teams"}
              </span>
            </div>
            {unassignedTeams.length ? (
              <ul className="text-sm space-y-1">
                {unassignedTeams.map((t) => (
                  <li key={t.id} className="flex items-center justify-between">
                    <span>{t.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTeam(t.id)}
                      className="text-xs underline"
                    >
                      Assign…
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">All teams assigned ✔</p>
            )}
          </div>
        </div>
      </section>

      {/* All Matches */}
      <section>
        <h2 className="text-xl font-semibold mb-2">All Matches</h2>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm">Filter:</label>
          <select
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
            className="p-2 border rounded text-sm"
          >
            <option value="">All leagues</option>
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          {filteredMatches.map((m: any) => (
            <div key={m.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {teamById[m.team1_id] || "Team 1"} vs {teamById[m.team2_id] || "Team 2"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {leagueById[m.league_id] || "Unknown league"} • {m.match_date ? new Date(m.match_date).toLocaleString() : "No date"}
                </div>
              </div>
              <div className="text-sm font-semibold">
                {m.score_summary || "—"}
              </div>
            </div>
          ))}
          {filteredMatches.length === 0 && (
            <p className="text-sm text-muted-foreground">No matches found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
