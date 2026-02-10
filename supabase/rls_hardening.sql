-- RLS hardening for Padelliga
-- Run in Supabase SQL editor after review.
--
-- Goals (per Josef):
-- 1) Logged-out users should NOT be able to read league/team/match data.
-- 2) Authenticated users can read leagues/teams/matches/etc.
-- 3) Authenticated users can read player contact info ONLY for players they are scheduled to play (incl. own team).
--
-- NOTE: This script focuses on SELECT policies + safe self-profile update.
-- It does NOT attempt to redesign all INSERT/UPDATE policies for teams/matches.

begin;

-- Ensure RLS enabled
alter table public.leagues enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.team_members enable row level security;
alter table public.matches enable row level security;
alter table public.match_sets enable row level security;

-- ---------------------------
-- LEAGUES / TEAMS / MATCHES
-- ---------------------------

-- Drop prior select policies (names may differ; add more drop statements if needed)
drop policy if exists "Authenticated read leagues" on public.leagues;
drop policy if exists "Authenticated read teams" on public.teams;
drop policy if exists "Authenticated read team_members" on public.team_members;
drop policy if exists "Authenticated read matches" on public.matches;
drop policy if exists "Authenticated read match_sets" on public.match_sets;

create policy "Authenticated read leagues"
  on public.leagues for select
  to authenticated
  using (true);

create policy "Authenticated read teams"
  on public.teams for select
  to authenticated
  using (true);

create policy "Authenticated read team_members"
  on public.team_members for select
  to authenticated
  using (true);

create policy "Authenticated read matches"
  on public.matches for select
  to authenticated
  using (true);

create policy "Authenticated read match_sets"
  on public.match_sets for select
  to authenticated
  using (true);

-- ---------------------------
-- PLAYERS: only opponents + own team
-- ---------------------------

-- Replace any overly-permissive player read policy
-- (drop common names; adjust if your existing policy has a different name)
drop policy if exists "Authenticated read players" on public.players;
drop policy if exists "Allow public read players" on public.players;

-- This policy allows an authenticated user to read:
--  - their own player row
--  - any player who is on a team that appears in a match involving the user's team
-- This enables seeing opponent (and teammate) name/surname/phone for scheduled matches.
create policy "Players readable for opponents"
  on public.players for select
  to authenticated
  using (
    -- always allow self
    auth.uid() = user_id
    OR
    exists (
      select 1
      from public.players me
      join public.team_members tm_me on tm_me.player_id = me.id
      join public.matches m on (m.team1_id = tm_me.team_id or m.team2_id = tm_me.team_id)
      join public.team_members tm_any on (tm_any.team_id = m.team1_id or tm_any.team_id = m.team2_id)
      where me.user_id = auth.uid()
        and tm_any.player_id = public.players.id
    )
  );

-- Self-service profile updates
-- (keep this even if you already have something similar)
drop policy if exists "Users can update own player profile" on public.players;
create policy "Users can update own player profile"
  on public.players for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;

-- Verification:
-- select schemaname, tablename, policyname, roles, cmd, qual
-- from pg_policies
-- where schemaname='public'
-- order by tablename, policyname;
