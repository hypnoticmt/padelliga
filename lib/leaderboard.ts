// lib/leaderboard.ts
/**
 * Optimized leaderboard calculation - DEBUG VERSION
 * UUID VERSION - for databases using UUID as primary keys
 */

import { SupabaseClient } from "@supabase/supabase-js";

export interface TeamStats {
  teamId: string;
  teamName: string;
  points: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  matchesPlayed: number;
  matchesWon: number;
}

/**
 * Calculate leaderboard for a league with optimized queries
 * Reduces from O(n*m) queries to O(1) queries
 */
export async function calculateLeagueLeaderboard(
  supabase: SupabaseClient,
  leagueId: string | null
): Promise<TeamStats[]> {
  console.log("🔍 calculateLeagueLeaderboard called with leagueId:", leagueId);
  
  // Handle null league
  if (!leagueId || leagueId === 'null') {
    console.log("⚠️ No league ID provided, returning empty leaderboard");
    return [];
  }
  
  // 1. Get all teams in the league
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name")
    .eq("league_id", leagueId);

  console.log("📊 Teams query result:", { 
    teamsCount: teams?.length || 0, 
    hasError: !!teamsError,
    errorMessage: teamsError?.message,
    errorDetails: teamsError?.details,
    errorHint: teamsError?.hint,
    errorCode: teamsError?.code
  });

  if (teamsError) {
    console.error("❌ Error fetching teams - Full error object:", JSON.stringify(teamsError, null, 2));
    return [];
  }

  if (!teams || teams.length === 0) {
    console.log("⚠️ No teams found in league:", leagueId);
    return [];
  }

  const teamIds = teams.map((t) => t.id);
  console.log("✅ Found teams:", teamIds);

  // 2. Get ALL matches for these teams in ONE query
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select(
      `
      id,
      team1_id,
      team2_id,
      match_sets (
        set_number,
        team1_games,
        team2_games,
        set_winner
      )
    `
    )
    .or(`team1_id.in.(${teamIds.join(",")}),team2_id.in.(${teamIds.join(",")})`)
    .order("id");

  console.log("📊 Matches query result:", { 
    matchesCount: matches?.length || 0,
    hasError: !!matchesError,
    errorMessage: matchesError?.message
  });

  if (matchesError) {
    console.error("❌ Error fetching matches:", JSON.stringify(matchesError, null, 2));
    return [];
  }

  // 3. Build stats map
  const statsMap = new Map<string, TeamStats>();
  
  teams.forEach((team) => {
    statsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      points: 0,
      setsWon: 0,
      setsLost: 0,
      gamesWon: 0,
      gamesLost: 0,
      matchesPlayed: 0,
      matchesWon: 0,
    });
  });

  // 4. Process all matches
  let processedMatches = 0;
  matches?.forEach((match: any) => {
    const team1Id = match.team1_id;
    const team2Id = match.team2_id;
    
    // Only process if both teams are in our league
    if (!statsMap.has(team1Id) || !statsMap.has(team2Id)) return;

    const team1Stats = statsMap.get(team1Id)!;
    const team2Stats = statsMap.get(team2Id)!;

    let team1SetsWon = 0;
    let team2SetsWon = 0;
    let team1GamesWon = 0;
    let team2GamesWon = 0;

    // Process sets
    match.match_sets?.forEach((set: any) => {
      if (set.set_winner === 1) {
        team1SetsWon++;
      } else if (set.set_winner === 2) {
        team2SetsWon++;
      }
      team1GamesWon += set.team1_games || 0;
      team2GamesWon += set.team2_games || 0;
    });

    // Only count matches that have been played (have sets)
    if (team1SetsWon > 0 || team2SetsWon > 0) {
      processedMatches++;
      
      // Update team1 stats
      team1Stats.matchesPlayed++;
      team1Stats.setsWon += team1SetsWon;
      team1Stats.setsLost += team2SetsWon;
      team1Stats.gamesWon += team1GamesWon;
      team1Stats.gamesLost += team2GamesWon;

      if (team1SetsWon > team2SetsWon) {
        team1Stats.points += 3;
        team1Stats.matchesWon++;
      } else if (team1SetsWon === team2SetsWon) {
        team1Stats.points += 1;
      }

      // Update team2 stats
      team2Stats.matchesPlayed++;
      team2Stats.setsWon += team2SetsWon;
      team2Stats.setsLost += team1SetsWon;
      team2Stats.gamesWon += team2GamesWon;
      team2Stats.gamesLost += team1GamesWon;

      if (team2SetsWon > team1SetsWon) {
        team2Stats.points += 3;
        team2Stats.matchesWon++;
      } else if (team2SetsWon === team1SetsWon) {
        team2Stats.points += 1;
      }
    }
  });

  console.log(`✅ Processed ${processedMatches} completed matches`);

  // 5. Convert to array and sort
  const leaderboard = Array.from(statsMap.values());
  
  leaderboard.sort((a, b) => {
    // Primary: Points
    if (b.points !== a.points) return b.points - a.points;
    
    // Secondary: Set difference
    const aSetDiff = a.setsWon - a.setsLost;
    const bSetDiff = b.setsWon - b.setsLost;
    if (bSetDiff !== aSetDiff) return bSetDiff - aSetDiff;
    
    // Tertiary: Game difference
    const aGameDiff = a.gamesWon - a.gamesLost;
    const bGameDiff = b.gamesWon - b.gamesLost;
    if (bGameDiff !== aGameDiff) return bGameDiff - aGameDiff;
    
    // Final: Games won
    return b.gamesWon - a.gamesWon;
  });

  console.log("📋 Final leaderboard:", leaderboard);

  return leaderboard;
}

/**
 * Calculate stats for a specific team
 */
export async function calculateTeamStats(
  supabase: SupabaseClient,
  teamId: string
): Promise<TeamStats | null> {
  console.log("🔍 calculateTeamStats called with teamId:", teamId);
  
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name, league_id")
    .eq("id", teamId)
    .single();

  if (teamError) {
    console.error("❌ Error fetching team:", JSON.stringify(teamError, null, 2));
    return null;
  }

  if (!team) {
    console.log("⚠️ Team not found:", teamId);
    return null;
  }

  if (!team.league_id) {
    console.log("⚠️ Team has no league assigned:", team.name);
    return null;
  }

  console.log("✅ Found team:", team.name, "in league:", team.league_id);

  const leaderboard = await calculateLeagueLeaderboard(
    supabase,
    team.league_id
  );

  return leaderboard.find((t) => t.teamId === teamId) || null;
}