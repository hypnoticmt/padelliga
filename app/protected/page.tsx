// app/protected/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// Define interfaces for your data
interface PlayerRow {
  id: string;
  user_id: string;
  name: string;
  surname: string;
  phone?: string;
  team_id?: string;
}

interface TeamRow {
  id: string;
  name: string;
  league_id?: string;
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

  // 1. Check if the user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }
  const userName = user.user_metadata?.name || user.email;

  // 2. Fetch the player's profile
  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (playerError) {
    console.error("Error fetching player data:", playerError.message);
  }
  if (!player) {
    return (
      <div className="p-5">
        <p className="text-lg">Welcome {userName}!</p>
        <p className="text-sm text-foreground/70">
          Your player profile is not set up yet.
        </p>
      </div>
    );
  }

  // 3. Fetch team info
  const teamId = player.team_id;
  let team: TeamRow | null = null;
  if (teamId) {
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .maybeSingle();
    if (teamError) {
      console.error("Error fetching team data:", teamError.message);
    }
    team = teamData;
  }

  // 4. Fetch teammates
  let teammates: PlayerRow[] = [];
  if (teamId) {
    const { data: teammatesData, error: teammatesError } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .neq("user_id", user.id);
    if (teammatesError) {
      console.error("Error fetching teammates:", teammatesError.message);
    }
    teammates = (teammatesData as PlayerRow[]) ?? [];
  }

 // Helper to extract team from joined data
const extractTeam = (value: any): JoinedTeam | null => {
  if (!value) return null;
  return Array.isArray(value) ? (value.length > 0 ? value[0] : null) : value;
};

// 5. Fetch upcoming matches with joined team names
const now = new Date().toISOString();
console.log("Now:", now);

let upcomingMatches: JoinedMatch[] = [];
if (teamId) {
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select(`
      id,
      match_date,
      team1:team1_id ( id, name ),
      team2:team2_id ( id, name )
    `)
    .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
    .gte("match_date", now);

  if (matchesError) {
    console.error("Error fetching matches:", matchesError.message);
  }

  // Cast the result to unknown and then map over it
  upcomingMatches = ((matches as unknown) as any[])?.map((match) => ({
    id: match.id,
    match_date: match.match_date,
    team1: extractTeam(match.team1),
    team2: extractTeam(match.team2),
  })) ?? [];
}


  return (
    <div className="p-5 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-lg">Welcome, {userName}!</p>

      {/* Player's Team Section */}
      <section className="border border-foreground/10 rounded-md p-4">
        <h2 className="text-xl font-semibold mb-2">Your Team</h2>
        {team ? (
          <>
            <p className="text-lg">{team.name}</p>
            <h3 className="text-lg font-semibold mt-4">Teammates:</h3>
            {teammates.length > 0 ? (
              <ul className="list-disc pl-6">
                {teammates.map((mate) => (
                  <li key={mate.id}>
                    {mate.name} {mate.surname}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground/70">
                You don't have any teammates registered yet.
              </p>
            )}
          </>
        ) : (
          <p>You are not assigned to a team yet.</p>
        )}
      </section>

      {/* Upcoming Matches Section */}
      <section className="border border-foreground/10 rounded-md p-4">
        <h2 className="text-xl font-semibold mb-2">Upcoming Matches</h2>
        {upcomingMatches.length > 0 ? (
          <ul className="list-disc pl-6">
            {upcomingMatches.map((match) => (
              <li key={match.id}>
                {(match.team1?.name ?? "TBD")} vs{" "}
                {(match.team2?.name ?? "TBD")} on{" "}
                {new Date(match.match_date).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-foreground/70">
            No upcoming matches scheduled.
          </p>
        )}
      </section>
    </div>
  );
}
