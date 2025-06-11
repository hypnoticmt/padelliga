import { createClient } from "@/utils/supabase/server";
import AuthButtonClient from "./AuthButtonClient";

export default async function AuthButtonWrapper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let displayName = "";
  if (user) {
    const { data: profile } = await supabase
      .from("players")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle();
    displayName = profile?.name || user.email;
  }

  return (
    <AuthButtonClient
      isAuthenticated={!!user}
      displayName={displayName}
    />
  );
}
