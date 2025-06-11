import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <form
      className="w-full max-w-sm mx-auto p-6 bg-background border rounded-lg shadow-sm flex flex-col space-y-4"
    >
      <h1 className="text-2xl font-medium">Sign up</h1>
      <p className="text-sm text-foreground">
        Already have an account?{" "}
        <Link className="text-primary font-medium underline" href="/sign-in">
          Sign in
        </Link>
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input name="name" placeholder="Your name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="surname">Surname</Label>
          <Input name="surname" placeholder="Your surname" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="phonenumber">Phone number</Label>
          <Input name="phonenumber" placeholder="Your phone number" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
            className="mt-1"
          />
        </div>
      </div>

      <SubmitButton
        formAction={signUpAction}
        pendingText="Signing up..."
        className="w-full"
      >
        Sign up
      </SubmitButton>

      <FormMessage message={searchParams} />
    </form>
  );
}
