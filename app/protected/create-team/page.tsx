// app/create-team/page.tsx
import CreateTeamForm from "../create-team-form";
import { createClient } from "@/utils/supabase/server";

export default async function CreateTeamPage() {
  const supabase = await createClient();
  const { data: leagues, error: leaguesError } = await supabase.from("leagues").select("*");
  const { data:  regions, error: regionsError } = await supabase.from("regions").select("*");

  if (leaguesError) {
    console.error("Error fetching leagues:", leaguesError);
  }

  if(regionsError) {
    console.error("Error fetching regions:", regionsError); 
  }
  // Guarantee an array
  const safeLeagues = leagues ?? [];
  const safeRegions = regions ?? [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Create a Team</h1>
<CreateTeamForm 
  leagues={safeLeagues}
  regions={safeRegions}
/>
    </div>
  );
}
