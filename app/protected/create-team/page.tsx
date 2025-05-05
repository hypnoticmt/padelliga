// app/create-team/page.tsx
import CreateTeamForm from "../create-team-form";
import { createClient } from "@/utils/supabase/server";

export default async function CreateTeamPage() {
  const supabase = await createClient();
<<<<<<< HEAD

  // load all leagues
  const { data: leagues = [], error: leaguesErr } = await supabase
    .from("leagues")
    .select("id, name");
  if (leaguesErr) console.error(leaguesErr);

  // load all regions
  const { data: regions = [], error: regionsErr } = await supabase
    .from("regions")
    .select("id, name");
  if (regionsErr) console.error(regionsErr);
=======
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
>>>>>>> f923b2bb8b060579454a8879858ffbcc6ee0d454

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Create a Team</h1>
<<<<<<< HEAD
      <CreateTeamForm leagues={leagues || []} regions={regions || []} />
=======
<CreateTeamForm 
  leagues={safeLeagues}
  regions={safeRegions}
/>
>>>>>>> f923b2bb8b060579454a8879858ffbcc6ee0d454
    </div>
  );
}
