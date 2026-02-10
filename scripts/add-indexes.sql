-- Add database indexes for better performance
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jghdutlejpmmfmfvwybd/sql

-- Teams table
CREATE INDEX IF NOT EXISTS idx_teams_league_id ON teams(league_id);
CREATE INDEX IF NOT EXISTS idx_teams_region_id ON teams(region_id);

-- Matches table  
CREATE INDEX IF NOT EXISTS idx_matches_league_id ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_team1_id ON matches(team1_id);
CREATE INDEX IF NOT EXISTS idx_matches_team2_id ON matches(team2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- Match sets table
CREATE INDEX IF NOT EXISTS idx_match_sets_match_id ON match_sets(match_id);
CREATE INDEX IF NOT EXISTS idx_match_sets_set_winner ON match_sets(set_winner);

-- Team members table
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_player_id ON team_members(player_id);

-- Players table
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);

-- Analyze tables to update statistics
ANALYZE teams;
ANALYZE matches;
ANALYZE match_sets;
ANALYZE team_members;
ANALYZE players;
