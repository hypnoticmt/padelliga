import { Button } from "./ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="flex flex-col gap-8 items-center py-16">
      {/* Visible H1 */}
      <h1 className="text-4xl lg:text-5xl font-bold text-center">
        Padel Liga
      </h1>
      {/* Subheadline */}
      <p className="text-lg lg:text-xl text-center max-w-xl mx-auto">
        Join leagues, track scores, and stay up-to-date with match results—all in one place.
      </p>
      <div>
      <Button asChild size="lg" variant={"default"}>
        <Link href="/sign-up">Get started</Link>
      </Button>
  </div>
</div>
    
  );
}
