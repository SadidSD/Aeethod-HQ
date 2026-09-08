-- ============================================================
-- AEETHOD HQ — CLEAN SLATE DATABASE RESET SCRIPT
-- Run this in your Supabase SQL Editor to wipe all legacy mock data
-- and start fresh with empty projects, tasks, meetings, posts, and zero stats.
-- ============================================================

BEGIN;

-- 1. Wipe mock tasks and projects
DELETE FROM public.tasks WHERE agency_id = '00000000-0000-0000-0000-000000000001' OR project_id IN ('proj_cardvault', 'proj_saas', 'proj_rng', 'proj_perfume');
DELETE FROM public.projects WHERE agency_id = '00000000-0000-0000-0000-000000000001' OR id IN ('proj_cardvault', 'proj_saas', 'proj_rng', 'proj_perfume');

-- 2. Wipe mock boardroom meetings and content posts
DELETE FROM public.board_meetings WHERE agency_id = '00000000-0000-0000-0000-000000000001' OR id IN ('meet_1', 'meet_2', 'meet_3', 'meet_4', 'meet_past_1', 'meet_past_2', 'meet_past_3', 'past_1', 'past_2');
DELETE FROM public.content_posts WHERE agency_id = '00000000-0000-0000-0000-000000000001' OR id LIKE 'post-%';

-- 3. Wipe mock leads and research entries
DELETE FROM public.leads WHERE agency_id = '00000000-0000-0000-0000-000000000001' OR id = 'lead_demo_1';
DELETE FROM public.research_entries WHERE id IN ('res_m01', 'res_d01', 'res_c01', 'res_f01', 'res_b01');

-- 4. Wipe monolithic backup snapshot
DELETE FROM public.world_saves WHERE username = 'AEETHOD_HQ';

-- 5. Reset agency resources to clean baseline
INSERT INTO public.agency_resources (agency_id, revenue, monthly_recurring, energy, reputation, knowledge)
VALUES ('00000000-0000-0000-0000-000000000001', 0.00, 0.00, 160, 50, 0)
ON CONFLICT (agency_id) DO UPDATE SET
  revenue = 0.00,
  monthly_recurring = 0.00,
  energy = 160,
  reputation = 50,
  knowledge = 0;

-- 6. Reset agency stats to clean baseline
INSERT INTO public.agency_stats (agency_id, total_tasks_completed, total_projects_shipped, total_revenue, hours_logged, streak_current, streak_longest)
VALUES ('00000000-0000-0000-0000-000000000001', 0, 0, 0.00, 0.00, 1, 1)
ON CONFLICT (agency_id) DO UPDATE SET
  total_tasks_completed = 0,
  total_projects_shipped = 0,
  total_revenue = 0.00,
  hours_logged = 0.00,
  streak_current = 1,
  streak_longest = 1;

COMMIT;
