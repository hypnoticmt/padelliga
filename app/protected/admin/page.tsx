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
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage leagues, teams, and matches
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3 animate-slide-in">
          <span className="text-2xl">✅</span>
          <p className="text-green-800 dark:text-green-200 font-medium">{message}</p>
        </div>
      )}

      {/* Manage Leagues */}
      <section className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500 rounded-xl">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Manage Leagues</h2>
        </div>
        <div className="space-y-3">
          {leagues?.map((league) => (
            <div
              key={league.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{league.league_started ? "✅" : "⏳"}</span>
                <div>
                  <p className="font-semibold text-lg">{league.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {league.league_started ? "Started" : "Not started"}
                  </p>
                </div>
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
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <span className="flex items-center gap-2">
                      <span>🚀</span>
                      Start League
                    </span>
                  </SubmitButton>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Assign Teams to League */}
      <section className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500 rounded-xl">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Assign Team to League</h2>
        </div>
        
        <form onSubmit={handleAssignTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Select Team
            </label>
            <select
              name="teamId"
              required
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/50 outline-none transition-all"
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Select League
            </label>
            <select
              name="leagueId"
              required
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/50 outline-none transition-all"
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
            className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <span className="flex items-center justify-center gap-2">
              <span>✨</span>
              Assign Team to League
            </span>
          </SubmitButton>
        </form>
      </section>

      {/* Teams Overview */}
      <section className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500 rounded-xl">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Teams in Leagues</h2>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => {
            const list = teamsByLeague[league.id] || [];
            return (
              <div key={league.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{league.name}</h3>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-semibold">
                    {list.length} {list.length === 1 ? "team" : "teams"}
                  </span>
                </div>
                {list.length ? (
                  <ul className="space-y-2">
                    {list.map((t) => (
                      <li key={t.id} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="font-medium">{t.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTeam(t.id);
                            setSelectedLeague(league.id);
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                        >
                          Reassign
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No teams yet.</p>
                )}
              </div>
            );
          })}

          {/* Unassigned */}
          <div className="border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">⚠️ Unassigned</h3>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-xs font-semibold">
                {unassignedTeams.length} {unassignedTeams.length === 1 ? "team" : "teams"}
              </span>
            </div>
            {unassignedTeams.length ? (
              <ul className="space-y-2">
                {unassignedTeams.map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700">
                    <span className="font-medium">{t.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTeam(t.id)}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline"
                    >
                      Assign…
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">All teams assigned ✓</p>
            )}
          </div>
        </div>
      </section>

      {/* All Matches */}
      <section className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-xl">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">All Matches</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Filter:</label>
            <select
              value={leagueFilter}
              onChange={(e) => setLeagueFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:border-yellow-500 dark:focus:border-yellow-500 outline-none transition-all"
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
            <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 gap-3">
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">
                  {teamById[m.team1_id] || "Team 1"} vs {teamById[m.team2_id] || "Team 2"}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {leagueById[m.league_id] || "Unknown league"}
                  </span>
                  {m.match_date && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(m.match_date).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {m.score_summary && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-semibold">
                    {m.score_summary}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  m.status === 'Completed' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                }`}>
                  {m.status || 'Scheduled'}
                </span>
              </div>
            </div>
          ))}
          {filteredMatches.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl mb-2 block">📋</span>
              <p className="text-gray-500 dark:text-gray-400">No matches found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}