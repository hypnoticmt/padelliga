// components/AuthButton.tsx (or wherever you store it)
import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { SubmitButton } from "./submit-button";

export default async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ... unauthenticated + hasEnvVars branches as before ...

  if (user) {
    // pull the *current* name from players
    const { data: profile } = await supabase
      .from("players")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle();
    const displayName = profile?.name || user.email;

    return (
      <div className="flex items-center gap-4">
        <nav className="flex gap-2">
          <Link href="/protected/" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/protected/create-team" className="hover:underline">
            Create a Team
          </Link>
          <Link href="/protected/join-team" className="hover:underline">
            Join a Team
          </Link>
          <Link href="/protected/submit-score" className="hover:underline">
            Submit Score
          </Link>
          <Link href="/protected/leaderboards" className="hover:underline">
            Leaderboards
          </Link>
          <Link href="/protected/edit-profile" className="hover:underline">
            Edit Profile
          </Link>
        </nav>

        <span>Hey, {displayName}!</span>

        <form action={signOutAction}>
          <SubmitButton type="submit" variant="default">
            Sign out
          </SubmitButton>
        </form>
      </div>
    );
  }

  // 3️⃣ otherwise, offer Sign in / Sign up
  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="default">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
