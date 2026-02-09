// app/protected/edit-profile/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EditProfileForm from "./edit-profile-form";

interface EditProfilePageProps {
  searchParams: Promise<{ updated?: string }>;
}

export default async function EditProfilePage({
  searchParams,
}: EditProfilePageProps) {
  const supabase = await createClient();

  const { updated } = await searchParams;
  const justUpdated = updated === "1";

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile, error } = await supabase
    .from("players")
    .select("name, surname, phone")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    console.error("Error loading profile:", error?.message);
    redirect("/protected");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Edit Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Update your personal information
        </p>
      </div>

      {/* Success Banner */}
      {justUpdated && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3 animate-slide-in">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-green-800 dark:text-green-200">Success!</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your profile has been updated successfully.
            </p>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-medium text-purple-900 dark:text-purple-100 mb-1">
              Profile Information
            </p>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• Your name will be visible to other players</li>
              <li>• Phone number helps teammates contact you</li>
              <li>• All fields are required except phone</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <EditProfileForm initial={profile} />
    </div>
  );
}