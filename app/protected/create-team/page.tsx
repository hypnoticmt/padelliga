// app/create-team/page.tsx
import { createClient } from "@/utils/supabase/server";
import CreateTeamForm from "../create-team-form";

export default async function CreateTeamPage() {
  const supabase = await createClient();
  const { data: leagues, error } = await supabase.from("leagues").select("*");

  if (error) {
    console.error("Error fetching leagues:", error);
  }

  // Guarantee an array
  const safeLeagues = leagues ?? [];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Create a Team</h1>
      <CreateTeamForm leagues={safeLeagues} />
    </div>
  );
}
