// ============================================================
// AEETHOD FACTORY — Agency Data Types
// ============================================================

// --- Agency Core ---

export interface AgencyInfo {
  name: string;
  level: number;
  xp: number;
  totalXP: number;
  founded: string;
  motto: string;
}

export interface Resources {
  revenue: number;
  monthlyRecurring: number;
  energy: number; // team hours available this week
  reputation: number; // 0-100
  knowledge: number;
}

export interface StreakData {
  current: number;
  longest: number;
  lastActiveDate: string; // ISO date
}

export interface AgencyStats {
  totalTasksCompleted: number;
  totalProjectsShipped: number;
  totalRevenue: number;
  hoursLogged: number;
}

// --- Team ---

export type RoomId = 'dev' | 'design' | 'content' | 'client' | 'management';
export type MemberStatus = 'working' | 'idle' | 'blocked' | 'offline';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  room: RoomId;
  xp: number;
  level: number;
  status: MemberStatus;
  currentTaskId: string | null;
  skills: string[];
  capacityHoursPerWeek: number;
  assignedHours: number;
}

// --- Projects ---

export type ProjectPhase =
  | 'lead'
  | 'discovery'
  | 'proposal'
  | 'architecture'
  | 'build'
  | 'launch'
  | 'maintenance'
  | 'completed';

export type ProjectPackage = 'essential' | 'professional' | 'enterprise';
export type HealthStatus = 'green' | 'yellow' | 'red';

export interface Project {
  id: string;
  name: string;
  clientName: string;
  industry: string;
  package: ProjectPackage;
  value: number;
  phase: ProjectPhase;
  startDate: string;
  deadline: string;
  completedDate: string | null;
  health: HealthStatus;
  taskIds: string[];
  notes: string;
  satisfaction: number; // 0-100
}

// --- Tasks ---

export type TaskPhase = 'discovery' | 'architecture' | 'design' | 'development' | 'testing' | 'launch' | 'support';
export type TaskStatus = 'queued' | 'active' | 'blocked' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CognitiveLoad = 'deep' | 'medium' | 'grunt' | 'micro';

export interface AgencyTask {
  id: string;
  title: string;
  description: string;
  projectId: string | null;
  assignedTo: string | null; // team member ID
  phase: TaskPhase;
  status: TaskStatus;
  priority: TaskPriority;
  cognitiveLoad: CognitiveLoad;
  xpReward: number;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  completedAt: string | null;
  deadline?: string | null;
}

// --- Leads ---

export type LeadSource = 'website' | 'referral' | 'outreach' | 'social';
export type LeadStatus = 'new' | 'contacted' | 'discovery_scheduled' | 'proposal_sent' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  company: string;
  industry: string;
  source: LeadSource;
  packageInterest: ProjectPackage;
  estimatedValue: number;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  lastContact: string;
}

// --- Achievements ---

export type AchievementCategory = 'launches' | 'revenue' | 'speed' | 'quality' | 'growth' | 'streaks';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
  target: number;
  current: number;
}

// --- Quests ---

export type QuestType = 'daily' | 'weekly' | 'epic';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  target: number;
  progress: number;
  xpReward: number;
  deadline: string;
  completed: boolean;
  completedAt: string | null;
}

// --- Department Alerts (Stagnation & Blockers) ---

export interface DepartmentAlert {
  room: RoomId;
  severity: 'yellow' | 'red';
  reason: string;
  daysStalled: number;
  blockedProjectName: string;
}

// --- Full Agency State ---

export interface AgencyState {
  agency: AgencyInfo;
  resources: Resources;
  team: TeamMember[];
  projects: Project[];
  tasks: AgencyTask[];
  leads: Lead[];
  achievements: Achievement[];
  quests: Quest[];
  streaks: StreakData;
  stats: AgencyStats;
  savedAt: string;
}
