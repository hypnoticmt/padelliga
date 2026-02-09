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
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-4 shadow-lg">
          <span className="text-3xl">➕</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
          Create a Team
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Start your own team and invite players to join you
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Team Setup
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• You'll be the team captain</li>
              <li>• Add one teammate using their player code</li>
              <li>• Choose your region carefully (can't be changed later)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <CreateTeamForm leagues={safeLeagues} regions={safeRegions} />
    </div>
  );
}