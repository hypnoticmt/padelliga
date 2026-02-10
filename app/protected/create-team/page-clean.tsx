// app/protected/create-team/page.tsx
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
          Create a Team
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Start your own team and invite players to join you
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <p className="font-medium text-gray-900 dark:text-white mb-2">
          Team Setup
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• You'll be the team captain</li>
          <li>• Add one teammate using their player code</li>
          <li>• Choose your region carefully (can't be changed later)</li>
        </ul>
      </div>

      {/* Form */}
      <CreateTeamForm leagues={safeLeagues} regions={safeRegions} />
    </div>
  );
}
