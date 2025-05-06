// app/protected/edit-profile/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EditProfileForm from "./edit-profile-form";

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: { updated?: string };
}) {
  const supabase = await createClient();

  // 1️⃣ Ensure user is signed in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  // 2️⃣ Fetch existing profile
  const { data: profile, error } = await supabase
    .from("players")
    .select("name, surname, phone")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error loading profile:", error.message);
    redirect("/protected");
  }

  if (!profile) {
    // if no profile found, redirect to dashboard
    redirect("/protected");
  }

  const justUpdated = searchParams.updated === "true";

  return (
    <div className="p-5 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

      {/* 3️⃣ Success banner when ?updated=true */}
      {justUpdated && (
        <div className="bg-green-600 text-white p-3 rounded">
          Profile updated successfully!
        </div>
      )}

      <EditProfileForm initial={profile} />
    </div>
  );
}
