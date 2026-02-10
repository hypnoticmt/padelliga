import Link from "next/link";

export const metadata = {
  title: "About Us - Padel Liga",
  description: "Learn about Padel Liga and our mission to organize padel leagues",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 pt-8 pb-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground">
          About Padel Liga
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The modern platform for organizing and tracking padel leagues
        </p>
      </div>

      {/* Mission Section */}
      <section className="mb-12">
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Padel Liga was built to simplify league management for padel enthusiasts. 
            We believe that organizing tournaments and tracking performance should be 
            effortless, allowing players to focus on what matters most—playing great padel.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our platform provides real-time leaderboards, match history, and team 
            management tools that make running a padel league straightforward and enjoyable.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-foreground text-center">
          What We Offer
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-brand-orange rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Live Rankings</h3>
            <p className="text-sm text-muted-foreground">
              Real-time leaderboards with detailed statistics and performance tracking
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-brand-orange rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Team Management</h3>
            <p className="text-sm text-muted-foreground">
              Create teams, invite players, and coordinate matches effortlessly
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-brand-orange rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Match History</h3>
            <p className="text-sm text-muted-foreground">
              Complete match history with scores, sets, and detailed breakdowns
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-card border border-border rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          Ready to Get Started?
        </h2>
        <p className="text-muted-foreground mb-6">
          Join Padel Liga today and experience the easiest way to manage your padel league
        </p>
        <Link
          href="/sign-up"
          className="inline-block px-6 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-all"
        >
          Sign Up
        </Link>
      </section>
    </div>
  );
}
