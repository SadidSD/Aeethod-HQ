// ============================================================
// AEETHOD FACTORY & HQ OFFICE — DATABASE SERVICES LAYER
// Handles typed Supabase CRUD operations & realtime change subscriptions
// ============================================================

import { supabase } from '../lib/supabaseClient';
import { AgencyTask, Project, Resources, AgencyStats } from '../core/agencyTypes';

export const DEFAULT_AGENCY_ID = '00000000-0000-0000-0000-000000000001';
export const DEFAULT_AGENCY_SLUG = 'aeethod-hq';

const client: any = supabase;

/**
 * 1. Fetch full agency workspace state from Supabase relational tables
 */
export async function fetchAgencyData(slug = DEFAULT_AGENCY_SLUG) {
  try {
    const { data: agency, error: agencyErr } = await client
      .from('agencies')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (agencyErr || !agency) return null;

    const agencyId = agency.id;

    // Parallel fetch related tables
    const [resResult, statsResult, projResult, tasksResult, teamResult] = await Promise.all([
      client.from('agency_resources').select('*').eq('agency_id', agencyId).maybeSingle(),
      client.from('agency_stats').select('*').eq('agency_id', agencyId).maybeSingle(),
      client.from('projects').select('*').eq('agency_id', agencyId),
      client.from('tasks').select('*').eq('agency_id', agencyId),
      client.from('team_members').select('*').eq('agency_id', agencyId),
    ]);

    return {
      agency,
      resources: resResult?.data || null,
      stats: statsResult?.data || null,
      projects: projResult?.data || [],
      tasks: tasksResult?.data || [],
      teamMembers: teamResult?.data || [],
    };
  } catch (err) {
    console.warn('Failed to fetch agency data from Supabase:', err);
    return null;
  }
}

/**
 * 2. Task Cloud Operations
 */
export async function upsertTaskCloud(task: AgencyTask, agencyId = DEFAULT_AGENCY_ID) {
  try {
    const { error } = await client.from('tasks').upsert({
      id: task.id,
      agency_id: agencyId,
      project_id: task.projectId,
      assigned_to: task.assignedTo,
      title: task.title,
      description: task.description || '',
      phase: task.phase,
      status: task.status,
      priority: task.priority,
      cognitive_load: task.cognitiveLoad,
      xp_reward: task.xpReward,
      estimated_hours: task.estimatedHours,
      actual_hours: task.actualHours || 0,
      deadline: task.deadline || null,
      completed_at: task.completedAt || null,
    });
    if (error) console.warn('Supabase upsertTask error:', error.message);
  } catch (e) {
    console.warn('Network error saving task to Supabase:', e);
  }
}

export async function updateTaskStatusCloud(taskId: string, status: string, completedAt: string | null = null) {
  try {
    const { error } = await client
      .from('tasks')
      .update({
        status,
        completed_at: completedAt,
      })
      .eq('id', taskId);
    if (error) console.warn('Supabase updateTaskStatus error:', error.message);
  } catch (e) {
    console.warn('Network error updating task status in Supabase:', e);
  }
}

/**
 * 3. Project Cloud Operations
 */
export async function upsertProjectCloud(project: Project, agencyId = DEFAULT_AGENCY_ID) {
  try {
    const { error } = await client.from('projects').upsert({
      id: project.id,
      agency_id: agencyId,
      name: project.name,
      client_name: project.clientName,
      industry: project.industry,
      package: project.package,
      value: project.value,
      phase: project.phase,
      health: project.health,
      satisfaction: project.satisfaction,
      start_date: project.startDate,
      deadline: project.deadline || null,
      completed_date: project.completedDate || null,
      notes: project.notes || '',
    });
    if (error) console.warn('Supabase upsertProject error:', error.message);
  } catch (e) {
    console.warn('Network error saving project to Supabase:', e);
  }
}

/**
 * 4. Agency Resources & Stats Sync
 */
export async function syncAgencyResourcesCloud(resources: Resources, agencyId = DEFAULT_AGENCY_ID) {
  try {
    const { error } = await client.from('agency_resources').upsert({
      agency_id: agencyId,
      revenue: resources.revenue,
      monthly_recurring: resources.monthlyRecurring,
      energy: resources.energy,
      reputation: resources.reputation,
      knowledge: resources.knowledge,
      updated_at: new Date().toISOString(),
    });
    if (error) console.warn('Supabase syncAgencyResources error:', error.message);
  } catch (e) {
    console.warn('Network error syncing resources to Supabase:', e);
  }
}

export async function syncAgencyStatsCloud(stats: AgencyStats, streakCurrent = 1, streakLongest = 1, agencyId = DEFAULT_AGENCY_ID) {
  try {
    const { error } = await client.from('agency_stats').upsert({
      agency_id: agencyId,
      total_tasks_completed: stats.totalTasksCompleted,
      total_projects_shipped: stats.totalProjectsShipped,
      total_revenue: stats.totalRevenue,
      hours_logged: stats.hoursLogged,
      streak_current: streakCurrent,
      streak_longest: streakLongest,
      last_active_date: new Date().toISOString().split('T')[0],
    });
    if (error) console.warn('Supabase syncAgencyStats error:', error.message);
  } catch (e) {
    console.warn('Network error syncing stats to Supabase:', e);
  }
}

/**
 * 5. Research Articles (Plan & Meeting Room PC)
 */
export async function fetchResearchEntriesCloud(agencyId = DEFAULT_AGENCY_ID) {
  try {
    const { data, error } = await client
      .from('research_entries')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data;
  } catch (e) {
    console.warn('Failed to load research entries from Supabase:', e);
    return null;
  }
}

export async function upsertResearchEntryCloud(entry: any, agencyId = DEFAULT_AGENCY_ID) {
  try {
    const { error } = await client.from('research_entries').upsert({
      id: entry.id,
      agency_id: agencyId,
      title: entry.title,
      discipline: entry.discipline,
      status: entry.status || 'published',
      difficulty: entry.difficulty || 'Intermediate',
      read_time: entry.readTime || '8 min',
      summary: entry.summary || '',
      tags: entry.tags || [],
      details: entry.details || entry,
      updated_at: new Date().toISOString(),
    });
    if (error) console.warn('Supabase upsertResearchEntry error:', error.message);
  } catch (e) {
    console.warn('Failed to save research entry to Supabase:', e);
  }
}

/**
 * 6. Board Meetings (Boardroom Table)
 */
export async function fetchBoardMeetingsCloud(agencyId = DEFAULT_AGENCY_ID) {
  try {
    const { data, error } = await client
      .from('board_meetings')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data;
  } catch (e) {
    console.warn('Failed to load board meetings from Supabase:', e);
    return null;
  }
}

export async function upsertBoardMeetingCloud(meeting: any, agencyId = DEFAULT_AGENCY_ID) {
  try {
    const { error } = await client.from('board_meetings').upsert({
      id: meeting.id,
      agency_id: agencyId,
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      duration_min: meeting.durationMin || 45,
      room: meeting.room || 'Plan & Meeting Room',
      status: meeting.status || 'scheduled',
      participants: meeting.participants || [],
      agenda_items: meeting.agendaItems || meeting.agenda || [],
      meeting_notes: meeting.meetingNotes || meeting.notes || '',
      action_items: meeting.actionItems || [],
    });
    if (error) console.warn('Supabase upsertBoardMeeting error:', error.message);
  } catch (e) {
    console.warn('Failed to save board meeting to Supabase:', e);
  }
}

/**
 * 7. Content Posts (Content Room)
 */
export async function fetchContentPostsCloud(agencyId = DEFAULT_AGENCY_ID) {
  try {
    const { data, error } = await client
      .from('content_posts')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data;
  } catch (e) {
    console.warn('Failed to load content posts from Supabase:', e);
    return null;
  }
}

export async function upsertContentPostCloud(post: any, agencyId = DEFAULT_AGENCY_ID) {
  try {
    const { error } = await client.from('content_posts').upsert({
      id: post.id,
      agency_id: agencyId,
      title: post.title,
      platform: post.platform,
      format: post.format,
      phase: post.phase || 'idea',
      scheduled_date: post.scheduledDate || null,
      scheduled_time: post.scheduledTime || null,
      copy: post.copy || '',
      visual_brief: post.visualBrief || '',
      tags: post.tags || [],
      metrics: post.metrics || { likes: 0, comments: 0, shares: 0, impressions: 0 },
    });
    if (error) console.warn('Supabase upsertContentPost error:', error.message);
  } catch (e) {
    console.warn('Failed to save content post to Supabase:', e);
  }
}

export async function deleteContentPostCloud(postId: string) {
  try {
    const { error } = await client.from('content_posts').delete().eq('id', postId);
    if (error) console.warn('Supabase deleteContentPost error:', error.message);
  } catch (e) {
    console.warn('Failed to delete content post from Supabase:', e);
  }
}

/**
 * 8. Realtime Postgres CDC Subscription Helper
 */
export function subscribeToDatabaseChanges(
  channelName: string,
  table: string,
  onEvent: (payload: { eventType: string; new: any; old: any }) => void
) {
  return client
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload: any) => {
        onEvent({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old,
        });
      }
    )
    .subscribe();
}
