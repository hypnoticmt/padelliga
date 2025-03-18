// app/join-team/page.tsx
import { createClient } from "@/utils/supabase/server";

export default async function JoinTeamPage() {
  const supabase = await createClient();

  // Fetch teams available for joining. You may add filtering logic if necessary.
  const { data: teams, error } = await supabase.from("teams").select("id, name");
  if (error) {
    console.error("Error fetching teams:", error.message);
  }
  const safeTeams = teams ?? [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Join a Team</h1>
      {/* Pass the teams list to the join form */}
      <JoinTeamForm teams={safeTeams} />
    </div>
  );
}

// Don't forget to import your JoinTeamForm at the top:
import JoinTeamForm from "@/app/protected/join-team-form";
