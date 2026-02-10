// app/leaderboards/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AllLeaderboardsPage() {
  const supabase = await createClient();

  const { data: leagues, error } = await supabase
    .from("leagues")
    .select("id, name, league_started");
  
  if (error) {
    console.error("Error fetching leagues:", error.message);
  }
  
  const leagueList = leagues ?? [];

  // Fetch team counts for each league
  const leaguesWithCounts = await Promise.all(
    leagueList.map(async (league: any) => {
      const { count } = await supabase
        .from("teams")
        .select("*", { count: "exact", head: true })
        .eq("league_id", league.id);
      
      return {
        ...league,
        teamCount: count ?? 0,
      };
    })
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          League Leaderboards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View standings and rankings for all leagues
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <p className="font-medium text-gray-900 dark:text-white mb-2">
          How Leaderboards Work
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Teams earn 3 points for each match win</li>
          <li>• Ties are broken by set difference, then games difference</li>
          <li>• Click any league below to view its full standings</li>
        </ul>
      </div>

      {/* Leagues Grid */}
      {leaguesWithCounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaguesWithCounts.map((league: any, index) => (
            <Link
              key={league.id}
              href={`/protected/league/${league.id}/leaderboard`}
              className="group stagger-item block"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-orange-500 transition-all duration-300 card-lift">
                
                {/* Content */}
                <div>
                  {/* Status Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    
                    {league.league_started ? (
                      <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                        Upcoming
                      </span>
                    )}
                  </div>

                  {/* League Name */}
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                    {league.name}
                  </h2>

                  {/* Stats */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">{league.teamCount} {league.teamCount === 1 ? 'team' : 'teams'}</span>
                  </div>

                  {/* View Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-orange-500 group-hover:text-orange-600 transition-colors">
                      View Leaderboard
                    </span>
                    <svg 
                      className="h-5 w-5 text-orange-500 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Leagues Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are no leagues available at the moment. Check back soon!
          </p>
        </div>
      )}

      {/* Bottom Info */}
      {leaguesWithCounts.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {leaguesWithCounts.length} {leaguesWithCounts.length === 1 ? 'League' : 'Leagues'} Available
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click on any league above to see detailed standings, match results, and team statistics
          </p>
        </div>
      )}
    </div>
  );
}
