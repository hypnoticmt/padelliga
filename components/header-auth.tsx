// app/components/AuthButton.tsx
import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Button } from "./ui/button";
import { SubmitButton } from "./submit-button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  // 1️⃣ get the auth user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if env is mis-configured, still show disabled links
  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          <SubmitButton
            asChild
            size="sm"
            variant="outline"
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-in">Sign in</Link>
          </SubmitButton>
          <SubmitButton
            asChild
            size="sm"
            variant="default"
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-up">Sign up</Link>
          </SubmitButton>
        </div>
      </div>
    );
  }

  // 2️⃣ if logged in, fetch your “players” row for the up-to-date name
  if (user) {
    const { data: player } = await supabase
      .from("players")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle();

    const displayName = player?.name || user.user_metadata?.name || user.email;

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
