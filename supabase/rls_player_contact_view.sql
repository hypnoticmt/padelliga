-- Padelliga: Column-safe opponent contact sharing
-- This implements:
-- 1) Logged-out users: no reads (except your public homepage which should not query DB)
-- 2) Authenticated users: can read league/team/match data
-- 3) Authenticated users: can read ONLY opponents/teammates contact fields (name/surname/phone)
--
-- Strategy:
-- - Keep RLS on base tables.
-- - Remove direct SELECT on public.players from client roles.
-- - Expose a view with only (id, name, surname, phone).
-- - Apply RLS to the view to restrict which rows are visible.
--
-- Run in Supabase SQL editor after review.

begin;

-- ----------
-- RLS: base tables (reads require auth)
-- ----------

alter table public.leagues enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.matches enable row level security;
alter table public.match_sets enable row level security;
alter table public.players enable row level security;

-- (Re)create SELECT policies for authenticated users only
-- Drop if you already have them under different names.

drop policy if exists "Authenticated read leagues" on public.leagues;
create policy "Authenticated read leagues" on public.leagues for select to authenticated using (true);

drop policy if exists "Authenticated read teams" on public.teams;
create policy "Authenticated read teams" on public.teams for select to authenticated using (true);

drop policy if exists "Authenticated read team_members" on public.team_members;
create policy "Authenticated read team_members" on public.team_members for select to authenticated using (true);

drop policy if exists "Authenticated read matches" on public.matches;
create policy "Authenticated read matches" on public.matches for select to authenticated using (true);

drop policy if exists "Authenticated read match_sets" on public.match_sets;
create policy "Authenticated read match_sets" on public.match_sets for select to authenticated using (true);

-- Allow users to update only their own player profile
-- (Keep any INSERT policy you already have for profile creation; this only covers UPDATE.)
drop policy if exists "Users can update own player profile" on public.players;
create policy "Users can update own player profile"
  on public.players for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------
-- Player contact view
-- ----------

-- Create a view with ONLY the columns you want to expose
create or replace view public.player_contact as
select id, name, surname, phone
from public.players;

-- Views don't automatically have RLS unless you enable it (Postgres 15+ supports this)
alter view public.player_contact enable row level security;

-- Drop any existing policy with same name
 drop policy if exists "Opponent contact readable" on public.player_contact;

-- Policy: authenticated users can read themselves + opponents/teammates that share a match with their team
create policy "Opponent contact readable"
  on public.player_contact for select
  to authenticated
  using (
    exists (
      select 1
      from public.players me
      join public.team_members tm_me on tm_me.player_id = me.id
      join public.matches m on (m.team1_id = tm_me.team_id or m.team2_id = tm_me.team_id)
      join public.team_members tm_any on (tm_any.team_id = m.team1_id or tm_any.team_id = m.team2_id)
      where me.user_id = auth.uid()
        and tm_any.player_id = public.player_contact.id
    )
  );

-- ----------
-- Privileges
-- ----------

-- Make sure client roles can't select from players directly
-- (If your app server uses service_role, it will still work.)
revoke select on public.players from anon, authenticated;

-- Allow authenticated to read contact view
grant select on public.player_contact to authenticated;

commit;

-- App change suggestion:
-- Replace queries to `players` for opponent contact with `player_contact`.
