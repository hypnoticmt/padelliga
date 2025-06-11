// components/AuthButtonWrapper.tsx

import { createClient } from "@/utils/supabase/server";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import AuthButtonClient from "./AuthButtonClient";
import { EnvVarWarning } from "./env-var-warning";

export default async function AuthButtonWrapper() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not signed in → show AuthButtonClient with default values
    return (
      <>
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <AuthButtonClient
            isAuthenticated={false}
            displayName=""
            isAdmin={false}
          />
        )}
      </>
    );
  }

  // Fetch profile to get name + isAdmin flag
  const { data: profile } = await supabase
    .from("players")
    .select("name, is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  const displayName = profile?.name || user.email;
  const isAdmin = !!profile?.is_admin;

  return (
    <>
      {!hasEnvVars ? (
        <EnvVarWarning />
      ) : (
        <AuthButtonClient
          isAuthenticated={true}
          displayName={displayName}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}
