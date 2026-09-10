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
import { getMultiplayerManager } from './multiplayer';

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
      await Promise.allSettled([
        this.loadFromCloud(),
        this.loadRoleAccessCodesFromCloud()
      ]);
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
      // 1. Primary Cloud Sync via profiles table (aeethod_system avatar_config)
      // This immediately connects all players to the single Supabase database
      const { data: profileRow } = await (supabase as any)
        .from('profiles')
        .select('avatar_config')
        .eq('username', 'aeethod_system')
        .maybeSingle();

      const existingConfig = profileRow?.avatar_config || {};
      const cloudTasks: AgencyTask[] = Array.isArray(existingConfig.tasks) ? existingConfig.tasks : [];
      const cloudProjects: Project[] = Array.isArray(existingConfig.projects) ? existingConfig.projects : [];

      // Merge local and cloud tasks by id to prevent wiping anyone's work
      const taskMap = new Map<string, AgencyTask>();
      for (const t of cloudTasks) {
        if (t && t.id) taskMap.set(t.id, t);
      }
      for (const t of this.state.tasks) {
        if (t && t.id) {
          if (!taskMap.has(t.id)) {
            taskMap.set(t.id, t);
          } else {
            const remote = taskMap.get(t.id)!;
            // Favor the more complete/updated version
            if (t.status === 'done' || (t.completedAt && !remote.completedAt)) {
              taskMap.set(t.id, { ...remote, ...t });
            } else {
              taskMap.set(t.id, { ...remote, ...t });
            }
          }
        }
      }

      // Merge local and cloud projects by id
      const projectMap = new Map<string, Project>();
      for (const p of cloudProjects) {
        if (p && p.id) projectMap.set(p.id, p);
      }
      for (const p of this.state.projects) {
        if (p && p.id) {
          projectMap.set(p.id, { ...(projectMap.get(p.id) || {}), ...p });
        }
      }

      const mergedTasks = Array.from(taskMap.values());
      const mergedProjects = Array.from(projectMap.values());

      // Adopt remote tasks locally if cloud had new items
      let localNeedsUpdate = false;
      if (mergedTasks.length > this.state.tasks.length) {
        this.state.tasks = mergedTasks;
        localNeedsUpdate = true;
      }
      if (mergedProjects.length > this.state.projects.length) {
        this.state.projects = mergedProjects;
        localNeedsUpdate = true;
      }
      if (localNeedsUpdate) {
        localStorage.setItem('aeethod_agency', JSON.stringify(this.state));
        this.onCloudUpdate?.();
      }

      const updatedConfig = {
        ...existingConfig,
        tasks: mergedTasks,
        projects: mergedProjects,
        resources: this.state.resources,
        stats: this.state.stats,
        roleAccessCodes: this.state.roleAccessCodes || existingConfig.roleAccessCodes || [],
        updatedAt: new Date().toISOString(),
      };

      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
          avatar_config: updatedConfig,
          updated_at: new Date().toISOString(),
        })
        .eq('username', 'aeethod_system');

      if (!profileError) {
        this.isCloudSynced = true;
      }

      // 2. Broadcast live update to all online teammates
      this.broadcastTasksSync('sync');

      // 3. Fallback relational sync in case tables exist
      syncAgencyResourcesCloud(this.state.resources);
      syncAgencyStatsCloud(this.state.stats, this.state.streaks.current, this.state.streaks.longest);
      for (const project of this.state.projects) {
        upsertProjectCloud(project);
      }
      for (const task of this.state.tasks) {
        upsertTaskCloud(task);
      }
    } catch (err) {
      console.warn('Cloud sync error:', err);
    }
  }

  async loadFromCloud(): Promise<boolean> {
    try {
      // 1. Primary: Load shared agency workspace from profiles (aeethod_system)
      const { data: profileRow, error: profileErr } = await (supabase as any)
        .from('profiles')
        .select('avatar_config')
        .eq('username', 'aeethod_system')
        .maybeSingle();

      if (!profileErr && profileRow && profileRow.avatar_config) {
        const config = profileRow.avatar_config;
        let hasUpdates = false;

        // Merge tasks
        if (Array.isArray(config.tasks)) {
          const taskMap = new Map<string, AgencyTask>();
          for (const t of config.tasks) {
            if (t && t.id) taskMap.set(t.id, t);
          }
          for (const t of this.state.tasks) {
            if (t && t.id && !taskMap.has(t.id)) {
              taskMap.set(t.id, t);
            }
          }
          this.state.tasks = Array.from(taskMap.values());
          hasUpdates = true;
        }

        // Merge projects
        if (Array.isArray(config.projects) && config.projects.length > 0) {
          const projMap = new Map<string, Project>();
          for (const p of config.projects) {
            if (p && p.id) projMap.set(p.id, p);
          }
          for (const p of this.state.projects) {
            if (p && p.id && !projMap.has(p.id)) {
              projMap.set(p.id, p);
            }
          }
          this.state.projects = Array.from(projMap.values());
          hasUpdates = true;
        }

        if (config.resources) {
          this.state.resources.revenue = Math.max(this.state.resources.revenue, Number(config.resources.revenue) || 0);
          this.state.resources.monthlyRecurring = Number(config.resources.monthlyRecurring) || this.state.resources.monthlyRecurring;
        }

        if (Array.isArray(config.roleAccessCodes) && config.roleAccessCodes.length > 0) {
          this.state.roleAccessCodes = config.roleAccessCodes;
        }

        if (hasUpdates) {
          localStorage.setItem('aeethod_agency', JSON.stringify(this.state));
          this.isCloudSynced = true;
          this.onCloudUpdate?.();
        }
      }

      // 2. Secondary relational tables fallback
      const relData = await fetchAgencyData('aeethod-hq');
      if (relData && Array.isArray(relData.tasks) && relData.tasks.length > 0) {
        if (Array.isArray(relData.tasks)) {
          const taskMap = new Map<string, AgencyTask>();
          for (const t of this.state.tasks) taskMap.set(t.id, t);
          relData.tasks
            .filter((t: any) => !t.id.startsWith('task_cv_') && !t.id.startsWith('task_saas_') && !t.id.startsWith('task_rng_') && !t.id.startsWith('task_pf_'))
            .forEach((t: any) => {
              if (!taskMap.has(t.id)) {
                taskMap.set(t.id, {
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
                });
              }
            });
          this.state.tasks = Array.from(taskMap.values());
          localStorage.setItem('aeethod_agency', JSON.stringify(this.state));
          this.onCloudUpdate?.();
        }
      }
      return true;
    } catch (err) {
      console.warn('Cloud load error:', err);
    }
    return false;
  }

  private syncChannel: any = null;

  subscribeToRealtimeSync() {
    try {
      if (this.syncChannel) {
        this.syncChannel.unsubscribe();
        this.syncChannel = null;
      }

      // Broadcast channel for instantaneous cross-player events
      this.syncChannel = supabase.channel('aeethod-agency-sync');
      this.syncChannel
        .on('broadcast', { event: 'agency_state_sync' }, (payload: any) => {
          if (payload.payload) {
            this.handleIncomingTaskSync({
              action: 'sync',
              allTasks: payload.payload.tasks,
              allProjects: payload.payload.projects,
            });
          }
        })
        .on('broadcast', { event: 'tasks_sync' }, (payload: any) => {
          if (payload.payload) {
            this.handleIncomingTaskSync(payload.payload);
          }
        })
        .on('broadcast', { event: 'role_codes_sync' }, (payload: any) => {
          if (Array.isArray(payload.payload)) {
            this.state.roleAccessCodes = payload.payload;
            if (typeof window !== 'undefined') {
              localStorage.setItem('aeethod_agency', JSON.stringify(this.state));
            }
            this.onCloudUpdate?.();
          }
        })
        .subscribe();

      // Postgres CDC changes for collaborative task updates if table exists
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
              } else {
                // Task was inserted in database by someone else
                this.state.tasks.push({
                  id: updated.id,
                  title: updated.title,
                  description: updated.description || '',
                  projectId: updated.project_id,
                  assignedTo: updated.assigned_to,
                  phase: updated.phase,
                  status: updated.status,
                  priority: updated.priority,
                  cognitiveLoad: updated.cognitive_load || 'medium',
                  xpReward: updated.xp_reward || 90,
                  estimatedHours: Number(updated.estimated_hours) || 4,
                  actualHours: Number(updated.actual_hours) || 0,
                  createdAt: updated.created_at || new Date().toISOString(),
                  completedAt: updated.completed_at,
                  deadline: updated.deadline,
                });
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

  broadcastTasksSync(action: 'add' | 'update' | 'complete' | 'delete' | 'sync', task?: AgencyTask) {
    try {
      const payload = {
        action,
        task,
        allTasks: this.state.tasks,
        allProjects: this.state.projects,
        senderTime: Date.now(),
      };

      if (this.syncChannel) {
        this.syncChannel.send({
          type: 'broadcast',
          event: 'tasks_sync',
          payload,
        });
      } else {
        supabase.channel('aeethod-agency-sync').send({
          type: 'broadcast',
          event: 'tasks_sync',
          payload,
        });
      }

      // Also broadcast through multiplayer co-op channel
      try {
        const mp = getMultiplayerManager();
        if (mp && mp.isConnected) {
          mp.broadcastBoardUpdate('tasks_sync', payload);
        }
      } catch (e) {}
    } catch (e) {
      console.warn('Realtime task broadcast error:', e);
    }
  }

  handleIncomingTaskSync(payload: { action: string; task?: AgencyTask; allTasks?: AgencyTask[]; allProjects?: Project[] }) {
    let changed = false;

    if (payload.task && payload.task.id) {
      const idx = this.state.tasks.findIndex(t => t.id === payload.task!.id);
      if (idx === -1) {
        this.state.tasks.push(payload.task);
        changed = true;
      } else {
        this.state.tasks[idx] = { ...this.state.tasks[idx], ...payload.task };
        changed = true;
      }
    }

    if (Array.isArray(payload.allTasks) && payload.allTasks.length > 0) {
      const taskMap = new Map<string, AgencyTask>();
      for (const t of this.state.tasks) {
        if (t && t.id) taskMap.set(t.id, t);
      }
      for (const t of payload.allTasks) {
        if (t && t.id) {
          if (!taskMap.has(t.id)) {
            taskMap.set(t.id, t);
            changed = true;
          } else {
            const existing = taskMap.get(t.id)!;
            if (existing.status !== t.status || existing.completedAt !== t.completedAt) {
              taskMap.set(t.id, { ...existing, ...t });
              changed = true;
            }
          }
        }
      }
      if (changed) {
        this.state.tasks = Array.from(taskMap.values());
      }
    }

    if (Array.isArray(payload.allProjects) && payload.allProjects.length > 0) {
      const projMap = new Map<string, Project>();
      for (const p of this.state.projects) {
        if (p && p.id) projMap.set(p.id, p);
      }
      for (const p of payload.allProjects) {
        if (p && p.id && !projMap.has(p.id)) {
          projMap.set(p.id, p);
          changed = true;
        }
      }
      if (changed) {
        this.state.projects = Array.from(projMap.values());
      }
    }

    if (changed) {
      this.state.savedAt = new Date().toISOString();
      localStorage.setItem('aeethod_agency', JSON.stringify(this.state));
      this.onCloudUpdate?.();
    }
  }

  broadcastLiveState() {
    this.broadcastTasksSync('sync');
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
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      actualHours: 0
    } as AgencyTask;
    this.state.tasks.push(newTask);
    this.save();
    this.broadcastTasksSync('add', newTask);
    upsertTaskCloud(newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<AgencyTask>) {
    const index = this.state.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.state.tasks[index] = { ...this.state.tasks[index], ...updates };
      this.save();
      this.broadcastTasksSync('update', this.state.tasks[index]);
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
      this.broadcastTasksSync('complete', task);
      updateTaskStatusCloud(id, 'done', task.completedAt);
    }
  }

  deleteTask(id: string) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.save();
    this.broadcastTasksSync('delete', { id } as any);
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
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      taskIds: [],
      completedDate: null
    } as Project;
    this.state.projects.push(newProject);
    this.save();
    this.broadcastTasksSync('sync');
    upsertProjectCloud(newProject);
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>) {
    const index = this.state.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.state.projects[index] = { ...this.state.projects[index], ...updates };
      this.save();
      this.broadcastTasksSync('sync');
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
      this.broadcastTasksSync('sync');
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

  async loadRoleAccessCodesFromCloud(): Promise<RoleAccessCode[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('avatar_config')
        .eq('username', 'aeethod_system')
        .maybeSingle();

      if (!error && data && data.avatar_config) {
        const config: any = data.avatar_config;
        const remoteCodes = config.roleAccessCodes;
        if (Array.isArray(remoteCodes) && remoteCodes.length > 0) {
          const current = this.state.roleAccessCodes || [];
          const codeMap = new Map<string, RoleAccessCode>();

          codeMap.set(DEFAULT_FOUNDER_CODE, {
            id: 'code_founder',
            roleName: 'Founder',
            code: DEFAULT_FOUNDER_CODE,
            department: 'management',
            createdAt: new Date().toISOString(),
            claimedBy: [],
          });

          for (const c of remoteCodes) {
            if (c && c.code) {
              codeMap.set(c.code.toUpperCase(), c);
            }
          }

          for (const c of current) {
            if (c && c.code && !codeMap.has(c.code.toUpperCase())) {
              codeMap.set(c.code.toUpperCase(), c);
            }
          }

          this.state.roleAccessCodes = Array.from(codeMap.values());
          if (typeof window !== 'undefined') {
            localStorage.setItem('aeethod_agency', JSON.stringify(this.state));
          }
          this.onCloudUpdate?.();
          return this.state.roleAccessCodes;
        }
      }
    } catch (err) {
      console.warn('Failed to load role codes from cloud:', err);
    }
    return this.getRoleAccessCodes();
  }

  async syncRoleAccessCodesToCloud(): Promise<boolean> {
    try {
      const codes = this.getRoleAccessCodes();

      // Fetch existing avatar_config first so tasks and projects are preserved
      const { data: current } = await (supabase as any)
        .from('profiles')
        .select('avatar_config')
        .eq('username', 'aeethod_system')
        .maybeSingle();

      const existingConfig = current?.avatar_config || {};

      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          avatar_config: {
            ...existingConfig,
            roleAccessCodes: codes,
            updatedAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('username', 'aeethod_system');

      if (error) {
        console.warn('Sync role codes error:', error.message);
        return false;
      }

      try {
        (supabase as any).channel('aeethod-agency-sync').send({
          type: 'broadcast',
          event: 'role_codes_sync',
          payload: codes,
        });
      } catch (e) {}

      return true;
    } catch (err) {
      console.warn('Failed to sync role codes to cloud:', err);
      return false;
    }
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
    this.syncRoleAccessCodesToCloud();
    return newCode;
  }

  deleteRoleAccessCode(id: string): void {
    if (!this.state.roleAccessCodes) return;
    this.state.roleAccessCodes = this.state.roleAccessCodes.filter(c => c.id !== id);
    this.save();
    this.saveToCloud();
    this.syncRoleAccessCodesToCloud();
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

  async validateAccessCodeAsync(inputCode: string): Promise<{ valid: boolean; roleName?: string; department?: RoomId; error?: string }> {
    const clean = inputCode.trim().toUpperCase();
    if (!clean) {
      return { valid: false, error: 'Please enter a 5-letter access code.' };
    }

    // 1. Fast path: check local memory / founder code
    const local = this.validateAccessCode(clean);
    if (local.valid) {
      return local;
    }

    // 2. Slow path: refresh from cloud
    try {
      await this.loadRoleAccessCodesFromCloud();
      const freshCheck = this.validateAccessCode(clean);
      if (freshCheck.valid) {
        return freshCheck;
      }
    } catch (e) {
      console.warn('Cloud validation fallback error:', e);
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
        this.syncRoleAccessCodesToCloud();
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
