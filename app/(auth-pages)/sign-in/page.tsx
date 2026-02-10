import Link from "next/link";

import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignInPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-semibold mb-3 text-foreground">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to continue</p>
      </div>

      <form className="bg-card border border-border rounded-lg p-8 shadow-sm space-y-6">
        <div>
          <Label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="password" className="text-sm font-semibold text-foreground">
              Password
            </Label>
            <Link
              className="text-xs text-brand-orange font-semibold hover:underline"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Your password"
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all"
          />
        </div>

        <SubmitButton
          pendingText="Signing in..."
          formAction={signInAction}
          className="w-full py-3 text-base font-semibold bg-brand-orange hover:bg-brand-orange/90 rounded-lg transition-all"
        >
          Sign in
        </SubmitButton>

        <FormMessage message={searchParams} />
      </form>

      <div className="text-center">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link className="text-brand-orange font-semibold hover:underline" href="/sign-up">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
