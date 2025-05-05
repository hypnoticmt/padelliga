// app/create-team/page.tsx
import CreateTeamForm from "../create-team-form";
import { createClient } from "@/utils/supabase/server";

export default async function CreateTeamPage() {
  const supabase = await createClient();

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

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Create a Team</h1>
      <CreateTeamForm leagues={leagues || []} regions={regions || []} />
    </div>
  );
}
