const fs = require('fs');

// 1. Update agency.ts
let agencyCode = fs.readFileSync('src/core/agency.ts', 'utf-8');

// Update team members in createSeedState
const oldTeam = `      team: [
        { id: 'founder', name: 'Founder (CEO)', role: 'Project Architect & Backend Lead', room: 'management', xp: 450, level: 2, status: 'working', skills: ['Architecture', 'Backend', 'Client Relations', 'Strategy'], currentTaskId: null, capacityHoursPerWeek: 40, assignedHours: 12 },
        { id: 'designer', name: 'Designer', role: 'UI/UX & Visual Design', room: 'design', xp: 250, level: 1, status: 'working', skills: ['UI/UX', 'Branding', 'Figma', 'Visual Design'], currentTaskId: 'task_demo_design', capacityHoursPerWeek: 40, assignedHours: 24 },
        { id: 'frontend', name: 'Frontend Developer', role: 'Frontend & QA', room: 'dev', xp: 220, level: 1, status: 'blocked', skills: ['React', 'Next.js', 'TypeScript', 'QA'], currentTaskId: 'task_demo_dev', capacityHoursPerWeek: 40, assignedHours: 28 }
      ],`;

const newTeam = `      team: [
        { id: 'founder', name: 'Founder (CEO)', role: 'Project Architect & Executive Lead', room: 'management', xp: 450, level: 2, status: 'working', skills: ['Architecture', 'Strategy', 'Client Relations'], currentTaskId: null, capacityHoursPerWeek: 40, assignedHours: 12 },
        { id: 'designer', name: 'Designer (Creative Lead)', role: 'UI/UX & Visual Design', room: 'design', xp: 250, level: 1, status: 'working', skills: ['UI/UX', 'Branding', 'Figma', 'Design Systems'], currentTaskId: 'task_demo_design', capacityHoursPerWeek: 40, assignedHours: 24 },
        { id: 'frontend', name: 'Frontend Dev (Hello Kitty)', role: 'Frontend & UI/UX Engineer', room: 'dev', xp: 220, level: 1, status: 'blocked', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Animations'], currentTaskId: 'task_demo_dev', capacityHoursPerWeek: 40, assignedHours: 28 },
        { id: 'backend', name: 'Backend Dev (Spider-Man)', role: 'Backend & Systems Architect', room: 'dev', xp: 280, level: 1, status: 'working', skills: ['Node.js', 'PostgreSQL', 'Redis', 'GraphQL', 'APIs'], currentTaskId: 'task_demo_backend', capacityHoursPerWeek: 40, assignedHours: 24 }
      ],`;

agencyCode = agencyCode.replace(oldTeam, newTeam);

// Also add a sample backend task to seed tasks
const oldTaskDemoDev = `        {
          id: 'task_demo_dev',
          title: 'PostgreSQL Schema & Buylist Engine API',
          description: 'STUCK: Waiting on TCG API client secret credentials from client to finish card inventory sync.',
          projectId: demoProjectId,
          assignedTo: 'frontend',
          phase: 'development',
          status: 'blocked',
          estimatedHours: 16,
          actualHours: 4,
          priority: 'high',
          dueDate: new Date(now + 2 * 86400000).toISOString(),
          xpReward: 35,
          createdAt: new Date(now - 4 * 86400000).toISOString(),
          blockedReason: 'Awaiting CardVault API Client Secret key to test live card sync.',
          daysStagnant: 4
        } as AgencyTask,`;

const newTaskDemoDevAndBackend = `        {
          id: 'task_demo_dev',
          title: 'Interactive TCG Card Scanner UI & Animations',
          description: 'STUCK: Need finalized Buylist API endpoint response shape to render live inventory grid.',
          projectId: demoProjectId,
          assignedTo: 'frontend',
          phase: 'development',
          status: 'blocked',
          estimatedHours: 14,
          actualHours: 4,
          priority: 'high',
          dueDate: new Date(now + 2 * 86400000).toISOString(),
          xpReward: 35,
          createdAt: new Date(now - 4 * 86400000).toISOString(),
          blockedReason: 'Awaiting backend inventory response schema to complete responsive grid.',
          daysStagnant: 3
        } as AgencyTask,
        {
          id: 'task_demo_backend',
          title: 'High-Throughput PostgreSQL Buylist & Pricing Engine',
          description: 'Optimizing Redis cache indexing and webhook consumers for live card pricing feeds.',
          projectId: demoProjectId,
          assignedTo: 'backend',
          phase: 'development',
          status: 'in_progress',
          estimatedHours: 20,
          actualHours: 12,
          priority: 'high',
          dueDate: new Date(now + 5 * 86400000).toISOString(),
          xpReward: 45,
          createdAt: new Date(now - 2 * 86400000).toISOString()
        } as AgencyTask,`;

agencyCode = agencyCode.replace(oldTaskDemoDev, newTaskDemoDevAndBackend);

// Ensure auto-migration in load() adds backend if missing
const oldLoadCheck = "if (!loaded.projects || !loaded.projects.find((p: any) => p.id === 'proj_cardvault')) {";
const newLoadCheck = "if (!loaded.projects || !loaded.projects.find((p: any) => p.id === 'proj_cardvault') || !loaded.team?.find((m: any) => m.id === 'backend')) {";

agencyCode = agencyCode.replace(oldLoadCheck, newLoadCheck);

fs.writeFileSync('src/core/agency.ts', agencyCode, 'utf-8');

// 2. Update engine.ts
let engineCode = fs.readFileSync('src/core/engine.ts', 'utf-8');

// Update getNearestInteraction prompts
engineCode = engineCode.replace(
  "check('dev_pc_kitty', T(6.5), T(6.3), 55, '🌸 [E] Dev Station (Hello Kitty)');",
  "check('dev_pc_kitty', T(6.5), T(6.3), 55, '🌸 [E] Frontend Dev (Hello Kitty)');"
);
engineCode = engineCode.replace(
  "check('dev_pc_spidey', T(6.5), T(15.1), 55, '🕷️ [E] Dev Station (Spider-Man)');",
  "check('dev_pc_spidey', T(6.5), T(15.1), 55, '🕷️ [E] Backend Dev (Spider-Man)');"
);

// Update setupEvents keydown 'e'
engineCode = engineCode.replace(
  "} else if (interaction.type === 'dev_pc_kitty' || interaction.type === 'dev_pc_spidey') {\n            this.onOpenMember?.('frontend');",
  `} else if (interaction.type === 'dev_pc_kitty') {
            this.onOpenMember?.('frontend');
          } else if (interaction.type === 'dev_pc_spidey') {
            this.onOpenMember?.('backend');`
);

// Update handleClick
engineCode = engineCode.replace(
  "if (checkClick(T(6.5), T(15.1), 60, () => this.onOpenMember?.('frontend'))) return;",
  "if (checkClick(T(6.5), T(15.1), 60, () => this.onOpenMember?.('backend'))) return;"
);

fs.writeFileSync('src/core/engine.ts', engineCode, 'utf-8');
console.log('Successfully configured Hello Kitty as Frontend Dev and Spider-Man as Backend Dev!');
