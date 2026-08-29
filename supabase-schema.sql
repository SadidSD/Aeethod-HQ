-- ============================================================
-- AEETHOD FACTORY & AGENCY TYCOON — SUPABASE DATABASE SCHEMA
-- Run this in your Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'developer', -- 'founder' | 'frontend' | 'backend' | 'designer' | 'client'
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  avatar TEXT DEFAULT '🧑‍💻',
  streak_days INTEGER DEFAULT 1,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (lower(username));
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. AGENCY STATE & FINANCIALS TABLE
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'AEETHOD',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 45000.00,
  cash_balance NUMERIC(12,2) DEFAULT 12000.00,
  cash_reserve NUMERIC(12,2) DEFAULT 8000.00,
  growth_fund NUMERIC(12,2) DEFAULT 9000.00,
  profit_pool NUMERIC(12,2) DEFAULT 6000.00,
  reputation INTEGER DEFAULT 85,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view agencies" ON public.agencies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create/update agency" 
  ON public.agencies FOR ALL USING (auth.uid() = owner_id);


-- 3. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES public.agencies ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  industry TEXT DEFAULT 'E-Commerce / TCG',
  package TEXT DEFAULT 'enterprise', -- 'essential' | 'professional' | 'enterprise'
  value NUMERIC(10,2) DEFAULT 10000.00,
  phase TEXT DEFAULT 'build', -- 'discovery' | 'proposal' | 'build' | 'launch' | 'completed'
  health TEXT DEFAULT 'green', -- 'green' | 'yellow' | 'red'
  satisfaction INTEGER DEFAULT 95,
  deadline TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_agency_idx ON public.projects (agency_id);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are viewable by all authenticated users" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage projects" ON public.projects FOR ALL USING (true);


-- 4. TASKS TABLE (REALTIME SYNCED)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects ON DELETE SET NULL,
  assigned_to TEXT DEFAULT 'frontend', -- 'frontend' | 'backend' | 'designer' | 'client' | 'founder'
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT DEFAULT 'development', -- 'discovery' | 'design' | 'development' | 'testing' | 'launch'
  status TEXT DEFAULT 'active', -- 'queued' | 'active' | 'blocked' | 'review' | 'done'
  priority TEXT DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'urgent'
  cognitive_load TEXT DEFAULT 'medium', -- 'deep' | 'medium' | 'grunt' | 'micro'
  xp_reward INTEGER DEFAULT 35,
  estimated_hours NUMERIC(4,1) DEFAULT 2.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks (status);
CREATE INDEX IF NOT EXISTS tasks_assigned_idx ON public.tasks (assigned_to);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks are viewable by everyone" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Tasks can be updated by all team members" ON public.tasks FOR ALL USING (true);


-- 5. CRM LEADS & INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  industry TEXT DEFAULT 'E-Commerce',
  package_interest TEXT DEFAULT 'enterprise',
  estimated_value NUMERIC(10,2) DEFAULT 10000.00,
  status TEXT DEFAULT 'new', -- 'new' | 'contacted' | 'proposal_sent' | 'won' | 'lost'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leads are viewable by team" ON public.leads FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'paid' | 'pending' | 'draft' | 'overdue'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Invoices are viewable by team" ON public.invoices FOR ALL USING (true);


-- 6. CLOUD SAVE & WORLD SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.world_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT NOT NULL,
  save_data JSONB NOT NULL,
  buildings_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.world_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "World saves viewable by everyone" ON public.world_saves FOR SELECT USING (true);
CREATE POLICY "Users can save own world" ON public.world_saves FOR ALL USING (auth.uid() = user_id);


-- 7. ENABLE REALTIME BROADCAST & POSTGRES CDC
-- Adds tasks & projects to Realtime stream
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
