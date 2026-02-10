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
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Edit Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update your personal information
        </p>
      </div>

      {/* Success Banner */}
      {justUpdated && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 animate-fade-in">
          <p className="font-medium text-green-800 dark:text-green-200">Success!</p>
          <p className="text-sm text-green-700 dark:text-green-300">
            Your profile has been updated successfully.
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <p className="font-medium text-gray-900 dark:text-white mb-2">
          Profile Information
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Your name will be visible to other players</li>
          <li>• Phone number helps teammates contact you</li>
          <li>• All fields are required except phone</li>
        </ul>
      </div>

      {/* Form */}
      <EditProfileForm initial={profile} />
    </div>
  );
}
