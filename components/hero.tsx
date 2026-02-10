import Link from "next/link";

export default function Hero() {
  return (
    // Use negative margins to break out of parent containers and remove top gap
    <div className="relative min-h-[90vh] w-screen -ml-[50vw] left-[50%] -mt-12 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Grid Background - Full Width */}
      <div className="absolute inset-0 w-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 dark:from-gray-950 dark:via-blue-950 dark:to-gray-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] animate-grid-flow" />
      </div>

      {/* Animated Orbs */}
      <div className="absolute inset-0 w-full overflow-hidden pointer-events-none">
        {/* Large Blue Orb */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-2xl animate-float" />
        
        {/* Large Green Orb */}
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-2xl animate-float-delayed" />
        
        {/* Small Purple Orb */}
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-purple-500/15 rounded-full blur-2xl animate-float-slow" />
        
        {/* Small Cyan Orb */}
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-cyan-500/15 rounded-full blur-2xl animate-float-delayed" />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 w-full overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Content - Constrained */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
        {/* Animated Padel Icon */}
        

        {/* Title with Gradient Animation */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
          <span className="inline-block bg-gradient-to-r from-blue-600 via-cyan-500 to-green-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Padel Liga
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join leagues, track scores, and stay up-to-date with match results—all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link
            href="/sign-up"
            className="group relative px-8 py-4 text-lg font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {/* Button Background with Gradient Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 animate-gradient bg-[length:200%_auto]" />
            
            {/* Button Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 blur-xl" />
            </div>
            
            <span className="relative flex items-center justify-center gap-2">
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>

          <Link
            href="/sign-in"
            className="group px-8 py-4 text-lg font-semibold text-white border-2 border-gray-600 dark:border-brand-slate hover:border-blue-500 dark:hover:border-blue-500 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white/5"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-lg border border-gray-700/50 dark:border-brand-slate/50 rounded-2xl p-6 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-blue-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Live Leaderboards</h3>
              <p className="text-gray-400 dark:text-gray-500">
                Track your team's ranking in real-time with detailed statistics
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-lg border border-gray-700/50 dark:border-brand-slate/50 rounded-2xl p-6 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-green-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-white mb-2">Easy Coordination</h3>
              <p className="text-gray-400 dark:text-gray-500">
                Find opponents and coordinate match schedules effortlessly
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-lg border border-gray-700/50 dark:border-brand-slate/50 rounded-2xl p-6 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-purple-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-white mb-2">Stats & History</h3>
              <p className="text-gray-400 dark:text-gray-500">
                View comprehensive match history and performance analytics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade - Extended for better text legibility */}
      <div className="absolute bottom-0 left-0 right-0 h-[600px] bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}