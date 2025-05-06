// app/protected/edit-profile/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EditProfileForm from "./edit-profile-form";

// Tell TS that searchParams is a promise
interface EditProfilePageProps {
  searchParams: Promise<{ updated?: string }>;
}

export default async function EditProfilePage({
  searchParams,
}: EditProfilePageProps) {
  const supabase = await createClient();

  // 0️⃣ await the URL params
  const { updated } = await searchParams;
  const justUpdated = updated === "1";

  // 1️⃣ Ensure signed in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  // 2️⃣ Load existing profile
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
    <div className="p-5 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      {/* Success banner when ?updated=1 */}
      {justUpdated && (
        <div className="rounded bg-green-800 px-4 py-2 text-green-200">
          Profile updated successfully!
        </div>
      )}

      {/* The form */}
      <EditProfileForm initial={profile} />
    </div>
  );
}
