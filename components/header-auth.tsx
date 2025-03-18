import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="default"
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.name || user?.email;

  if (user) {
    return (
      <div className="flex items-center gap-4">
        {/* Add a small nav for the new pages */}
        <nav className="flex gap-2">
          <Link href="/protected/create-team" className="hover:underline">
            Create Team
          </Link>
          <Link href="/protected/book-match" className="hover:underline">
            Book Match
          </Link>
        </nav>

        {/* Greet the user */}
        <span>Hey, {userName}!</span>

        {/* Sign out button */}
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    );
  }

  // If no user is logged in:
  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
