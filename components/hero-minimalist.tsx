import Link from "next/link";

export default function HeroMinimalist() {
  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-12rem)] flex items-center justify-center overflow-hidden bg-background py-12">
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 tracking-tight text-foreground">
            Padel Liga
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            The modern way to organize and track your padel leagues
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-brand-orange hover:bg-brand-orange/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-center"
            >
              Get Started
            </Link>

            <Link
              href="/sign-in"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-foreground border-2 border-border hover:border-brand-orange transition-all duration-200 rounded-lg text-center"
            >
              Sign In
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto px-4">
            
            {/* Feature 1 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-brand-orange rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Real-time Rankings
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Track your team's performance with live leaderboards
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-brand-orange rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Team Management
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Create teams and coordinate matches effortlessly
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-brand-orange rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Match History
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Access complete match history and scores
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
