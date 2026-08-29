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
  DepartmentAlert
} from './agencyTypes';

export class AgencyManager {
  state: AgencyState;

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
  }

  save() {
    this.state.savedAt = new Date().toISOString();
    localStorage.setItem('aeethod_agency', JSON.stringify(this.state));
  }

  load(): boolean {
    const data = localStorage.getItem('aeethod_agency');
    if (data) {
      try {
        const loaded = JSON.parse(data);
        if (!loaded.projects || !loaded.projects.find((p: any) => p.id === 'proj_cardvault') || !loaded.team?.find((m: any) => m.id === 'backend')) {
          this.state = this.createSeedState();
          this.save();
          return true;
        }
        this.state = loaded;
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
    return newTask;
  }

  updateTask(id: string, updates: Partial<AgencyTask>) {
    const index = this.state.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.state.tasks[index] = { ...this.state.tasks[index], ...updates };
      this.save();
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
      { id: 'first_launch', title: 'First Launch', description: 'Ship your first project', category: 'launches' as AchievementCategory, target: 1, current: 2, unlocked: true, unlockedAt: new Date().toISOString(), icon: '🚀' },
      { id: 'five_launches', title: 'Rising Star', description: 'Ship 5 projects', category: 'launches' as AchievementCategory, target: 5, current: 2, unlocked: false, unlockedAt: null, icon: '⭐' },
      { id: 'ten_launches', title: 'Veteran', description: 'Ship 10 projects', category: 'launches' as AchievementCategory, target: 10, current: 2, unlocked: false, unlockedAt: null, icon: '🏆' },
      { id: 'first_5k', title: 'First $5k', description: 'Reach $5,000 in total revenue', category: 'revenue' as AchievementCategory, target: 5000, current: 15000, unlocked: false, unlockedAt: null, icon: '💰' },
      { id: 'five_figure_month', title: 'Five Figure Month', description: 'Earn $10,000 in a single month', category: 'revenue' as AchievementCategory, target: 10000, current: 0, unlocked: false, unlockedAt: null, icon: '📈' },
      { id: 'six_figure_year', title: 'Six Figure Year', description: 'Earn $100,000 in total revenue', category: 'revenue' as AchievementCategory, target: 100000, current: 15000, unlocked: false, unlockedAt: null, icon: '💼' },
      { id: 'task_machine', title: 'Task Machine', description: 'Complete 100 tasks', category: 'speed' as AchievementCategory, target: 100, current: 0, unlocked: false, unlockedAt: null, icon: '⚙️' },
      { id: 'task_500', title: 'Productivity Master', description: 'Complete 500 tasks', category: 'speed' as AchievementCategory, target: 500, current: 0, unlocked: false, unlockedAt: null, icon: '⚡' },
      { id: 'week_streak', title: 'Consistent', description: 'Maintain a 7-day streak', category: 'streaks' as AchievementCategory, target: 7, current: 0, unlocked: false, unlockedAt: null, icon: '🔥' },
      { id: 'month_streak', title: 'Unstoppable', description: 'Maintain a 30-day streak', category: 'streaks' as AchievementCategory, target: 30, current: 0, unlocked: false, unlockedAt: null, icon: '🌋' },
      { id: 'team_of_5', title: 'Growing Agency', description: 'Hire 5 team members', category: 'growth' as AchievementCategory, target: 5, current: 3, unlocked: false, unlockedAt: null, icon: '👥' },
      { id: 'perfect_score', title: 'Perfect Score', description: 'Get a 100% satisfaction rating on a project', category: 'quality' as AchievementCategory, target: 1, current: 0, unlocked: false, unlockedAt: null, icon: '💎' }
    ];

    const demoProjectId = 'proj_cardvault';
    const now = Date.now();

    return {
      savedAt: new Date().toISOString(),
      agency: {
        name: 'AEETHOD',
        level: 2,
        xp: 250,
        totalXP: 750,
        founded: '2024',
        motto: 'We build systems, not websites.'
      },
      resources: {
        revenue: 15000,
        monthlyRecurring: 1200,
        energy: 120,
        reputation: 78,
        knowledge: 55
      },
      team: [
        { id: 'founder', name: 'Founder (CEO)', role: 'Project Architect & Executive Lead', room: 'management', xp: 450, level: 2, status: 'working', skills: ['Architecture', 'Strategy', 'Client Relations'], currentTaskId: null, capacityHoursPerWeek: 40, assignedHours: 12 },
        { id: 'designer', name: 'Designer (Creative Lead)', role: 'UI/UX & Visual Design', room: 'design', xp: 250, level: 1, status: 'working', skills: ['UI/UX', 'Branding', 'Figma', 'Design Systems'], currentTaskId: 'task_demo_design', capacityHoursPerWeek: 40, assignedHours: 24 },
        { id: 'frontend', name: 'Frontend Dev (Hello Kitty)', role: 'Frontend & UI/UX Engineer', room: 'dev', xp: 220, level: 1, status: 'blocked', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Animations'], currentTaskId: 'task_demo_dev', capacityHoursPerWeek: 40, assignedHours: 28 },
        { id: 'backend', name: 'Backend Dev (Spider-Man)', role: 'Backend & Systems Architect', room: 'dev', xp: 280, level: 1, status: 'working', skills: ['Node.js', 'PostgreSQL', 'Redis', 'GraphQL', 'APIs'], currentTaskId: 'task_demo_backend', capacityHoursPerWeek: 40, assignedHours: 24 }
      ],
      projects: [
        {
          id: demoProjectId,
          clientName: 'CardVault Collectibles (US)',
          name: 'CardVault AI Platform',
          package: 'enterprise',
          value: 12000,
          phase: 'build',
          industry: 'TCG',
          satisfaction: 88,
          completedDate: null,
          taskIds: ['task_demo_dev', 'task_demo_design', 'task_demo_disc'],
          startDate: new Date(now - 10 * 86400000).toISOString(),
          deadline: new Date(now + 20 * 86400000).toISOString(),
          health: 'yellow',
          notes: 'Enterprise TCG e-commerce with AI card pricing engine, inventory predictor, and real-time buylist.'
        } as Project,
        { id: 'proj_rng', clientName: 'RNG Gamez', name: 'RNG Gamez', package: 'enterprise', value: 10000, phase: 'completed', industry: 'TCG', satisfaction: 90, completedDate: new Date().toISOString(), taskIds: [], startDate: '2024-06-01', deadline: '2024-08-01', health: 'green', notes: 'TCG e-commerce platform with inventory, buylist, events' } as Project,
        { id: 'proj_perfume', clientName: 'Perfume Shop Client', name: 'Perfume Shop', package: 'professional', value: 5000, phase: 'completed', industry: 'Beauty', satisfaction: 85, completedDate: new Date().toISOString(), taskIds: [], startDate: '2024-09-01', deadline: '2024-11-01', health: 'green', notes: 'Custom e-commerce with product variants and AI tools' } as Project
      ],
      tasks: [
        {
          id: 'task_demo_dev',
          title: 'PostgreSQL Schema & Buylist Engine API',
          description: 'STUCK: Waiting on TCG API client secret credentials from client to finish card inventory sync.',
          projectId: demoProjectId,
          assignedTo: 'frontend',
          phase: 'development',
          status: 'blocked',
          priority: 'urgent',
          cognitiveLoad: 'deep',
          estimatedHours: 8,
          actualHours: 4,
          xpReward: 120,
          createdAt: new Date(now - 5 * 86400000).toISOString(),
          completedAt: null,
          deadline: new Date(now + 3 * 86400000).toISOString()
        },
        {
          id: 'task_demo_design',
          title: 'Card Market UI/UX Wireframes & Filter Spec',
          description: 'Untouched for 3 days. Dev team needs completed wireframe spec to build product catalog page.',
          projectId: demoProjectId,
          assignedTo: 'designer',
          phase: 'design',
          status: 'active',
          priority: 'high',
          cognitiveLoad: 'medium',
          estimatedHours: 6,
          actualHours: 1,
          xpReward: 90,
          createdAt: new Date(now - 3 * 86400000).toISOString(),
          completedAt: null,
          deadline: new Date(now + 5 * 86400000).toISOString()
        },
        {
          id: 'task_demo_disc',
          title: 'Technical Architecture & Card Sync Audit',
          description: 'Completed discovery phase audit and system architecture document.',
          projectId: demoProjectId,
          assignedTo: 'founder',
          phase: 'discovery',
          status: 'done',
          priority: 'medium',
          cognitiveLoad: 'deep',
          estimatedHours: 10,
          actualHours: 10,
          xpReward: 150,
          createdAt: new Date(now - 10 * 86400000).toISOString(),
          completedAt: new Date(now - 7 * 86400000).toISOString(),
          deadline: null
        }
      ],
      leads: [
        {
          id: 'lead_demo_1',
          name: 'Marcus Vance',
          company: 'DragonCard Vault (Texas)',
          industry: 'TCG',
          source: 'website',
          packageInterest: 'enterprise',
          estimatedValue: 12000,
          status: 'new',
          notes: 'Wants full custom AI buylist sync for 100k+ Magic cards.',
          createdAt: new Date(now - 86400000).toISOString(),
          lastContact: new Date(now - 86400000).toISOString()
        }
      ],
      achievements: seedAchievements,
      quests: [
        { id: 'epic_1', title: 'Launch Next Client Project', description: 'Deliver a brand new AI-powered e-commerce client system.', type: 'epic', target: 3, progress: 2, xpReward: 500, completed: false, deadline: new Date(Date.now() + 30 * 86400000).toISOString(), completedAt: null },
        { id: 'epic_2', title: 'Reach $50k Agency Milestone', description: 'Grow total agency revenue to $50,000.', type: 'epic', target: 50000, progress: 15000, xpReward: 1000, completed: false, deadline: new Date(Date.now() + 90 * 86400000).toISOString(), completedAt: null },
        { id: 'epic_3', title: 'Expand Core Team', description: 'Scale the agency workforce to 5 full-time specialists.', type: 'epic', target: 5, progress: 3, xpReward: 600, completed: false, deadline: new Date(Date.now() + 60 * 86400000).toISOString(), completedAt: null }
      ],
      streaks: {
        current: 3,
        longest: 5,
        lastActiveDate: new Date().toISOString()
      },
      stats: {
        totalTasksCompleted: 1,
        totalProjectsShipped: 2,
        totalRevenue: 15000,
        hoursLogged: 10
      }
    };
  }
}

let _instance: AgencyManager | null = null;
export function getAgencyManager(): AgencyManager {
  if (!_instance) _instance = new AgencyManager();
  return _instance;
}
export default AgencyManager;
