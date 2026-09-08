// ============================================================
// AEETHOD FACTORY & HQ OFFICE — SUPABASE DATABASE TYPES
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          role: string;
          avatar_config: Json;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          role?: string;
          avatar_config?: Json;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          role?: string;
          avatar_config?: Json;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      agencies: {
        Row: {
          id: string;
          slug: string;
          name: string;
          level: number;
          xp: number;
          total_xp: number;
          motto: string | null;
          founded: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug?: string;
          name?: string;
          level?: number;
          xp?: number;
          total_xp?: number;
          motto?: string | null;
          founded?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          level?: number;
          xp?: number;
          total_xp?: number;
          motto?: string | null;
          founded?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      agency_resources: {
        Row: {
          agency_id: string;
          revenue: number;
          monthly_recurring: number;
          energy: number;
          reputation: number;
          knowledge: number;
          updated_at: string;
        };
        Insert: {
          agency_id: string;
          revenue?: number;
          monthly_recurring?: number;
          energy?: number;
          reputation?: number;
          knowledge?: number;
          updated_at?: string;
        };
        Update: {
          agency_id?: string;
          revenue?: number;
          monthly_recurring?: number;
          energy?: number;
          reputation?: number;
          knowledge?: number;
          updated_at?: string;
        };
      };
      agency_stats: {
        Row: {
          agency_id: string;
          total_tasks_completed: number;
          total_projects_shipped: number;
          total_revenue: number;
          hours_logged: number;
          streak_current: number;
          streak_longest: number;
          last_active_date: string;
        };
        Insert: {
          agency_id: string;
          total_tasks_completed?: number;
          total_projects_shipped?: number;
          total_revenue?: number;
          hours_logged?: number;
          streak_current?: number;
          streak_longest?: number;
          last_active_date?: string;
        };
        Update: {
          agency_id?: string;
          total_tasks_completed?: number;
          total_projects_shipped?: number;
          total_revenue?: number;
          hours_logged?: number;
          streak_current?: number;
          streak_longest?: number;
          last_active_date?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          agency_id: string | null;
          name: string;
          role: string;
          room: string;
          xp: number;
          level: number;
          status: string;
          current_task_id: string | null;
          skills: string[];
          capacity_hours: number;
          assigned_hours: number;
          updated_at: string;
        };
        Insert: {
          id: string;
          agency_id?: string | null;
          name: string;
          role: string;
          room: string;
          xp?: number;
          level?: number;
          status?: string;
          current_task_id?: string | null;
          skills?: string[];
          capacity_hours?: number;
          assigned_hours?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string | null;
          name?: string;
          role?: string;
          room?: string;
          xp?: number;
          level?: number;
          status?: string;
          current_task_id?: string | null;
          skills?: string[];
          capacity_hours?: number;
          assigned_hours?: number;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          agency_id: string | null;
          name: string;
          client_name: string;
          industry: string;
          package: string;
          value: number;
          phase: string;
          health: string;
          satisfaction: number;
          start_date: string;
          deadline: string | null;
          completed_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          agency_id?: string | null;
          name: string;
          client_name: string;
          industry?: string;
          package?: string;
          value?: number;
          phase?: string;
          health?: string;
          satisfaction?: number;
          start_date?: string;
          deadline?: string | null;
          completed_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string | null;
          name?: string;
          client_name?: string;
          industry?: string;
          package?: string;
          value?: number;
          phase?: string;
          health?: string;
          satisfaction?: number;
          start_date?: string;
          deadline?: string | null;
          completed_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          agency_id: string | null;
          project_id: string | null;
          assigned_to: string | null;
          title: string;
          description: string | null;
          phase: string;
          status: string;
          priority: string;
          cognitive_load: string;
          xp_reward: number;
          estimated_hours: number;
          actual_hours: number;
          deadline: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          agency_id?: string | null;
          project_id?: string | null;
          assigned_to?: string | null;
          title: string;
          description?: string | null;
          phase?: string;
          status?: string;
          priority?: string;
          cognitive_load?: string;
          xp_reward?: number;
          estimated_hours?: number;
          actual_hours?: number;
          deadline?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string | null;
          project_id?: string | null;
          assigned_to?: string | null;
          title?: string;
          description?: string | null;
          phase?: string;
          status?: string;
          priority?: string;
          cognitive_load?: string;
          xp_reward?: number;
          estimated_hours?: number;
          actual_hours?: number;
          deadline?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      research_entries: {
        Row: {
          id: string;
          agency_id: string | null;
          title: string;
          discipline: string;
          status: string;
          difficulty: string;
          read_time: string;
          summary: string;
          tags: string[];
          details: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          agency_id?: string | null;
          title: string;
          discipline: string;
          status?: string;
          difficulty?: string;
          read_time?: string;
          summary: string;
          tags?: string[];
          details?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string | null;
          title?: string;
          discipline?: string;
          status?: string;
          difficulty?: string;
          read_time?: string;
          summary?: string;
          tags?: string[];
          details?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      board_meetings: {
        Row: {
          id: string;
          agency_id: string | null;
          title: string;
          date: string;
          time: string;
          duration_min: number;
          room: string;
          status: string;
          participants: Json;
          agenda_items: Json;
          meeting_notes: string;
          action_items: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          agency_id?: string | null;
          title: string;
          date: string;
          time: string;
          duration_min?: number;
          room?: string;
          status?: string;
          participants?: Json;
          agenda_items?: Json;
          meeting_notes?: string;
          action_items?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string | null;
          title?: string;
          date?: string;
          time?: string;
          duration_min?: number;
          room?: string;
          status?: string;
          participants?: Json;
          agenda_items?: Json;
          meeting_notes?: string;
          action_items?: Json;
          created_at?: string;
        };
      };
      content_posts: {
        Row: {
          id: string;
          agency_id: string | null;
          title: string;
          platform: string;
          format: string;
          phase: string;
          scheduled_date: string | null;
          scheduled_time: string | null;
          copy: string | null;
          visual_brief: string | null;
          tags: string[];
          metrics: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          agency_id?: string | null;
          title: string;
          platform: string;
          format: string;
          phase?: string;
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          copy?: string | null;
          visual_brief?: string | null;
          tags?: string[];
          metrics?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string | null;
          title?: string;
          platform?: string;
          format?: string;
          phase?: string;
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          copy?: string | null;
          visual_brief?: string | null;
          tags?: string[];
          metrics?: Json;
          created_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          agency_id: string | null;
          name: string;
          company: string;
          industry: string;
          source: string;
          package_interest: string;
          estimated_value: number;
          status: string;
          notes: string | null;
          last_contact: string;
          created_at: string;
        };
        Insert: {
          id: string;
          agency_id?: string | null;
          name: string;
          company: string;
          industry?: string;
          source?: string;
          package_interest?: string;
          estimated_value?: number;
          status?: string;
          notes?: string | null;
          last_contact?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string | null;
          name?: string;
          company?: string;
          industry?: string;
          source?: string;
          package_interest?: string;
          estimated_value?: number;
          status?: string;
          notes?: string | null;
          last_contact?: string;
          created_at?: string;
        };
      };
      world_saves: {
        Row: {
          id: string;
          user_id: string | null;
          username: string;
          save_data: Json;
          buildings_count: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          username: string;
          save_data: Json;
          buildings_count?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          username?: string;
          save_data?: Json;
          buildings_count?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
