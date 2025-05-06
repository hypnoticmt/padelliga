// app/create-team/page.tsx
import { createClient } from "@/utils/supabase/server";
import CreateTeamForm from "../create-team-form";

export default async function CreateTeamPage() {
  const supabase = await createClient();

  const { data: leagues } = await supabase
    .from("leagues")
    .select("id, name");
  const { data: regions } = await supabase
    .from("regions")
    .select("id, name");

  const safeLeagues = leagues ?? [];
  const safeRegions = regions ?? [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Create a Team</h1>
      <CreateTeamForm leagues={safeLeagues} regions={safeRegions} />
    </div>
  );
}
