import {
  AgencyState,
  AgencyTask,
  Project,
  Lead,
  TeamMember,
  Quest,
  Achievement,
  TaskStatus,
  CognitiveLoad,
  HealthStatus,
  AchievementCategory,
  DepartmentAlert,
  RoleAccessCode,
  RoomId
} from './agencyTypes';
import { supabase } from '../lib/supabaseClient';
import {
  fetchAgencyData,
  upsertTaskCloud,
  upsertProjectCloud,
  syncAgencyResourcesCloud,
  syncAgencyStatsCloud,
  updateTaskStatusCloud
} from '../services/dbService';

// Clean slate storage migration check
export const DEFAULT_FOUNDER_CODE = 'KZXMB';
const STORAGE_CLEAN_VERSION = 'aeethod_clean_slate_v7';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('aeethod_clean_version') !== STORAGE_CLEAN_VERSION) {
      localStorage.clear();
      localStorage.setItem('aeethod_clean_version', STORAGE_CLEAN_VERSION);
      localStorage.setItem('aeethod_founder_code', DEFAULT_FOUNDER_CODE);
    }
  } catch (e) {
    console.warn('Storage reset check failed:', e);
  }
}

export function generate5LetterCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class AgencyManager {
  state: AgencyState;
  private cloudSyncTimer: any = null;
  public onCloudUpdate: (() => void) | null = null;
  public isCloudSynced = false;

  constructor() {
    this.state = this.createSeedState();
    if (!this.load()) {
      this.generateDailyQuests();
      this.generateWeeklyQuests();
      this.save();
    } else {
      if (!this.state.quests || this.state.quests.length === 0) {
        this.generateDailyQuests();
        this.generateWeeklyQuests();
        this.save();
      }
    }
    // Attempt background cloud hydration & realtime subscription
    this.initCloudSync();
  }

  private async initCloudSync() {
    try {
      await this.loadFromCloud();
      this.subscribeToRealtimeSync();
    } catch (e) {
      console.warn('Supabase offline or initial load skipped:', e);
    }
  }

  save() {
    this.state.savedAt = new Date().toISOString();
    localStorage.setItem('aeethod_agency', JSON.stringify(this.state));

    // Debounced Cloud Sync
    if (this.cloudSyncTimer) clearTimeout(this.cloudSyncTimer);
    this.cloudSyncTimer = setTimeout(() => {
      this.saveToCloud();
    }, 1200);
  }

  async saveToCloud() {
    try {
      // 1. Relational Sync via dbService
      syncAgencyResourcesCloud(this.state.resources);
      syncAgencyStatsCloud(this.state.stats, this.state.streaks.current, this.state.streaks.longest);
      
      for (const project of this.state.projects) {
        upsertProjectCloud(project);
      }
      for (const task of this.state.tasks) {
        upsertTaskCloud(task);
      }

      // 2. Monolithic Fallback Backup (World Saves)
      const payload = {
        user_id: '00000000-0000-0000-0000-000000000001',
        username: 'AEETHOD_HQ',
        save_data: this.state,
        buildings_count: this.state.tasks.length,
        updated_at: new Date().toISOString()
      };

      const { error } = await (supabase as any)
        .from('world_saves')
        .upsert(payload, { onConflict: 'username' });

      if (!error) {
        this.isCloudSynced = true;
      }
    } catch (err) {
      console.warn('Cloud sync error:', err);
    }
  }

  async loadFromCloud(): Promise<boolean> {
    try {
      // 1. Try relational tables first
      const relData = await fetchAgencyData('aeethod-hq');
      if (relData) {
        if (relData.resources) {
          this.state.resources.revenue = Number(relData.resources.revenue) || 0;
          this.state.resources.monthlyRecurring = Number(relData.resources.monthly_recurring) || 0;
          this.state.resources.energy = relData.resources.energy ?? 160;
          this.state.resources.reputation = relData.resources.reputation ?? 50;
          this.state.resources.knowledge = relData.resources.knowledge ?? 0;
        }
        if (relData.stats) {
          this.state.stats.totalTasksCompleted = relData.stats.total_tasks_completed ?? 0;
          this.state.stats.totalProjectsShipped = relData.stats.total_projects_shipped ?? 0;
          this.state.stats.totalRevenue = Number(relData.stats.total_revenue) || 0;
          this.state.stats.hoursLogged = Number(relData.stats.hours_logged) || 0;
          this.state.streaks.current = relData.stats.streak_current ?? 1;
          this.state.streaks.longest = relData.stats.streak_longest ?? 1;
        }
        if (Array.isArray(relData.projects)) {
          this.state.projects = relData.projects
            .filter((p: any) => p.id !== 'proj_cardvault' && p.id !== 'proj_saas' && p.id !== 'proj_rng' && p.id !== 'proj_perfume')
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              clientName: p.client_name,
              industry: p.industry,
              package: p.package,
              value: Number(p.value),
              phase: p.phase,
              startDate: p.start_date,
              deadline: p.deadline || '',
              completedDate: p.completed_date,
              health: p.health,
              taskIds: (relData.tasks || []).filter((t: any) => t.project_id === p.id).map((t: any) => t.id),
              notes: p.notes || '',
              satisfaction: p.satisfaction || 95,
            }));
        }
        if (Array.isArray(relData.tasks)) {
          this.state.tasks = relData.tasks
            .filter((t: any) => !t.id.startsWith('task_cv_') && !t.id.startsWith('task_saas_') && !t.id.startsWith('task_rng_') && !t.id.startsWith('task_pf_'))
            .map((t: any) => ({
              id: t.id,
              title: t.title,
              description: t.description || '',
              projectId: t.project_id,
              assignedTo: t.assigned_to,
              phase: t.phase,
              status: t.status,
              priority: t.priority,
              cognitiveLoad: t.cognitive_load || 'medium',
              xpReward: t.xp_reward || 90,
              estimatedHours: Number(t.estimated_hours) || 4,
              actualHours: Number(t.actual_hours) || 0,
              createdAt: t.created_at,
              completedAt: t.completed_at,
              deadline: t.deadline,
            }));
        }

        localStorage.setItem('aeethod_agency', JSON.stringify(this.state));
        this.isCloudSynced = true;
        this.onCloudUpdate?.();
        return true;
      }

      // 2. Fallback to monolithic world_saves if relational is empty
      const { data, error } = await (supabase as any)
        .from('world_saves')
        .select('save_data')
        .eq('username', 'AEETHOD_HQ')
        .single();

      if (!error && data && data.save_data) {
        const cloudState = data.save_data as AgencyState;
        if (cloudState.projects && cloudState.projects.some((p: any) => p.id === 'proj_cardvault')) {
          // Monolithic save had legacy mock data, overwrite with fresh state
          this.saveToCloud();
          return true;
        }
        if (cloudState.projects && cloudState.tasks) {
          this.state = cloudState;
          localStorage.setItem('aeethod_agency', JSON.stringify(cloudState));
          this.isCloudSynced = true;
          this.onCloudUpdate?.();
          return true;
        }
      }
    } catch (err) {
      console.warn('Cloud load error:', err);
    }
    return false;
  }

  subscribeToRealtimeSync() {
    try {
      // Broadcast channel for instantaneous cross-tab events
      const broadcastChannel = supabase.channel('aeethod-agency-sync');
      broadcastChannel
        .on('broadcast', { event: 'agency_state_sync' }, (payload) => {
          if (payload.payload && payload.payload.savedAt !== this.state.savedAt) {
            this.state = payload.payload;
            localStorage.setItem('aeethod_agency', JSON.stringify(this.state));
            this.onCloudUpdate?.();
          }
        })
        .subscribe();

      // Postgres CDC changes for collaborative task & project updates
      supabase
        .channel('aeethod-db-tasks-cdc')
        .on(
          'postgres_changes' as any,
          { event: '*', schema: 'public', table: 'tasks' },
          (payload: any) => {
            if (payload.new && payload.new.id) {
              const updated = payload.new;
              const idx = this.state.tasks.findIndex(t => t.id === updated.id);
              if (idx !== -1) {
                this.state.tasks[idx].status = updated.status;
                this.state.tasks[idx].completedAt = updated.completed_at;
                localStorage.setItem('aeethod_agency', JSON.stringify(this.state));
                this.onCloudUpdate?.();
              }
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }

  broadcastLiveState() {
    try {
      supabase.channel('aeethod-agency-sync').send({
        type: 'broadcast',
        event: 'agency_state_sync',
        payload: this.state,
      });
    } catch (e) {
      console.warn('Realtime broadcast error:', e);
    }
  }

  load(): boolean {
    const data = localStorage.getItem('aeethod_agency');
    if (data) {
      try {
        const loaded = JSON.parse(data);
        if (!loaded || !loaded.team || !Array.isArray(loaded.team) || loaded.team.length === 0) {
          this.state = this.createSeedState();
          this.save();
          return true;
        }
        if (loaded.projects && loaded.projects.some((p: any) => p.id === 'proj_cardvault')) {
          this.state = this.createSeedState();
          this.save();
          return true;
        }
        this.state = loaded;
        if (!this.state.roleAccessCodes || this.state.roleAccessCodes.length === 0) {
          this.state.roleAccessCodes = this.getDefaultRoleAccessCodes();
          this.save();
        }
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  exportJSON(): string {
    return JSON.stringify(this.state, null, 2);
  }

  importJSON(json: string): boolean {
    try {
      this.state = JSON.parse(json);
      this.save();
      return true;
    } catch (e) {
      return false;
    }
  }

  getState(): AgencyState {
    return this.state;
  }

  addXP(amount: number) {
    this.state.agency.xp += amount;
    this.state.agency.totalXP += amount;
    const nextLevelXP = this.getXPForNextLevel(this.state.agency.level);
    if (this.state.agency.totalXP >= nextLevelXP) {
      this.state.agency.level = this.calculateLevel(this.state.agency.totalXP);
    }
    this.save();
  }

  addMemberXP(memberId: string, amount: number) {
    const member = this.state.team.find(m => m.id === memberId);
    if (member) {
      member.xp += amount;
      const nextLevelXP = this.getXPForNextLevel(member.level);
      if (member.xp >= nextLevelXP) {
        member.level = this.calculateLevel(member.xp);
      }
      this.save();
    }
  }

  calculateLevel(totalXP: number): number {
    return Math.floor(Math.sqrt(totalXP / 100));
  }

  getXPForNextLevel(level: number): number {
    return (level + 1) * (level + 1) * 100;
  }

  addTask(task: Omit<AgencyTask, 'id' | 'createdAt' | 'completedAt' | 'actualHours'>): AgencyTask {
    const newTask: AgencyTask = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      actualHours: 0
    } as AgencyTask;
    this.state.tasks.push(newTask);
    this.save();
    upsertTaskCloud(newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<AgencyTask>) {
    const index = this.state.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.state.tasks[index] = { ...this.state.tasks[index], ...updates };
      this.save();
      if (updates.status) {
        updateTaskStatusCloud(id, updates.status, updates.completedAt || null);
      }
    }
  }

  completeTask(id: string) {
    const task = this.state.tasks.find(t => t.id === id);
    if (task && task.status !== 'done') {
      task.status = 'done';
      task.completedAt = new Date().toISOString();
      if (task.assignedTo) {
        this.addMemberXP(task.assignedTo, task.xpReward || 10);
      }
      this.addXP(task.xpReward || 10);
      this.state.stats.totalTasksCompleted++;
      if (task.estimatedHours) {
        this.state.stats.hoursLogged += task.estimatedHours;
      }
      this.updateStreak();
      this.checkQuestCompletion();
      this.checkAchievements();
      this.save();
      updateTaskStatusCloud(id, 'done', task.completedAt);
    }
  }

  deleteTask(id: string) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.save();
  }

  getTasksByProject(projectId: string): AgencyTask[] {
    return this.state.tasks.filter(t => t.projectId === projectId);
  }

  getTasksByStatus(status: TaskStatus): AgencyTask[] {
    return this.state.tasks.filter(t => t.status === status);
  }

  getTasksByMember(memberId: string): AgencyTask[] {
    return this.state.tasks.filter(t => t.assignedTo === memberId);
  }

  getTasksByCognitiveLoad(load: CognitiveLoad): AgencyTask[] {
    return this.state.tasks.filter(t => t.cognitiveLoad === load);
  }

  addProject(project: Omit<Project, 'id' | 'completedDate' | 'taskIds'>): Project {
    const newProject: Project = {
      ...project,
      id: `proj_${Date.now()}`,
      taskIds: [],
      completedDate: null
    } as Project;
    this.state.projects.push(newProject);
    this.save();
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>) {
    const index = this.state.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.state.projects[index] = { ...this.state.projects[index], ...updates };
      this.save();
    }
  }

  completeProject(id: string) {
    const project = this.state.projects.find(p => p.id === id);
    if (project && project.phase !== 'completed') {
      project.phase = 'completed';
      project.completedDate = new Date().toISOString();
      
      const xpBonus = Math.floor(project.value / 10);
      this.addXP(xpBonus);
      
      this.state.stats.totalProjectsShipped++;
      this.state.stats.totalRevenue += project.value;
      this.state.resources.revenue += project.value;
      
      this.checkQuestCompletion();
      this.checkAchievements();
      this.save();
    }
  }

  getActiveProjects(): Project[] {
    return this.state.projects.filter(p => p.phase !== 'completed');
  }

  getProjectHealth(id: string): HealthStatus {
    const tasks = this.getTasksByProject(id);
    if (tasks.length === 0) return 'green';
    
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const blockedRatio = blockedTasks / tasks.length;
    
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < now).length;
    
    if (overdueTasks > 2 || blockedRatio > 0.3) return 'red';
    if (overdueTasks > 0 || blockedRatio > 0.1) return 'yellow';
    return 'green';
  }

  addLead(lead: Omit<Lead, 'id' | 'createdAt' | 'lastContact'>): Lead {
    const newLead: Lead = {
      ...lead,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString()
    } as Lead;
    this.state.leads.push(newLead);
    this.save();
    return newLead;
  }

  updateLead(id: string, updates: Partial<Lead>) {
    const index = this.state.leads.findIndex(l => l.id === id);
    if (index !== -1) {
      this.state.leads[index] = { ...this.state.leads[index], ...updates };
      this.save();
    }
  }

  convertLeadToProject(leadId: string): Project | null {
    const lead = this.state.leads.find(l => l.id === leadId);
    if (lead) {
      lead.status = 'won';
      const project = this.addProject({
        clientName: lead.company,
        name: `${lead.company} Project`,
        industry: lead.industry || 'General',
        package: lead.packageInterest || 'essential',
        value: lead.estimatedValue,
        phase: 'architecture',
        health: 'green',
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        notes: lead.notes || '',
        satisfaction: 100
      });
      this.save();
      return project;
    }
    return null;
  }

  generateDailyQuests() {
    const nextDay = new Date(Date.now() + 86400000).toISOString();
    const dailyQuests: Quest[] = [
      {
        id: `q_daily_1_${Date.now()}`,
        title: `Complete ${Math.floor(Math.random() * 4) + 2} tasks today`,
        description: 'Finish a set of tasks to keep the momentum going.',
        type: 'daily',
        target: Math.floor(Math.random() * 4) + 2,
        progress: 0,
        xpReward: 50,
        completed: false,
        deadline: nextDay,
        completedAt: null
      },
      {
        id: `q_daily_2_${Date.now()}`,
        title: `Log ${Math.floor(Math.random() * 3) + 2} hours of work`,
        description: 'Put in the focused effort.',
        type: 'daily',
        target: Math.floor(Math.random() * 3) + 2,
        progress: 0,
        xpReward: 40,
        completed: false,
        deadline: nextDay,
        completedAt: null
      },
      {
        id: `q_daily_3_${Date.now()}`,
        title: 'Follow up with leads',
        description: 'Keep the pipeline warm.',
        type: 'daily',
        target: Math.floor(Math.random() * 2) + 1,
        progress: 0,
        xpReward: 30,
        completed: false,
        deadline: nextDay,
        completedAt: null
      }
    ];
    this.state.quests = [...this.state.quests.filter(q => q.type !== 'daily' || q.completed), ...dailyQuests];
    this.save();
  }

  generateWeeklyQuests() {
    const nextWeek = new Date(Date.now() + 604800000).toISOString();
    const weeklyQuests: Quest[] = [
      {
        id: `q_weekly_1_${Date.now()}`,
        title: 'Ship a project milestone',
        description: 'Deliver significant value to a client.',
        type: 'weekly',
        target: 1,
        progress: 0,
        xpReward: 200,
        completed: false,
        deadline: nextWeek,
        completedAt: null
      },
      {
        id: `q_weekly_2_${Date.now()}`,
        title: 'Close new deals',
        description: 'Sign new projects to grow the agency.',
        type: 'weekly',
        target: Math.floor(Math.random() * 2) + 1,
        progress: 0,
        xpReward: 150,
        completed: false,
        deadline: nextWeek,
        completedAt: null
      }
    ];
    this.state.quests = [...this.state.quests.filter(q => q.type !== 'weekly' || q.completed), ...weeklyQuests];
    this.save();
  }

  updateQuestProgress(questId: string, progress: number) {
    const quest = this.state.quests.find(q => q.id === questId);
    if (quest && !quest.completed) {
      quest.progress = Math.min(progress, quest.target);
      this.checkQuestCompletion();
      this.save();
    }
  }

  checkQuestCompletion() {
    this.state.quests.forEach(quest => {
      if (!quest.completed && quest.progress >= quest.target) {
        quest.completed = true;
        quest.completedAt = new Date().toISOString();
        this.addXP(quest.xpReward);
      }
    });
  }

  getActiveQuests(): Quest[] {
    return this.state.quests.filter(q => !q.completed);
  }

  updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.streaks.lastActiveDate === today) {
      return;
    }
    
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    if (this.state.streaks.lastActiveDate === yesterday) {
      this.state.streaks.current++;
      if (this.state.streaks.current > this.state.streaks.longest) {
        this.state.streaks.longest = this.state.streaks.current;
      }
    } else {
      this.state.streaks.current = 1;
      if (this.state.streaks.longest === 0) {
        this.state.streaks.longest = 1;
      }
    }
    this.state.streaks.lastActiveDate = today;
    this.save();
  }

  checkAchievements(): Achievement[] {
    const unlockedNow: Achievement[] = [];
    const stats = this.state.stats;
    const streaks = this.state.streaks;
    const teamSize = this.state.team.length;
    const perfectProjects = this.state.projects.some(p => p.satisfaction === 100);

    const conditions: Record<string, boolean> = {
      'first_launch': stats.totalProjectsShipped >= 1,
      'five_launches': stats.totalProjectsShipped >= 5,
      'ten_launches': stats.totalProjectsShipped >= 10,
      'first_5k': stats.totalRevenue >= 5000,
      'five_figure_month': stats.totalRevenue >= 10000,
      'six_figure_year': stats.totalRevenue >= 100000,
      'task_machine': stats.totalTasksCompleted >= 100,
      'task_500': stats.totalTasksCompleted >= 500,
      'week_streak': streaks.longest >= 7,
      'month_streak': streaks.longest >= 30,
      'team_of_5': teamSize >= 5,
      'perfect_score': perfectProjects
    };

    this.state.achievements.forEach(ach => {
      if (!ach.unlocked && conditions[ach.id]) {
        ach.unlocked = true;
        ach.unlockedAt = new Date().toISOString();
        unlockedNow.push(ach);
      }
    });

    if (unlockedNow.length > 0) {
      this.save();
    }

    return unlockedNow;
  }

  getDepartmentAlerts(): DepartmentAlert[] {
    const alerts: DepartmentAlert[] = [];
    const activeProjects = this.getActiveProjects();
    const now = Date.now();

    for (const project of activeProjects) {
      const projectTasks = this.getTasksByProject(project.id);
      for (const task of projectTasks) {
        if (task.status === 'done') continue;
        const member = this.state.team.find(m => m.id === task.assignedTo);
        const room = member?.room || (task.phase === 'development' ? 'dev' : task.phase === 'design' ? 'design' : 'management');
        const createdTime = new Date(task.createdAt).getTime();
        const daysStalled = Math.max(1, Math.floor((now - createdTime) / 86400000));

        // RED ALERT: Task is hard-blocked, causing project to be absolutely stuck
        if (task.status === 'blocked') {
          alerts.push({
            room: room as any,
            severity: 'red',
            reason: `Project is stuck: "${task.title}" is hard-blocked in ${room.toUpperCase()} room!`,
            daysStalled,
            blockedProjectName: project.name
          });
        }
        // YELLOW ALERT: Task untouched for 2+ days, project cannot move forward
        else if (daysStalled >= 2) {
          alerts.push({
            room: room as any,
            severity: 'yellow',
            reason: `Untouched for ${daysStalled} days: "${task.title}" is delaying downstream phases.`,
            daysStalled,
            blockedProjectName: project.name
          });
        }
      }
    }

    return alerts;
  }

  getBottlenecks(): { room: string; severity: 'warning' | 'critical'; message: string }[] {
    return this.getDepartmentAlerts().map(a => ({
      room: a.room,
      severity: a.severity === 'red' ? 'critical' : 'warning',
      message: a.reason
    }));
  }
  
  addTeamMember(member: Omit<TeamMember, 'id' | 'xp' | 'level' | 'status' | 'currentTaskId' | 'assignedHours'>): TeamMember {
    const newMember: TeamMember = {
      ...member,
      id: `member_${Date.now()}`,
      xp: 0,
      level: 0,
      status: 'idle',
      currentTaskId: null,
      assignedHours: 0,
    };
    this.state.team.push(newMember);
    this.save();
    return newMember;
  }

  createSeedState(): AgencyState {
    const seedAchievements: Achievement[] = [
      { id: 'first_launch', title: 'First Launch', description: 'Ship your first project', category: 'launches' as AchievementCategory, target: 1, current: 0, unlocked: false, unlockedAt: null, icon: '🚀' },
      { id: 'five_launches', title: 'Rising Star', description: 'Ship 5 projects', category: 'launches' as AchievementCategory, target: 5, current: 0, unlocked: false, unlockedAt: null, icon: '⭐' },
      { id: 'ten_launches', title: 'Veteran', description: 'Ship 10 projects', category: 'launches' as AchievementCategory, target: 10, current: 0, unlocked: false, unlockedAt: null, icon: '🏆' },
      { id: 'first_5k', title: 'First $5k', description: 'Reach $5,000 in total revenue', category: 'revenue' as AchievementCategory, target: 5000, current: 0, unlocked: false, unlockedAt: null, icon: '💰' },
      { id: 'five_figure_month', title: 'Five Figure Month', description: 'Earn $10,000 in a single month', category: 'revenue' as AchievementCategory, target: 10000, current: 0, unlocked: false, unlockedAt: null, icon: '📈' },
      { id: 'six_figure_year', title: 'Six Figure Year', description: 'Earn $100,000 in total revenue', category: 'revenue' as AchievementCategory, target: 100000, current: 0, unlocked: false, unlockedAt: null, icon: '💼' },
      { id: 'task_machine', title: 'Task Machine', description: 'Complete 100 tasks', category: 'speed' as AchievementCategory, target: 100, current: 0, unlocked: false, unlockedAt: null, icon: '⚙️' },
      { id: 'task_500', title: 'Productivity Master', description: 'Complete 500 tasks', category: 'speed' as AchievementCategory, target: 500, current: 0, unlocked: false, unlockedAt: null, icon: '⚡' },
      { id: 'week_streak', title: 'Consistent', description: 'Maintain a 7-day streak', category: 'streaks' as AchievementCategory, target: 7, current: 0, unlocked: false, unlockedAt: null, icon: '🔥' },
      { id: 'month_streak', title: 'Unstoppable', description: 'Maintain a 30-day streak', category: 'streaks' as AchievementCategory, target: 30, current: 0, unlocked: false, unlockedAt: null, icon: '🌋' },
      { id: 'team_of_5', title: 'Growing Agency', description: 'Hire 5 team members', category: 'growth' as AchievementCategory, target: 5, current: 4, unlocked: false, unlockedAt: null, icon: '👥' },
      { id: 'perfect_score', title: 'Perfect Score', description: 'Get a 100% satisfaction rating on a project', category: 'quality' as AchievementCategory, target: 1, current: 0, unlocked: false, unlockedAt: null, icon: '💎' }
    ];

    return {
      savedAt: new Date().toISOString(),
      agency: {
        name: 'Aeethod HQ',
        level: 1,
        xp: 0,
        totalXP: 0,
        founded: '2026',
        motto: 'We build systems, not websites.'
      },
      resources: {
        revenue: 0,
        monthlyRecurring: 0,
        energy: 160,
        reputation: 50,
        knowledge: 0
      },
      team: [
        { id: 'founder', name: 'Founder', role: 'Founder & CEO', room: 'management', xp: 0, level: 1, status: 'idle', skills: ['Architecture', 'Strategy', 'Client Relations'], currentTaskId: null, capacityHoursPerWeek: 40, assignedHours: 0 }
      ],
      projects: [],
      tasks: [],
      leads: [],
      achievements: seedAchievements,
      quests: [
        { id: 'epic_1', title: 'Launch First Client Project', description: 'Close, build, and deliver your first client system.', type: 'epic', target: 1, progress: 0, xpReward: 500, completed: false, deadline: new Date(Date.now() + 30 * 86400000).toISOString(), completedAt: null },
        { id: 'epic_2', title: 'Reach $10k Agency Milestone', description: 'Grow total agency revenue to $10,000.', type: 'epic', target: 10000, progress: 0, xpReward: 1000, completed: false, deadline: new Date(Date.now() + 90 * 86400000).toISOString(), completedAt: null },
        { id: 'epic_3', title: 'Expand Core Team', description: 'Scale the agency workforce with a new specialist.', type: 'epic', target: 5, progress: 1, xpReward: 600, completed: false, deadline: new Date(Date.now() + 60 * 86400000).toISOString(), completedAt: null }
      ],
      streaks: {
        current: 1,
        longest: 1,
        lastActiveDate: new Date().toISOString()
      },
      stats: {
        totalTasksCompleted: 0,
        totalProjectsShipped: 0,
        totalRevenue: 0,
        hoursLogged: 0
      },
      roleAccessCodes: this.getDefaultRoleAccessCodes()
    };
  }

  getDefaultRoleAccessCodes(): RoleAccessCode[] {
    const founderCode = DEFAULT_FOUNDER_CODE;
    if (typeof window !== 'undefined') {
      localStorage.setItem('aeethod_founder_code', DEFAULT_FOUNDER_CODE);
    }

    return [
      {
        id: 'code_founder',
        roleName: 'Founder',
        code: founderCode,
        department: 'management',
        createdAt: new Date().toISOString(),
        claimedBy: [],
      }
    ];
  }

  getRoleAccessCodes(): RoleAccessCode[] {
    if (!this.state.roleAccessCodes || this.state.roleAccessCodes.length === 0) {
      this.state.roleAccessCodes = this.getDefaultRoleAccessCodes();
    }
    // Ensure founder code is present in roleAccessCodes
    if (!this.state.roleAccessCodes.some(c => c.id === 'code_founder' || c.code === DEFAULT_FOUNDER_CODE)) {
      this.state.roleAccessCodes.unshift({
        id: 'code_founder',
        roleName: 'Founder',
        code: DEFAULT_FOUNDER_CODE,
        department: 'management',
        createdAt: new Date().toISOString(),
        claimedBy: [],
      });
    }
    return this.state.roleAccessCodes;
  }

  createRoleAccessCode(roleName: string, department: RoomId = 'dev'): RoleAccessCode {
    if (!this.state.roleAccessCodes) {
      this.state.roleAccessCodes = this.getDefaultRoleAccessCodes();
    }
    
    // Generate unique 5-letter capital code
    const existing = this.state.roleAccessCodes.map(c => c.code);
    let code = generate5LetterCode();
    while (existing.includes(code)) {
      code = generate5LetterCode();
    }

    const newCode: RoleAccessCode = {
      id: `role_code_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      roleName: roleName.trim() || 'Team Specialist',
      code,
      department,
      createdAt: new Date().toISOString(),
      claimedBy: [],
    };

    this.state.roleAccessCodes.unshift(newCode);
    this.save();
    this.saveToCloud();
    return newCode;
  }

  deleteRoleAccessCode(id: string): void {
    if (!this.state.roleAccessCodes) return;
    this.state.roleAccessCodes = this.state.roleAccessCodes.filter(c => c.id !== id);
    this.save();
    this.saveToCloud();
  }

  validateAccessCode(inputCode: string): { valid: boolean; roleName?: string; department?: RoomId; error?: string } {
    const clean = inputCode.trim().toUpperCase();
    if (!clean) {
      return { valid: false, error: 'Please enter a 5-letter access code.' };
    }

    if (clean === DEFAULT_FOUNDER_CODE) {
      return { valid: true, roleName: 'Founder', department: 'management' };
    }

    const codes = this.getRoleAccessCodes();
    const matched = codes.find(c => c.code.toUpperCase() === clean);

    if (matched) {
      return { valid: true, roleName: matched.roleName, department: matched.department };
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('aeethod_founder_code');
      if (cached && clean === cached.toUpperCase()) {
        return { valid: true, roleName: 'Founder', department: 'management' };
      }
    }

    return { valid: false, error: 'Invalid 5-letter access code. Please check your key.' };
  }

  claimAccessCode(inputCode: string, playerName: string): void {
    const clean = inputCode.trim().toUpperCase();
    const codes = this.getRoleAccessCodes();
    const matched = codes.find(c => c.code.toUpperCase() === clean);
    if (matched) {
      if (!matched.claimedBy) matched.claimedBy = [];
      if (!matched.claimedBy.includes(playerName)) {
        matched.claimedBy.push(playerName);
        this.save();
        this.saveToCloud();
      }
    }
  }
}

let _instance: AgencyManager | null = null;
export function getAgencyManager(): AgencyManager {
  if (!_instance) _instance = new AgencyManager();
  return _instance;
}
export default AgencyManager;
