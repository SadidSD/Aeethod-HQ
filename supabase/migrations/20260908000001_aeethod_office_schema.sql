-- ============================================================
-- AEETHOD FACTORY & HQ OFFICE — COMPLETE SUPABASE SCHEMA
-- Run this in your Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 1. PROFILES (Extended User Profiles)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'Founder', -- 'Founder' | 'Lead Designer' | 'Frontend Dev' | 'Backend Dev' | 'Project Manager'
  avatar_config JSONB DEFAULT '{"skinTone":"#ffdbac","hairStyle":"classic","hairColor":"#0f172a","outfit":"executive_suit","auraColor":"#f59e0b","accessory":"coffee"}'::jsonb,
  color TEXT DEFAULT '#f59e0b',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (lower(username));
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can manage own profile') THEN
    CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Anon studio access for profiles') THEN
    CREATE POLICY "Anon studio access for profiles" ON public.profiles FOR ALL USING (true);
  END IF;
END $$;


-- ------------------------------------------------------------
-- 2. AGENCIES (Studio Workspace & Core Level)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL DEFAULT 'aeethod-hq',
  name TEXT NOT NULL DEFAULT 'Aeethod HQ',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  motto TEXT DEFAULT 'Engineering High-Converting E-Commerce & Web Platforms',
  founded TEXT DEFAULT '2026',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agencies' AND policyname = 'Agencies are viewable by everyone') THEN
    CREATE POLICY "Agencies are viewable by everyone" ON public.agencies FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agencies' AND policyname = 'Agencies can be updated by team') THEN
    CREATE POLICY "Agencies can be updated by team" ON public.agencies FOR ALL USING (true);
  END IF;
END $$;


-- ------------------------------------------------------------
-- 3. AGENCY RESOURCES & STATS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agency_resources (
  agency_id UUID PRIMARY KEY REFERENCES public.agencies(id) ON DELETE CASCADE,
  revenue NUMERIC(14,2) DEFAULT 42500.00,
  monthly_recurring NUMERIC(14,2) DEFAULT 12000.00,
  energy INTEGER DEFAULT 160,
  reputation INTEGER DEFAULT 78,
  knowledge INTEGER DEFAULT 450,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agency_resources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agency_resources' AND policyname = 'Agency resources viewable by everyone') THEN
    CREATE POLICY "Agency resources viewable by everyone" ON public.agency_resources FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agency_resources' AND policyname = 'Agency resources manageable by team') THEN
    CREATE POLICY "Agency resources manageable by team" ON public.agency_resources FOR ALL USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.agency_stats (
  agency_id UUID PRIMARY KEY REFERENCES public.agencies(id) ON DELETE CASCADE,
  total_tasks_completed INTEGER DEFAULT 0,
  total_projects_shipped INTEGER DEFAULT 0,
  total_revenue NUMERIC(14,2) DEFAULT 0.00,
  hours_logged NUMERIC(10,2) DEFAULT 0.00,
  streak_current INTEGER DEFAULT 1,
  streak_longest INTEGER DEFAULT 1,
  last_active_date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.agency_stats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agency_stats' AND policyname = 'Agency stats viewable by everyone') THEN
    CREATE POLICY "Agency stats viewable by everyone" ON public.agency_stats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agency_stats' AND policyname = 'Agency stats manageable by team') THEN
    CREATE POLICY "Agency stats manageable by team" ON public.agency_stats FOR ALL USING (true);
  END IF;
END $$;


-- ------------------------------------------------------------
-- 4. TEAM MEMBERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  room TEXT NOT NULL, -- 'dev' | 'design' | 'content' | 'client' | 'management'
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  status TEXT DEFAULT 'working', -- 'working' | 'idle' | 'blocked' | 'offline'
  current_task_id TEXT,
  skills TEXT[] DEFAULT '{}',
  capacity_hours INTEGER DEFAULT 40,
  assigned_hours INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Team members viewable by everyone') THEN
    CREATE POLICY "Team members viewable by everyone" ON public.team_members FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Team members manageable by team') THEN
    CREATE POLICY "Team members manageable by team" ON public.team_members FOR ALL USING (true);
  END IF;
END $$;


-- ------------------------------------------------------------
-- 5. PROJECTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  industry TEXT DEFAULT 'E-Commerce / TCG',
  package TEXT DEFAULT 'enterprise', -- 'essential' | 'professional' | 'enterprise'
  value NUMERIC(12,2) DEFAULT 15000.00,
  phase TEXT DEFAULT 'build', -- 'lead' | 'discovery' | 'proposal' | 'architecture' | 'build' | 'launch' | 'maintenance' | 'completed'
  health TEXT DEFAULT 'green', -- 'green' | 'yellow' | 'red'
  satisfaction INTEGER DEFAULT 95,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_agency_idx ON public.projects (agency_id);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Projects viewable by everyone') THEN
    CREATE POLICY "Projects viewable by everyone" ON public.projects FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Projects manageable by team') THEN
    CREATE POLICY "Projects manageable by team" ON public.projects FOR ALL USING (true);
  END IF;
END $$;


-- ------------------------------------------------------------
-- 6. TASKS (Realtime Synced Workstation Tasks)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  assigned_to TEXT DEFAULT 'frontend', -- 'founder' | 'frontend' | 'backend' | 'designer'
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT DEFAULT 'development', -- 'discovery' | 'architecture' | 'design' | 'development' | 'testing' | 'launch' | 'support'
  status TEXT DEFAULT 'active', -- 'queued' | 'active' | 'blocked' | 'review' | 'done'
  priority TEXT DEFAULT 'high', -- 'low' | 'medium' | 'high' | 'urgent'
  cognitive_load TEXT DEFAULT 'medium', -- 'deep' | 'medium' | 'grunt' | 'micro'
  xp_reward INTEGER DEFAULT 90,
  estimated_hours NUMERIC(5,1) DEFAULT 4.0,
  actual_hours NUMERIC(5,1) DEFAULT 0.0,
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks (status);
CREATE INDEX IF NOT EXISTS tasks_assigned_idx ON public.tasks (assigned_to);
CREATE INDEX IF NOT EXISTS tasks_project_idx ON public.tasks (project_id);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Tasks viewable by everyone') THEN
    CREATE POLICY "Tasks viewable by everyone" ON public.tasks FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Tasks manageable by team') THEN
    CREATE POLICY "Tasks manageable by team" ON public.tasks FOR ALL USING (true);
  END IF;
END $$;


-- ------------------------------------------------------------
-- 7. RESEARCH ENTRIES (Big Tech Knowledge Base - 5 Disciplines)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.research_entries (
  id TEXT PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  discipline TEXT NOT NULL, -- 'market' | 'design' | 'content' | 'frontend' | 'backend'
  status TEXT DEFAULT 'published', -- 'draft' | 'review' | 'published'
  difficulty TEXT DEFAULT 'Intermediate',
  read_time TEXT DEFAULT '8 min',
  summary TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS research_discipline_idx ON public.research_entries (discipline);
ALTER TABLE public.research_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'research_entries' AND policyname = 'Research viewable by everyone') THEN
    CREATE POLICY "Research viewable by everyone" ON public.research_entries FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'research_entries' AND policyname = 'Research manageable by team') THEN
    CREATE POLICY "Research manageable by team" ON public.research_entries FOR ALL USING (true);
  END IF;
END $$;


-- ------------------------------------------------------------
-- 8. BOARD MEETINGS (Boardroom Table & Strategy Sessions)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.board_meetings (
  id TEXT PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration_min INTEGER DEFAULT 45,
  room TEXT DEFAULT 'Plan & Meeting Room',
  status TEXT DEFAULT 'scheduled', -- 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  participants JSONB DEFAULT '[]'::jsonb,
  agenda_items JSONB DEFAULT '[]'::jsonb,
  meeting_notes TEXT DEFAULT '',
  action_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.board_meetings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'board_meetings' AND policyname = 'Board meetings viewable by everyone') THEN
    CREATE POLICY "Board meetings viewable by everyone" ON public.board_meetings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'board_meetings' AND policyname = 'Board meetings manageable by team') THEN
    CREATE POLICY "Board meetings manageable by team" ON public.board_meetings FOR ALL USING (true);
  END IF;
END $$;


-- ------------------------------------------------------------
-- 9. CONTENT POSTS (Content Studio Editorial Pipeline)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_posts (
  id TEXT PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'linkedin' | 'twitter' | 'youtube' | 'blog'
  format TEXT NOT NULL,
  phase TEXT DEFAULT 'idea', -- 'idea' | 'writing' | 'design' | 'ready' | 'published'
  scheduled_date TEXT,
  scheduled_time TEXT,
  copy TEXT,
  visual_brief TEXT,
  tags TEXT[] DEFAULT '{}',
  metrics JSONB DEFAULT '{"likes":0,"comments":0,"shares":0,"impressions":0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_posts' AND policyname = 'Content posts viewable by everyone') THEN
    CREATE POLICY "Content posts viewable by everyone" ON public.content_posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_posts' AND policyname = 'Content posts manageable by team') THEN
    CREATE POLICY "Content posts manageable by team" ON public.content_posts FOR ALL USING (true);
  END IF;
END $$;


-- ------------------------------------------------------------
-- 10. LEADS (Agency CRM)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  industry TEXT DEFAULT 'E-Commerce',
  source TEXT DEFAULT 'website',
  package_interest TEXT DEFAULT 'enterprise',
  estimated_value NUMERIC(10,2) DEFAULT 10000.00,
  status TEXT DEFAULT 'new', -- 'new' | 'contacted' | 'discovery_scheduled' | 'proposal_sent' | 'won' | 'lost'
  notes TEXT,
  last_contact TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Leads viewable by everyone') THEN
    CREATE POLICY "Leads viewable by everyone" ON public.leads FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Leads manageable by team') THEN
    CREATE POLICY "Leads manageable by team" ON public.leads FOR ALL USING (true);
  END IF;
END $$;


-- ------------------------------------------------------------
-- 11. WORLD SAVES (Fallback Monolithic Snapshot Backup)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.world_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  username TEXT UNIQUE NOT NULL,
  save_data JSONB NOT NULL,
  buildings_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.world_saves ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'world_saves' AND policyname = 'World saves viewable by everyone') THEN
    CREATE POLICY "World saves viewable by everyone" ON public.world_saves FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'world_saves' AND policyname = 'World saves manageable by everyone') THEN
    CREATE POLICY "World saves manageable by everyone" ON public.world_saves FOR ALL USING (true);
  END IF;
END $$;


-- ------------------------------------------------------------
-- 12. SEED DEFAULT STUDIO WORKSPACE (Aeethod HQ)
-- ------------------------------------------------------------
INSERT INTO public.agencies (id, slug, name, level, xp, total_xp, motto, founded)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'aeethod-hq',
  'Aeethod HQ',
  1,
  0,
  0,
  'Engineering High-Converting E-Commerce & Web Platforms',
  '2026'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.agency_resources (agency_id, revenue, monthly_recurring, energy, reputation, knowledge)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  42500.00,
  12000.00,
  160,
  78,
  450
)
ON CONFLICT (agency_id) DO NOTHING;

INSERT INTO public.agency_stats (agency_id, total_tasks_completed, total_projects_shipped, total_revenue, hours_logged, streak_current, streak_longest)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  0,
  0,
  0.00,
  0.00,
  1,
  1
)
ON CONFLICT (agency_id) DO NOTHING;


-- ------------------------------------------------------------
-- 13. ENABLE REALTIME REPLICATION FOR ACTIVE COLLABORATION
-- ------------------------------------------------------------
DO $$ BEGIN
  -- Ensure publication exists
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agency_resources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.research_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.board_meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_posts;
