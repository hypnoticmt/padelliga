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
    let offset = 0;

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
    setMessage("League started successfully!");
    setTimeout(() => setMessage(""), 3000);
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
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const { data: teamsData } = await supabaseClient
      .from("teams")
      .select("*, league_id");

    setTeams(teamsData || []);
    setSelectedTeam("");
    setSelectedLeague("");
    setMessage("Team assigned successfully!");
    setTimeout(() => setMessage(""), 3000);
  }

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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage leagues, teams, and matches
        </p>
      </div>

      {/* Success Message */}
      {message && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 animate-fade-in">
          <p className="text-green-800 dark:text-green-200 font-medium">{message}</p>
        </div>
      )}

      {/* Manage Leagues */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Manage Leagues</h2>
        <div className="space-y-3">
          {leagues?.map((league) => (
            <div
              key={league.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-white">{league.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {league.league_started ? "Started" : "Not started"}
                </p>
              </div>
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
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Start League
                  </SubmitButton>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Assign Teams to League */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Assign Team to League</h2>
        
        <form onSubmit={handleAssignTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Select Team
            </label>
            <select
              name="teamId"
              required
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-gray-900 dark:text-white"
            >
              <option value="">-- Select Team --</option>
              {teams?.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} {team.league_id ? `→ ${leagueById[team.league_id] ?? "Unknown league"}` : "(Unassigned)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Select League
            </label>
            <select
              name="leagueId"
              required
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-gray-900 dark:text-white"
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
            className="w-full py-3 bg-orange-500 hover:bg-orange-600"
          >
            Assign Team to League
          </SubmitButton>
        </form>
      </section>

      {/* Teams Overview */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Teams in Leagues</h2>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => {
            const list = teamsByLeague[league.id] || [];
            return (
              <div key={league.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{league.name}</h3>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    {list.length} {list.length === 1 ? "team" : "teams"}
                  </span>
                </div>
                {list.length ? (
                  <ul className="space-y-2">
                    {list.map((t) => (
                      <li key={t.id} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">{t.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTeam(t.id);
                            setSelectedLeague(league.id);
                          }}
                          className="text-xs text-orange-500 hover:text-orange-600 underline"
                        >
                          Reassign
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No teams yet.</p>
                )}
              </div>
            );
          })}

          {/* Unassigned */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Unassigned</h3>
              <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                {unassignedTeams.length} {unassignedTeams.length === 1 ? "team" : "teams"}
              </span>
            </div>
            {unassignedTeams.length ? (
              <ul className="space-y-2">
                {unassignedTeams.map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-900 dark:text-white">{t.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTeam(t.id)}
                      className="text-xs text-orange-500 hover:text-orange-600 underline"
                    >
                      Assign
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">All teams assigned</p>
            )}
          </div>
        </div>
      </section>

      {/* All Matches */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">All Matches</h2>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</label>
            <select
              value={leagueFilter}
              onChange={(e) => setLeagueFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-gray-900 dark:text-white"
            >
              <option value="">All leagues</option>
              {leagues.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredMatches.map((m: any) => (
            <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 gap-3">
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
                  {teamById[m.team1_id] || "Team 1"} vs {teamById[m.team2_id] || "Team 2"}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <span>{leagueById[m.league_id] || "Unknown league"}</span>
                  {m.match_date && (
                    <span>{new Date(m.match_date).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {m.score_summary && (
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium">
                    {m.score_summary}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  m.status === 'Completed' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {m.status || 'Scheduled'}
                </span>
              </div>
            </div>
          ))}
          {filteredMatches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No matches found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
