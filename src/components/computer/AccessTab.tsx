import React, { useState } from 'react';
import { AgencyState, RoleAccessCode, RoomId } from '../../core/agencyTypes';
import AgencyManager from '../../core/agency';

interface AccessTabProps {
  agency: AgencyState;
  manager: AgencyManager;
  onRefresh: () => void;
}

export default function AccessTab({ agency, manager, onRefresh }: AccessTabProps) {
  const [roleName, setRoleName] = useState('');
  const [department, setDepartment] = useState<RoomId>('dev');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [justGenerated, setJustGenerated] = useState<RoleAccessCode | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState<'all' | RoomId>('all');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  React.useEffect(() => {
    manager.loadRoleAccessCodesFromCloud().then(() => onRefresh());
  }, [manager, onRefresh]);

  const roleCodes: RoleAccessCode[] = manager.getRoleAccessCodes();

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    const newCode = manager.createRoleAccessCode(roleName.trim(), department);
    setJustGenerated(newCode);
    setRoleName('');
    showToast(`🔑 Created access code: ${newCode.code} for ${newCode.roleName}!`);
    onRefresh();
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`📋 Copied access code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to revoke access code "${code}"?`)) {
      manager.deleteRoleAccessCode(id);
      showToast(`🗑️ Revoked access code ${code}`);
      onRefresh();
    }
  };

  const roomLabels: Record<RoomId, { name: string; icon: string; color: string }> = {
    dev: { name: 'Development', icon: '💻', color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40' },
    design: { name: 'Design Studio', icon: '🎨', color: 'border-purple-500/40 text-purple-300 bg-purple-950/40' },
    content: { name: 'Content Marketing', icon: '📅', color: 'border-amber-500/40 text-amber-300 bg-amber-950/40' },
    client: { name: 'Client CRM', icon: '🤝', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' },
    management: { name: 'Executive Suite', icon: '👑', color: 'border-rose-500/40 text-rose-300 bg-rose-950/40' },
  };

  const filteredCodes = roleCodes.filter(c => {
    const matchesSearch = c.roleName.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          c.code.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesDept = deptFilter === 'all' || c.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const totalClaimed = roleCodes.filter(c => c.claimedBy && c.claimedBy.length > 0).length;

  return (
    <div className="p-5 space-y-5 text-slate-200 bg-[#080d14] overflow-y-auto max-h-[85vh] font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-14 right-8 z-50 px-4 py-2.5 bg-emerald-950 border border-emerald-500 rounded-lg shadow-2xl text-emerald-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
          <span>🔔</span> {notification}
        </div>
      )}

      {/* =========================================================================
          🔑 HEADER: STUDIO ROLE & ACCESS KEY GENERATOR
          ========================================================================= */}
      <div className="bg-[#0e1622] border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.1)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔑</span>
            <h1 className="text-lg font-black tracking-wider text-cyan-400 font-mono">
              ROLE & ACCESS KEY GENERATOR <span className="text-slate-500 font-normal">—</span> {agency.agency.name || 'Founder'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Create custom studio roles, generate secure access codes, and distribute them to onboard team members directly.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 bg-[#121c2a] border border-slate-800 rounded-lg text-slate-300">
            Active Keys: <strong className="text-cyan-400">{roleCodes.length}</strong>
          </div>
          <div className="px-3 py-1.5 bg-[#121c2a] border border-slate-800 rounded-lg text-slate-300">
            Claimed: <strong className="text-emerald-400">{totalClaimed}</strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          GRID: CREATE ROLE FORM (LEFT) + HOW IT WORKS (RIGHT)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Create Role Form */}
        <div className="lg:col-span-7 bg-[#0e1622] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="border-b border-slate-800 pb-2.5 mb-4 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span>⚡</span> CREATE ROLE & GENERATE KEY
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">AUTOMATIC CODE ASSIGNMENT</span>
          </div>

          <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Role Title / Designation:</label>
              <input
                type="text"
                required
                value={roleName}
                onChange={e => setRoleName(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer, UI/UX Lead, Client Partner..."
                className="w-full bg-[#121c2a] border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 text-slate-100 placeholder-slate-600 outline-none transition font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Department Workstation:</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value as RoomId)}
                  className="w-full bg-[#121c2a] border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 text-slate-200 outline-none transition"
                >
                  <option value="dev">💻 Development Room</option>
                  <option value="design">🎨 Design Room</option>
                  <option value="content">📅 Content Management</option>
                  <option value="client">🤝 Client Management</option>
                  <option value="management">👑 Executive Suite</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🔑</span> Generate Access Key
                </button>
              </div>
            </div>
          </form>

          {/* Just Generated Highlight Box */}
          {justGenerated && (
            <div className="mt-4 p-3.5 bg-emerald-950/60 border border-emerald-500/60 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
              <div>
                <span className="text-[10px] text-emerald-400 font-mono block uppercase font-bold">✨ Key Ready for Distribution</span>
                <span className="font-bold text-slate-100 text-sm">{justGenerated.roleName}</span>
                <span className="text-xs text-slate-400 block font-mono">Department: {roomLabels[justGenerated.department]?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-[#0a1420] border border-emerald-400/40 rounded-lg font-mono font-black text-emerald-300 text-sm tracking-wider">
                  {justGenerated.code}
                </span>
                <button
                  onClick={() => handleCopy(justGenerated.code)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
                >
                  {copiedCode === justGenerated.code ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* How It Works Guide Card */}
        <div className="lg:col-span-5 bg-[#0e1622] border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm font-mono text-xs">
          <div>
            <div className="border-b border-slate-800 pb-2.5 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>💡</span> HOW ONBOARDING WORKS
              </h2>
              <span className="text-[10px] text-slate-500">SYSTEM RULES</span>
            </div>

            <div className="space-y-3 text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <span><strong>Generate Key:</strong> Create a role code above (e.g. <code className="text-cyan-300">AETH-DEV-1234</code>).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">2.</span>
                <span><strong>Send to Teammate:</strong> Provide the code to your colleague via Slack, Discord, or email.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">3.</span>
                <span><strong>Code-Gated Login:</strong> When they visit the website, they input the code to unlock their role.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">4.</span>
                <span><strong>One-Time Avatar Creation:</strong> They customize their avatar once, then enter the office.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">5.</span>
                <span><strong>Permanent Cache:</strong> All subsequent visits bypass the login screen and load their avatar automatically!</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            👑 <strong>Founder 5-Letter Key:</strong> <code className="text-amber-400 font-bold">{manager.getRoleAccessCodes().find(c => c.roleName.toLowerCase().includes('founder'))?.code || 'Active'}</code>
          </div>
        </div>

      </div>

      {/* =========================================================================
          ACTIVE ACCESS KEYS DIRECTORY TABLE
          ========================================================================= */}
      <div className="bg-[#0e1622] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2 font-mono">
              <span>📋</span> ACTIVE ROLE KEYS DIRECTORY ({filteredCodes.length})
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <input
              type="text"
              placeholder="Search roles or codes..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="bg-[#121c2a] border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:border-cyan-500 outline-none text-xs"
            />
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value as any)}
              className="bg-[#121c2a] border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:border-cyan-500 outline-none text-xs"
            >
              <option value="all">All Departments</option>
              <option value="dev">💻 Development</option>
              <option value="design">🎨 Design</option>
              <option value="content">📅 Content</option>
              <option value="client">🤝 Client</option>
              <option value="management">👑 Executive</option>
            </select>
          </div>
        </div>

        {/* Directory List */}
        <div className="space-y-2 font-mono text-xs">
          {filteredCodes.length === 0 ? (
            <div className="p-8 text-center bg-[#121c2a] rounded-xl border border-slate-800/80 text-slate-500">
              <span className="text-2xl block mb-1">🔑</span>
              <span>No access keys found matching criteria.</span>
            </div>
          ) : (
            filteredCodes.map(item => {
              const deptInfo = roomLabels[item.department] || roomLabels.dev;
              const isClaimed = item.claimedBy && item.claimedBy.length > 0;

              return (
                <div
                  key={item.id}
                  className="p-3 bg-[#121c2a] hover:bg-[#142030] transition rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{deptInfo.icon}</span>
                    <div>
                      <span className="font-bold text-slate-100 text-sm block font-sans">{item.roleName}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${deptInfo.color}`}>
                          {deptInfo.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Created: {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge */}
                    <span className={`text-[10px] px-2 py-1 rounded border font-bold ${
                      isClaimed 
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' 
                        : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                    }`}>
                      {isClaimed ? `🟢 Claimed (${item.claimedBy?.join(', ')})` : '🟡 Available'}
                    </span>

                    {/* Access Code Monospace Box */}
                    <div className="flex items-center gap-1 bg-[#090f18] px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-300 font-bold tracking-widest text-xs">
                      <span>{item.code}</span>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(item.code)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-900/60 text-slate-200 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/60 rounded-lg font-bold transition flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      {copiedCode === item.code ? '✓ Copied' : '📋 Copy'}
                    </button>

                    {/* Delete / Revoke Button */}
                    {!item.roleName.toLowerCase().includes('founder') && (
                      <button
                        onClick={() => handleDelete(item.id, item.code)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 rounded-lg transition text-[11px] cursor-pointer"
                        title="Revoke access key"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
