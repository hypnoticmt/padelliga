// app/leaderboards/page.tsx
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AllLeaderboardsPage() {
  const supabase = await createClient();

  // Fetch all leagues (assuming you have an 'id' and 'name' column)
  const { data: leagues, error } = await supabase
    .from("leagues")
    .select("id, name");
  if (error) {
    console.error("Error fetching leagues:", error.message);
  }
  const leagueList = leagues ?? [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">All Leagues Leaderboards</h1>
      <ul className="list-disc pl-6">
        {leagueList.map((league: any) => (
          <li key={league.id}>
            <Link href={`/protected/league/${league.id}/leaderboard`}>
              {league.name} Leaderboard
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
