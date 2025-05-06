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

  // ensure user is signed in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  // fetch existing profile
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
    redirect("/protected");
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

      {searchParams.updated === "1" && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded">
          Your profile was updated successfully!
        </div>
      )}

      <EditProfileForm initial={profile} />
    </div>
  );
}
