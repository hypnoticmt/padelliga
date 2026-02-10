import Link from "next/link";

import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignUpPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  if ("message" in searchParams) {
    return <FormMessage message={searchParams} />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-semibold mb-3 text-foreground">Sign up</h1>
        <p className="text-muted-foreground">Create your account to get started</p>
      </div>

      <form className="bg-card border border-border rounded-lg p-8 shadow-sm space-y-5">
        <div>
          <Label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
            First name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Your first name"
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all"
          />
        </div>

        <div>
          <Label htmlFor="surname" className="block text-sm font-semibold text-foreground mb-2">
            Last name
          </Label>
          <Input
            id="surname"
            name="surname"
            placeholder="Your last name"
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all"
          />
        </div>

        <div>
          <Label htmlFor="phonenumber" className="block text-sm font-semibold text-foreground mb-2">
            Phone number
          </Label>
          <Input
            id="phonenumber"
            name="phonenumber"
            type="tel"
            placeholder="Your phone number"
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all"
          />
        </div>

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
          <Label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange outline-none transition-all"
          />
          <p className="mt-2 text-xs text-muted-foreground">Must be at least 6 characters</p>
        </div>

        <SubmitButton
          formAction={signUpAction}
          pendingText="Signing up..."
          className="w-full py-3 text-base font-semibold bg-brand-orange hover:bg-brand-orange/90 rounded-lg transition-all"
        >
          Sign up
        </SubmitButton>

        <FormMessage message={searchParams} />
      </form>

      <div className="text-center">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link className="text-brand-orange font-semibold hover:underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
