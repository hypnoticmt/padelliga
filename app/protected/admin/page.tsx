// app/protected/admin/page.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";


import { useState, useEffect } from "react";

export default function AdminPage() {
  const supabaseClient = createClient();

  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("");

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
    };

    fetchData();
  }, [message]);

  async function handleStartLeague(formData: FormData) {
    const leagueId = formData.get("leagueId") as string;

    const { data: teamsData } = await supabaseClient
      .from("teams")
      .select("id")
      .eq("league_id", leagueId);

    for (let i = 0; i < teamsData!.length; i++) {
      for (let j = i + 1; j < teamsData!.length; j++) {
        await supabaseClient.from("matches").insert({
          league_id: leagueId,
          team1_id: teamsData![i].id,
          team2_id: teamsData![j].id,
        });
      }
    }

    await supabaseClient
      .from("leagues")
      .update({ league_started: true })
      .eq("id", leagueId);

    setMessage("League started!");
  }

  async function handleAssignTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const teamId = formData.get("teamId") as string;
    const leagueId = formData.get("leagueId") as string;

    const { error } = await supabaseClient
      .from("teams")
      .update({ league_id: leagueId })
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
                  <button
                    type="submit"
                    className="bg-primary text-white px-3 py-1 rounded"
                  >
                    Start League
                  </button>
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
                  {team.name} {team.league_id ? `→ League ID: ${team.league_id}` : "(Unassigned)"}
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

          <button
            type="submit"
            className="w-full bg-primary text-white px-4 py-2 rounded"
          >
            Assign Team to League
          </button>
        </form>

        {message && (
          <p className="text-green-600 text-sm text-center mt-4">{message}</p>
        )}
      </section>
    </div>
  );
}
