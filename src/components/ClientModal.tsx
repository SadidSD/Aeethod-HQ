import { useState, useEffect } from 'react';
import { AgencyState, Project, Lead } from '../core/agencyTypes';
import AgencyManager from '../core/agency';

interface ClientModalProps {
  agency: AgencyState;
  manager: AgencyManager;
  onClose: () => void;
  onRefresh: () => void;
}

interface ClientAccount {
  id: string;
  name: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  contactPerson: string;
  industry: string;
  status: 'active' | 'in_progress' | 'discovery';
  revenue: number;
  rating: number | null; // e.g. 5.0, 4.5, 4.0 or null
  portalStatus: boolean; // true = active, false = inactive
  projectType: string;
  progressPct: number;
  nextMeeting: string;
  lastActivity: string;
  portalLastLogin: string;
  projectsViewed: number;
  messagesCount: number;
  filesDownloaded: number;
  invoicesViewed: number;
  inviteSentDate: string;
  inviteAcceptedDate: string;
  notes: string[];
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'draft' | 'overdue';
}

interface DeadlineMeetingItem {
  id: string;
  priority: 'red' | 'yellow' | 'green';
  timeLabel: string;
  title: string;
  clientName: string;
}

interface CommLogItem {
  id: string;
  date: string;
  type: 'email' | 'call' | 'note' | 'message';
  text: string;
}

export default function ClientModal({ agency, manager, onClose, onRefresh }: ClientModalProps) {
  // Toast notifications
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);

  const showToast = (message: string, icon = '🤝') => {
    setNotification({ message, icon });
    setTimeout(() => setNotification(null), 3500);
  };

  // LocalStorage keys
  const CLIENTS_STORAGE_KEY = 'aeethod_crm_clients_v2';
  const INVOICES_STORAGE_KEY = 'aeethod_crm_invoices_v2';
  const DEADLINES_STORAGE_KEY = 'aeethod_crm_deadlines_v2';
  const COMM_STORAGE_KEY = 'aeethod_crm_comm_v2';

  // Active Client List State
  const [clients, setClients] = useState<ClientAccount[]>(() => {
    try {
      const saved = localStorage.getItem(CLIENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // If no saved clients, dynamically map from existing agency.projects if any exist
    if (agency.projects && agency.projects.length > 0) {
      return agency.projects.map((p, idx) => ({
        id: `cli-${p.id}`,
        name: p.clientName || p.name,
        location: 'Remote / Global',
        website: `${(p.clientName || p.name).toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        email: `contact@${(p.clientName || p.name).toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: '+1 (555) 010-000' + (idx + 1),
        contactPerson: 'Lead Stakeholder',
        industry: p.industry || 'Technology',
        status: (p.phase === 'completed' ? 'active' : p.phase === 'lead' ? 'discovery' : 'in_progress') as ClientAccount['status'],
        revenue: p.value || 0,
        rating: p.phase === 'completed' ? 5.0 : null,
        portalStatus: true,
        projectType: p.name,
        progressPct: p.phase === 'completed' ? 100 : 50,
        nextMeeting: 'Sprint Review Scheduled',
        lastActivity: 'Active Sprint',
        portalLastLogin: 'Recently',
        projectsViewed: 1,
        messagesCount: 0,
        filesDownloaded: 0,
        invoicesViewed: 0,
        inviteSentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        inviteAcceptedDate: 'Accepted',
        notes: [p.notes || 'Client account imported from active project.'],
      }));
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    } catch (e) {}
  }, [clients]);

  // Selected client for Deep Detail Page
  const [selectedClient, setSelectedClient] = useState<ClientAccount | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'in_progress' | 'discovery'>('all');
  const [portalFilter, setPortalFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [projectFilter, setProjectFilter] = useState<'all' | 'tcg' | 'ecom' | 'saas'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Invoices State
  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(INVOICES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    } catch (e) {}
  }, [invoices]);

  // Deadlines & Meetings
  const [deadlines, setDeadlines] = useState<DeadlineMeetingItem[]>(() => {
    try {
      const saved = localStorage.getItem(DEADLINES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(DEADLINES_STORAGE_KEY, JSON.stringify(deadlines));
    } catch (e) {}
  }, [deadlines]);

  // Communication History (for detail page)
  const [commHistory, setCommHistory] = useState<CommLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(COMM_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(COMM_STORAGE_KEY, JSON.stringify(commHistory));
    } catch (e) {}
  }, [commHistory]);

  // Interactive Action Modals
  const [activeModal, setActiveModal] = useState<'addClient' | 'createInvoice' | 'addEvent' | 'sendInvite' | 'openPortal' | 'portalSettings' | 'addCommNote' | null>(null);

  // Form states
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    location: 'Remote',
    email: '',
    phone: '',
    contactPerson: '',
    industry: 'E-Commerce',
    budget: '$10,000',
    status: 'discovery' as const
  });

  const [newInvoiceForm, setNewInvoiceForm] = useState({
    clientName: clients[0]?.name || 'Client',
    amount: '$3,000',
    dueDate: 'Apr 01',
    status: 'pending' as const
  });

  const [newEventForm, setNewEventForm] = useState({
    title: '',
    clientName: clients[0]?.name || 'Client',
    timeLabel: 'Next Mon, 11 AM',
    priority: 'yellow' as const
  });

  const [newCommNoteText, setNewCommNoteText] = useState('');

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (selectedClient) {
          setSelectedClient(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, activeModal, selectedClient]);

  // Filtered Clients
  const filteredClients = clients.filter(c => {
    // Search
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q);
    
    // Status
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    // Portal
    const matchesPortal = portalFilter === 'all' || (portalFilter === 'active' ? c.portalStatus : !c.portalStatus);
    
    return matchesSearch && matchesStatus && matchesPortal;
  });

  // Calculate Metrics
  const totalRevenue = clients.reduce((acc, c) => acc + c.revenue, 0);
  const portalActiveCount = clients.filter(c => c.portalStatus).length;
  const avgRating = (clients.filter(c => c.rating !== null).reduce((acc, c) => acc + (c.rating || 0), 0) / (clients.filter(c => c.rating !== null).length || 1)).toFixed(1);

  // Invoices Math
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const pendingInvoices = invoices.filter(i => i.status === 'pending');
  const draftInvoices = invoices.filter(i => i.status === 'draft');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const paidTotal = paidInvoices.reduce((acc, i) => acc + i.amount, 0);
  const pendingTotal = pendingInvoices.reduce((acc, i) => acc + i.amount, 0);
  const draftTotal = draftInvoices.reduce((acc, i) => acc + i.amount, 0);
  const overdueTotal = overdueInvoices.reduce((acc, i) => acc + i.amount, 0);
  const allInvoicesTotal = paidTotal + pendingTotal + draftTotal + overdueTotal;

  // Handlers
  const handleMarkInvoicePaid = (id: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'paid' } : inv));
    showToast('💰 Payment recorded! Invoice marked as Paid.', '✅');
    onRefresh();
  };

  const handleSendReminder = (clientName: string) => {
    showToast(`📧 Automated invoice reminder sent to ${clientName}!`, '📩');
  };

  const handleSendPortalInvite = (client: ClientAccount) => {
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, portalStatus: true, portalLastLogin: 'Just now' } : c));
    showToast(`🔗 Portal invitation sent to ${client.name}! Access activated.`, '🚀');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[920px] bg-[#090e14] border border-emerald-500/40 rounded-2xl shadow-[0_0_80px_rgba(16,185,129,0.25)] flex flex-col overflow-hidden text-slate-200 font-sans">

        {/* Dynamic Notification Toast */}
        {notification && (
          <div className="fixed top-6 right-8 z-[80] px-4 py-2.5 bg-emerald-950/95 border border-emerald-500 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] text-emerald-200 text-xs font-bold font-mono animate-in fade-in slide-in-from-top-2 flex items-center gap-2.5">
            <span className="text-base">{notification.icon}</span>
            <span>{notification.message}</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TOP HEADER BAR
            ════════════════════════════════════════════════════════════════════ */}
        <div className="px-6 py-3.5 bg-[#0f1722] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-slate-100 tracking-wider font-mono uppercase">
                  CLIENT MANAGEMENT — <span className="text-emerald-400 font-bold">INTERNAL CONTROL PANEL</span>
                </h1>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                <span>📅 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="text-slate-600">•</span>
                <span>⏰ {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold">Live CRM & Invoicing</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono bg-[#14202e] px-3.5 py-1.5 rounded-xl border border-emerald-900/50 text-slate-300">
              <span>👥 Active Clients: <strong className="text-emerald-400">{clients.length}</strong></span>
              <span className="text-slate-600">|</span>
              <span>💰 Total Revenue: <strong className="text-amber-400">${totalRevenue.toLocaleString()}</strong></span>
              <span className="text-slate-600">|</span>
              <span>📊 Avg Rating: <strong className="text-cyan-300">{avgRating}/5.0</strong></span>
              <span className="text-slate-600">|</span>
              <span>🔄 Portal Clients: <strong className="text-purple-300">{portalActiveCount}/{clients.length}</strong></span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            MAIN VIEW vs DETAIL VIEW
            ════════════════════════════════════════════════════════════════════ */}
        {selectedClient ? (
          /* ──────────────────────────────────────────────────────────────────
             📋 CLIENT DETAIL PAGE (INTERNAL)
             ────────────────────────────────────────────────────────────────── */
          <div className="p-6 overflow-y-auto flex-1 bg-[#060a0f] space-y-4 animate-in fade-in">
            {/* Detail Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0d1520] border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1"
                >
                  <span>🔙</span> Back to Clients
                </button>
                <h2 className="text-sm font-black text-emerald-400 font-mono">
                  🤝 CLIENT DETAIL — {selectedClient.name}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => showToast(`📧 Opening mail client to ${selectedClient.email}`, '📩')}
                  className="px-3 py-1.5 bg-[#14202e] hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  <span>📧</span> Email
                </button>
                <button
                  onClick={() => showToast(`📞 Dialing ${selectedClient.phone}...`, '📱')}
                  className="px-3 py-1.5 bg-[#14202e] hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  <span>📞</span> Call
                </button>
                <button
                  onClick={() => setActiveModal('openPortal')}
                  className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 rounded-lg font-bold flex items-center gap-1"
                >
                  <span>🔗</span> Open Portal
                </button>
              </div>
            </div>

            {/* Row 1: Client Info + Portal Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* 📋 CLIENT INFO (Left 6 cols) */}
              <div className="lg:col-span-6 bg-[#0d1520] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                    <span>📋</span> CLIENT INFO
                  </h3>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Name:</span>
                      <span className="text-slate-100 font-bold">{selectedClient.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-slate-300">{selectedClient.location}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Website:</span>
                      <span className="text-cyan-400 underline">{selectedClient.website}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-slate-300">{selectedClient.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Phone:</span>
                      <span className="text-slate-300">{selectedClient.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Industry:</span>
                      <span className="text-amber-300">{selectedClient.industry}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Contact:</span>
                      <span className="text-slate-300 font-bold">{selectedClient.contactPerson}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex gap-2 mt-3">
                  <button
                    onClick={() => setActiveModal('addCommNote')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded-lg text-slate-200"
                  >
                    📝 Add Note
                  </button>
                  <button
                    onClick={() => showToast('🔔 Meeting reminder scheduled for tomorrow 10 AM', '📅')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded-lg text-slate-200"
                  >
                    🔔 Set Reminder
                  </button>
                </div>
              </div>

              {/* 🔄 PORTAL MANAGEMENT (Right 6 cols) */}
              <div className="lg:col-span-6 bg-[#0d1520] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                    <span>🔄</span> PORTAL MANAGEMENT
                  </h3>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Portal Status:</span>
                      <span className={`font-bold ${selectedClient.portalStatus ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selectedClient.portalStatus ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Invite Sent:</span>
                      <span className="text-slate-300">{selectedClient.inviteSentDate}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Accepted:</span>
                      <span className="text-slate-300">{selectedClient.inviteAcceptedDate}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Last Login:</span>
                      <span className="text-emerald-300 font-bold">{selectedClient.portalLastLogin}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Projects Viewed:</span>
                      <span className="text-cyan-300">{selectedClient.projectsViewed} Projects</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Messages Sent:</span>
                      <span className="text-purple-300">{selectedClient.messagesCount} Messages</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Invoices Viewed:</span>
                      <span className="text-amber-300 font-bold">{selectedClient.invoicesViewed} Invoices</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex gap-2 mt-3">
                  <button
                    onClick={() => setActiveModal('openPortal')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono rounded-lg"
                  >
                    🔗 Open Portal
                  </button>
                  <button
                    onClick={() => setActiveModal('portalSettings')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded-lg text-slate-200"
                  >
                    ⚙️ Portal Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Communication History */}
            <div className="bg-[#0d1520] border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider flex items-center gap-1.5">
                  <span>📝</span> COMMUNICATION HISTORY
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Real-time sync with Client Portal</span>
              </div>

              <div className="space-y-2 mb-3">
                {commHistory.map(item => (
                  <div key={item.id} className="p-2.5 bg-[#080d14] rounded-lg border border-slate-800 flex items-start gap-3 text-xs font-mono">
                    <span className="text-slate-400 shrink-0">📅 {item.date}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      item.type === 'email' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50' :
                      item.type === 'call' ? 'bg-amber-950 text-amber-300 border border-amber-700/50' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                    }`}>
                      [{item.type.toUpperCase()}]
                    </span>
                    <span className="text-slate-200">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setActiveModal('addCommNote')}
                  className="px-3 py-1.5 bg-[#14202e] hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg"
                >
                  ➕ Add Note
                </button>
                <button
                  onClick={() => showToast(`💬 Portal chat opened with ${selectedClient.name}`, '💬')}
                  className="px-3 py-1.5 bg-[#14202e] hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg"
                >
                  💬 Send Message
                </button>
                <button
                  onClick={() => showToast(`📧 Composing email to ${selectedClient.email}`, '📩')}
                  className="px-3 py-1.5 bg-[#14202e] hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg"
                >
                  📧 Send Email
                </button>
                <button
                  onClick={() => showToast('📎 File attached: contract_v2_signed.pdf', '📎')}
                  className="px-3 py-1.5 bg-[#14202e] hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg"
                >
                  📎 Attach File
                </button>
              </div>
            </div>

            {/* Row 3: Invoice History + Project History */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Invoice History */}
              <div className="lg:col-span-6 bg-[#0d1520] border border-slate-800 rounded-2xl p-4">
                <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <span>💳</span> INVOICE HISTORY
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  {invoices.filter(i => i.clientName.toLowerCase() === selectedClient.name.toLowerCase()).length === 0 ? (
                    <div className="p-4 bg-[#080d14] rounded border border-slate-800 text-center text-slate-500 italic">
                      No invoices recorded for {selectedClient.name}.
                    </div>
                  ) : (
                    invoices.filter(i => i.clientName.toLowerCase() === selectedClient.name.toLowerCase()).map(inv => (
                      <div key={inv.id} className="flex justify-between p-2 bg-[#080d14] rounded border border-slate-800">
                        <span className="text-slate-300 font-bold">{inv.invoiceNumber}</span>
                        <span className="text-amber-400 font-bold">${inv.amount.toLocaleString()}</span>
                        <span className="text-slate-400">Due {inv.dueDate}</span>
                        <span className={`font-bold ${inv.status === 'paid' ? 'text-emerald-400' : 'text-amber-300'}`}>
                          {inv.status === 'paid' ? '✅ Paid' : '⏳ ' + inv.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Project History */}
              <div className="lg:col-span-6 bg-[#0d1520] border border-slate-800 rounded-2xl p-4">
                <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <span>📊</span> PROJECT HISTORY
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  {agency.projects.filter(p => p.clientName.toLowerCase() === selectedClient.name.toLowerCase()).length === 0 ? (
                    <div className="p-4 bg-[#080d14] rounded border border-slate-800 text-center text-slate-500 italic">
                      No active project history found for {selectedClient.name}.
                    </div>
                  ) : (
                    agency.projects.filter(p => p.clientName.toLowerCase() === selectedClient.name.toLowerCase()).map(p => (
                      <div key={p.id} className="flex justify-between p-2 bg-[#080d14] rounded border border-slate-800">
                        <span className="text-slate-300 font-bold">{p.name}</span>
                        <span className="text-amber-400 font-bold">${p.value.toLocaleString()}</span>
                        <span className="text-slate-400 uppercase">{p.phase}</span>
                        <span className={`font-bold ${p.phase === 'completed' ? 'text-emerald-400' : 'text-cyan-300'}`}>
                          {p.phase === 'completed' ? '✅ Shipped' : '⚡ In Progress'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ──────────────────────────────────────────────────────────────────
             MAIN CLIENT MANAGEMENT CONTROL PANEL
             ────────────────────────────────────────────────────────────────── */
          <div className="p-5 overflow-y-auto flex-1 bg-[#060a0f] space-y-4">

            {/* ────────────────────────────────────────────────────────────────
                SECTION 2: 🔍 SEARCH & FILTERS
                ──────────────────────────────────────────────────────────────── */}
            <div className="p-3.5 bg-[#0d1520] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-1 min-w-[240px] items-center gap-2 bg-[#060a0f] border border-slate-700/80 rounded-xl px-3 py-1.5">
                <span>🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search clients by name, location, or industry..."
                  className="bg-transparent border-none outline-none text-xs font-mono text-slate-200 w-full placeholder-slate-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                {/* Project Filter */}
                <select
                  value={projectFilter}
                  onChange={e => setProjectFilter(e.target.value as any)}
                  className="bg-[#14202e] border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 outline-none"
                >
                  <option value="all">All Projects ▼</option>
                  <option value="tcg">TCG Websites</option>
                  <option value="ecom">E-Commerce</option>
                  <option value="saas">SaaS Apps</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="bg-[#14202e] border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 outline-none"
                >
                  <option value="all">Status: All ▼</option>
                  <option value="active">Active Only</option>
                  <option value="in_progress">In Progress Only</option>
                  <option value="discovery">Discovery Only</option>
                </select>

                {/* Portal Status Filter */}
                <select
                  value={portalFilter}
                  onChange={e => setPortalFilter(e.target.value as any)}
                  className="bg-[#14202e] border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 outline-none"
                >
                  <option value="all">Portal: All ▼</option>
                  <option value="active">Portal Active ✅</option>
                  <option value="inactive">Portal Inactive ❌</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value as any)}
                  className="bg-[#14202e] border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 outline-none"
                >
                  <option value="all">Priority: All ▼</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────────────
                SECTION 3: 📊 CLIENT OVERVIEW (6 KPI Cards)
                ──────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 bg-[#0d1522] border border-slate-800 rounded-2xl">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                  <span>💰</span> Revenue
                </span>
                <div className="text-base font-black text-emerald-400 font-mono mt-1">${totalRevenue.toLocaleString()}</div>
                <span className="text-[10px] text-emerald-500 font-mono font-bold">{totalRevenue > 0 ? '▲ Active Accounts' : 'Fresh Slate'}</span>
              </div>

              <div className="p-3.5 bg-[#0d1522] border border-slate-800 rounded-2xl">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                  <span>📋</span> Active
                </span>
                <div className="text-base font-black text-cyan-300 font-mono mt-1">Projects {agency.projects.filter(p => p.phase !== 'completed').length}</div>
                <span className="text-[10px] text-slate-400 font-mono">100% On-Track</span>
              </div>

              <div className="p-3.5 bg-[#0d1522] border border-slate-800 rounded-2xl">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                  <span>⏳</span> Pending
                </span>
                <div className="text-base font-black text-amber-400 font-mono mt-1">Invoices {pendingInvoices.length}</div>
                <span className="text-[10px] text-amber-500 font-mono font-bold">${pendingTotal.toLocaleString()} Expected</span>
              </div>

              <div className="p-3.5 bg-[#0d1522] border border-slate-800 rounded-2xl">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                  <span>✅</span> Projects
                </span>
                <div className="text-base font-black text-purple-300 font-mono mt-1">Completed {agency.projects.filter(p => p.phase === 'completed').length}</div>
                <span className="text-[10px] text-purple-400 font-mono">100% Delivered</span>
              </div>

              <div className="p-3.5 bg-[#0d1522] border border-slate-800 rounded-2xl">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                  <span>⭐</span> Avg Rating
                </span>
                <div className="text-base font-black text-amber-300 font-mono mt-1">Rating {clients.filter(c => c.rating !== null).length > 0 ? avgRating : 'N/A'}</div>
                <span className="text-[10px] text-slate-400 font-mono">/ 5.0 Global NPS</span>
              </div>

              <div className="p-3.5 bg-[#0d1522] border border-slate-800 rounded-2xl">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                  <span>🔄</span> Portal
                </span>
                <div className="text-base font-black text-emerald-300 font-mono mt-1">Active {portalActiveCount}</div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Clients Synced</span>
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────────────
                SECTION 4: 👥 CLIENT LIST (Main Table / Interactive Cards)
                ──────────────────────────────────────────────────────────────── */}
            <div className="bg-[#0d1522] border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider flex items-center gap-1.5">
                  <span>👥</span> CLIENT LIST ({filteredClients.length} Accounts)
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Click any client row or [📋 View] for complete profile</span>
              </div>

              <div className="space-y-3">
                {filteredClients.length === 0 ? (
                  <div className="p-10 bg-[#080d14] rounded-xl border border-slate-800 text-center space-y-2">
                    <span className="text-2xl block">🤝</span>
                    <strong className="text-sm text-slate-200 block">No Client Accounts in Pipeline</strong>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Your client relationship database is fresh. Click "+ Add New Client" below to register your first client account, or convert an inquiry from the Reception Board!
                    </p>
                  </div>
                ) : (
                  filteredClients.map(client => {
                    const statusMap = {
                      active: { label: '🟢 Active', col: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50' },
                      in_progress: { label: '🟡 In Progress', col: 'text-amber-300 bg-amber-950/60 border-amber-700/50' },
                      discovery: { label: '🔵 Discovery', col: 'text-cyan-300 bg-cyan-950/60 border-cyan-700/50' },
                    };

                    return (
                      <div
                        key={client.id}
                        className="p-3.5 bg-[#080d14] rounded-xl border border-slate-800 hover:border-emerald-500/50 transition flex flex-col gap-2"
                      >
                        {/* Top Row: Name, Status, Revenue, Rating, Portal, View */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🏢</span>
                            <strong className="text-slate-100 text-sm font-black">{client.name}</strong>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusMap[client.status].col}`}>
                              {statusMap[client.status].label}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-emerald-400 font-black">💰 ${client.revenue.toLocaleString()}</span>
                            <span className="text-amber-400 font-bold">⭐ {client.rating ? `${client.rating.toFixed(1)}` : 'N/A'}</span>
                            <span className={`text-[11px] font-bold ${client.portalStatus ? 'text-emerald-400' : 'text-slate-500'}`}>
                              🔗 Portal {client.portalStatus ? '✅' : '❌'}
                            </span>
                            <button
                              onClick={() => setSelectedClient(client)}
                              className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                              <span>📋</span> View
                            </button>
                          </div>
                        </div>

                        {/* Middle Row: Location, Project, Progress, Email */}
                        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
                          <span className="flex items-center gap-1">📍 {client.location}</span>
                          <span className="flex items-center gap-1 text-cyan-300">📊 {client.projectType}</span>
                          <span className="text-emerald-300 font-bold">
                            {client.progressPct === 100 ? '✅ 100% Done' : client.progressPct > 0 ? `⏳ ${client.progressPct}% Done` : '📝 Proposal'}
                          </span>
                          <span className="text-slate-400">📧 {client.email}</span>
                        </div>

                        {/* Bottom Row: Next Meeting & Last Activity */}
                        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                          <span className="text-amber-300 font-medium">📅 Next: {client.nextMeeting}</span>
                          <span>🕐 Last Activity: {client.lastActivity}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 mt-3 text-xs font-mono font-bold">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModal('addClient')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    <span>➕</span> Add New Client
                  </button>
                  <button
                    onClick={() => showToast('📤 Exported client registry to CSV / Excel!', '📊')}
                    className="px-3.5 py-2 bg-[#14202e] hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition flex items-center gap-1.5"
                  >
                    <span>📤</span> Export List
                  </button>
                </div>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setPortalFilter('all');
                    setProjectFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  📊 View All
                </button>
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────────────
                ROW 2: DEADLINES & MEETINGS + CLIENT INSIGHTS
                ──────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* 📋 UPCOMING DEADLINES & MEETINGS (Left 7 cols) */}
              <div className="lg:col-span-7 bg-[#0d1520] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                    <span>📋</span> UPCOMING DEADLINES & MEETINGS
                  </h3>

                  <div className="space-y-2 text-xs font-mono">
                    {deadlines.length === 0 ? (
                      <div className="p-6 bg-[#080d14] rounded-xl border border-slate-800 text-center text-slate-500 italic">
                        No upcoming meetings or calls scheduled. Click "+ Add Event" to add a client appointment!
                      </div>
                    ) : (
                      deadlines.map(item => (
                        <div key={item.id} className="p-2.5 bg-[#080d14] rounded-xl border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span>{item.priority === 'red' ? '🔴' : item.priority === 'yellow' ? '🟡' : '🟢'}</span>
                            <strong className="text-slate-300">{item.timeLabel}</strong>
                            <span className="text-slate-400">— {item.title}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                            {item.clientName}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-800 mt-3 text-xs font-mono">
                  <button
                    onClick={() => showToast('📅 Google Calendar / Outlook sync active', '🗓️')}
                    className="px-3 py-1.5 bg-[#14202e] hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg"
                  >
                    📅 View Calendar
                  </button>
                  <button
                    onClick={() => setActiveModal('addEvent')}
                    className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 rounded-lg font-bold"
                  >
                    ➕ Add Event
                  </button>
                </div>
              </div>

              {/* 📊 CLIENT INSIGHTS (Right 5 cols) */}
              <div className="lg:col-span-5 bg-[#0d1522] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                    <span>📊</span> CLIENT INSIGHTS
                  </h3>

                  <div className="space-y-2.5 text-xs font-mono mb-3">
                    <span className="text-slate-400 font-bold block">📈 Revenue by Client:</span>
                    <div className="p-2.5 bg-[#080d14] rounded-xl border border-slate-800 space-y-1.5">
                      {totalRevenue === 0 || clients.length === 0 ? (
                        <div className="text-center py-3 text-slate-500 italic text-[11px]">
                          No client revenue recorded yet.
                        </div>
                      ) : (
                        clients.slice(0, 4).map(c => {
                          const pct = totalRevenue > 0 ? Math.round((c.revenue / totalRevenue) * 100) : 0;
                          const barCount = Math.round(pct / 10);
                          const bar = '█'.repeat(barCount) + '░'.repeat(Math.max(0, 10 - barCount));
                          return (
                            <div key={c.id} className="flex justify-between text-[11px]">
                              <span className="truncate max-w-[140px]">{c.name}</span>
                              <span className="text-emerald-400 font-bold font-mono">{bar} {pct}%</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-mono pt-2 border-t border-slate-800 text-slate-400">
                  <div className="flex justify-between">
                    <span>⚠️ At Risk Clients:</span>
                    <strong className="text-emerald-400 font-bold">0 Accounts</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>📊 Avg Response Time:</span>
                    <strong className="text-cyan-300 font-bold">Fast (&lt; 2h)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>🔄 Active Projects:</span>
                    <strong className="text-purple-300 font-bold">{agency.projects.filter(p => p.phase !== 'completed').length} in flight</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────────────
                SECTION 7: 💳 INVOICE & PAYMENT STATUS
                ──────────────────────────────────────────────────────────────── */}
            <div className="bg-[#0d1522] border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider flex items-center gap-1.5">
                  <span>💳</span> INVOICE & PAYMENT STATUS
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Stripe & Bank Wire Tracker</span>
              </div>

              {/* 5 KPI Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-3 font-mono text-xs">
                <div className="p-2.5 bg-[#080d14] rounded-xl border border-emerald-600/40">
                  <span className="text-emerald-400 font-bold block">✅ Paid</span>
                  <strong className="text-emerald-300 text-sm">${paidTotal.toLocaleString()}</strong>
                  <span className="text-[10px] text-slate-500 block">{paidInvoices.length} Invoices</span>
                </div>
                <div className="p-2.5 bg-[#080d14] rounded-xl border border-amber-600/40">
                  <span className="text-amber-400 font-bold block">⏳ Pending</span>
                  <strong className="text-amber-300 text-sm">${pendingTotal.toLocaleString()}</strong>
                  <span className="text-[10px] text-slate-500 block">{pendingInvoices.length} Invoices</span>
                </div>
                <div className="p-2.5 bg-[#080d14] rounded-xl border border-blue-600/40">
                  <span className="text-blue-400 font-bold block">📝 Draft</span>
                  <strong className="text-blue-300 text-sm">${draftTotal.toLocaleString()}</strong>
                  <span className="text-[10px] text-slate-500 block">{draftInvoices.length} Invoice</span>
                </div>
                <div className="p-2.5 bg-[#080d14] rounded-xl border border-rose-600/40">
                  <span className="text-rose-400 font-bold block">🔴 Overdue</span>
                  <strong className="text-rose-300 text-sm">${overdueTotal.toLocaleString()}</strong>
                  <span className="text-[10px] text-slate-500 block">{overdueInvoices.length} Invoices</span>
                </div>
                <div className="p-2.5 bg-[#080d14] rounded-xl border border-slate-700">
                  <span className="text-slate-400 font-bold block">💰 Total</span>
                  <strong className="text-slate-100 text-sm">${allInvoicesTotal.toLocaleString()}</strong>
                  <span className="text-[10px] text-slate-500 block">{invoices.length} Invoices</span>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="space-y-1.5 text-xs font-mono">
                {invoices.length === 0 ? (
                  <div className="p-6 bg-[#080d14] rounded-lg border border-slate-800 text-center text-slate-500 italic">
                    No client invoices created yet. Click "+ Create Invoice" below to issue your first invoice!
                  </div>
                ) : (
                  invoices.slice(0, 4).map(inv => (
                  <div key={inv.id} className="p-2.5 bg-[#080d14] rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <strong className="text-slate-200 w-28">{inv.clientName}</strong>
                      <span className="text-slate-500">{inv.invoiceNumber}</span>
                      <span className="text-emerald-400 font-bold">${inv.amount.toLocaleString()}</span>
                      <span className="text-slate-400">Due {inv.dueDate}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'paid' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' :
                        inv.status === 'pending' ? 'bg-amber-950 text-amber-300 border border-amber-700/50' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {inv.status === 'paid' ? '✅ Paid' : inv.status === 'pending' ? '⏳ Pending' : '📝 Draft'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast(`📄 Viewing invoice ${inv.invoiceNumber} for ${inv.clientName}`, '📄')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                      >
                        📄 View
                      </button>
                      {inv.status !== 'paid' && (
                        <>
                          <button
                            onClick={() => handleMarkInvoicePaid(inv.id)}
                            className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 rounded text-[11px] font-bold"
                          >
                            💳 Pay
                          </button>
                          <button
                            onClick={() => handleSendReminder(inv.clientName)}
                            className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-600/50 text-amber-300 rounded text-[11px]"
                          >
                            📧 Remind
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )))}
              </div>

              {/* Invoice Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800 mt-3 text-xs font-mono font-bold">
                <button
                  onClick={() => setActiveModal('createInvoice')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                >
                  💰 Create Invoice
                </button>
                <button
                  onClick={() => showToast('📊 Complete invoice archive loaded', '📈')}
                  className="px-3.5 py-2 bg-[#14202e] hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl"
                >
                  📊 View All Invoices
                </button>
                <button
                  onClick={() => showToast('📧 Payment reminders dispatched to all pending clients!', '📩')}
                  className="px-3.5 py-2 bg-[#14202e] hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl"
                >
                  📧 Send Reminders
                </button>
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────────────
                SECTION 8: 🔄 PORTAL MANAGEMENT (Internal Only)
                ──────────────────────────────────────────────────────────────── */}
            <div className="bg-[#0d1520] border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider flex items-center gap-1.5">
                  <span>🔄</span> PORTAL MANAGEMENT (Internal Access Hub)
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Client Self-Service Dashboard Administration</span>
              </div>

              {/* 5 Portal Action Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-3 font-mono text-xs">
                <div className="p-2.5 bg-[#080d14] rounded-xl border border-emerald-600/40">
                  <span className="text-emerald-400 font-bold block">🔗 Active</span>
                  <strong className="text-emerald-300 text-sm">Clients: {portalActiveCount}</strong>
                </div>
                <div className="p-2.5 bg-[#080d14] rounded-xl border border-amber-600/40">
                  <span className="text-amber-400 font-bold block">📧 Invites</span>
                  <strong className="text-amber-300 text-sm">Pending: {clients.filter(c => !c.portalStatus).length}</strong>
                </div>
                <div className="p-2.5 bg-[#080d14] rounded-xl border border-blue-600/40">
                  <span className="text-blue-400 font-bold block">🔒 Permissions</span>
                  <strong className="text-blue-300 text-sm">Manage</strong>
                </div>
                <div className="p-2.5 bg-[#080d14] rounded-xl border border-purple-600/40">
                  <span className="text-purple-400 font-bold block">📊 Analytics</span>
                  <strong className="text-purple-300 text-sm">View Portal</strong>
                </div>
                <div className="p-2.5 bg-[#080d14] rounded-xl border border-slate-700">
                  <span className="text-slate-400 font-bold block">⚙️ Settings</span>
                  <strong className="text-slate-300 text-sm">Configure</strong>
                </div>
              </div>

              {/* Portal Access Table */}
              <div className="space-y-1.5 text-xs font-mono">
                {clients.length === 0 ? (
                  <div className="p-6 bg-[#080d14] rounded-lg border border-slate-800 text-center text-slate-500 italic">
                    No client portal accounts registered yet.
                  </div>
                ) : (
                  clients.map(c => (
                  <div key={c.id} className="p-2.5 bg-[#080d14] rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <strong className="text-slate-200 w-28">{c.name}</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.portalStatus ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                        {c.portalStatus ? '✅ Active' : '❌ Inactive'}
                      </span>
                      <span className="text-slate-400">{c.portalLastLogin}</span>
                      <span className="text-cyan-300">{c.projectsViewed} Projects</span>
                      <span className="text-purple-300">{c.messagesCount} Messages</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.portalStatus ? (
                        <button
                          onClick={() => {
                            setSelectedClient(c);
                            setActiveModal('openPortal');
                          }}
                          className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 rounded text-[11px] font-bold"
                        >
                          🔗 Open
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendPortalInvite(c)}
                          className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 rounded text-[11px] font-bold"
                        >
                          📧 Invite
                        </button>
                      )}
                      <button
                        onClick={() => setActiveModal('portalSettings')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                      >
                        ⚙️ Settings
                      </button>
                    </div>
                  </div>
                )))}
              </div>

              {/* Portal Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800 mt-3 text-xs font-mono font-bold">
                <button
                  onClick={() => setActiveModal('sendInvite')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                >
                  📧 Send Invite
                </button>
                <button
                  onClick={() => setActiveModal('openPortal')}
                  className="px-3.5 py-2 bg-[#14202e] hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl"
                >
                  🔗 Open Portal
                </button>
                <button
                  onClick={() => showToast('📊 Portal engagement analytics: 47 total logins this month', '📈')}
                  className="px-3.5 py-2 bg-[#14202e] hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl"
                >
                  📊 View Analytics
                </button>
                <button
                  onClick={() => setActiveModal('portalSettings')}
                  className="px-3.5 py-2 bg-[#14202e] hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl"
                >
                  ⚙️ Portal Settings
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            INTERACTIVE MODAL POPUPS
            ════════════════════════════════════════════════════════════════════ */}
        {activeModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-[#0e1622] border border-emerald-500/50 rounded-2xl p-6 shadow-2xl text-slate-200 font-mono">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-sm font-black text-emerald-300 tracking-wide uppercase">
                  {activeModal === 'addClient' && '➕ Add New Client Account'}
                  {activeModal === 'createInvoice' && '💰 Create Client Invoice'}
                  {activeModal === 'addEvent' && '📅 Schedule Deadline or Meeting'}
                  {activeModal === 'sendInvite' && '📧 Send Client Portal Invitation'}
                  {activeModal === 'openPortal' && '🔗 Client Portal Preview (Live)'}
                  {activeModal === 'portalSettings' && '⚙️ Client Portal Configuration'}
                  {activeModal === 'addCommNote' && '📝 Add Communication Note'}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body: Add Client */}
              {activeModal === 'addClient' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Company / Client Name:</label>
                    <input
                      type="text"
                      value={newClientForm.name}
                      onChange={e => setNewClientForm({ ...newClientForm, name: e.target.value })}
                      placeholder="e.g. Apex Card Vault Ltd."
                      className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Location:</label>
                      <input
                        type="text"
                        value={newClientForm.location}
                        onChange={e => setNewClientForm({ ...newClientForm, location: e.target.value })}
                        className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Industry:</label>
                      <input
                        type="text"
                        value={newClientForm.industry}
                        onChange={e => setNewClientForm({ ...newClientForm, industry: e.target.value })}
                        className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Email:</label>
                      <input
                        type="email"
                        value={newClientForm.email}
                        onChange={e => setNewClientForm({ ...newClientForm, email: e.target.value })}
                        placeholder="contact@client.com"
                        className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Contract Budget:</label>
                      <input
                        type="text"
                        value={newClientForm.budget}
                        onChange={e => setNewClientForm({ ...newClientForm, budget: e.target.value })}
                        className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newClientForm.name) return;
                        const created: ClientAccount = {
                          id: `cli-${Date.now()}`,
                          name: newClientForm.name,
                          location: newClientForm.location,
                          website: 'clientwebsite.com',
                          email: newClientForm.email || 'client@company.com',
                          phone: '+1 (555) 000-1122',
                          contactPerson: 'Lead Executive',
                          industry: newClientForm.industry,
                          status: 'discovery',
                          revenue: parseInt(newClientForm.budget.replace(/[^0-9]/g, '')) || 10000,
                          rating: null,
                          portalStatus: false,
                          projectType: 'Initial Architecture Discovery',
                          progressPct: 10,
                          nextMeeting: 'Kick-off Call - Next Week',
                          lastActivity: 'Just now',
                          portalLastLogin: 'Never',
                          projectsViewed: 0,
                          messagesCount: 0,
                          filesDownloaded: 0,
                          invoicesViewed: 0,
                          inviteSentDate: new Date().toLocaleDateString(),
                          inviteAcceptedDate: 'Pending',
                          notes: ['New inbound client record created.'],
                        };
                        setClients(prev => [created, ...prev]);
                        showToast(`Client account "${created.name}" created!`, '🏢');
                        setActiveModal(null);
                        setNewClientForm({ name: '', location: 'Remote', email: '', phone: '', contactPerson: '', industry: 'E-Commerce', budget: '$10,000', status: 'discovery' });
                        onRefresh();
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                    >
                      Create Client
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Body: Create Invoice */}
              {activeModal === 'createInvoice' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Select Client:</label>
                    <select
                      value={newInvoiceForm.clientName}
                      onChange={e => setNewInvoiceForm({ ...newInvoiceForm, clientName: e.target.value })}
                      className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200"
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Invoice Amount ($):</label>
                      <input
                        type="text"
                        value={newInvoiceForm.amount}
                        onChange={e => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                        className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Due Date:</label>
                      <input
                        type="text"
                        value={newInvoiceForm.dueDate}
                        onChange={e => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                        className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const amt = parseInt(newInvoiceForm.amount.replace(/[^0-9]/g, '')) || 3000;
                        const created: InvoiceItem = {
                          id: `inv-${Date.now()}`,
                          invoiceNumber: `INV-00${invoices.length + 1}`,
                          clientName: newInvoiceForm.clientName,
                          amount: amt,
                          dueDate: newInvoiceForm.dueDate,
                          status: 'pending'
                        };
                        setInvoices(prev => [created, ...prev]);
                        showToast(`Invoice ${created.invoiceNumber} ($${amt.toLocaleString()}) created for ${created.clientName}!`, '💳');
                        setActiveModal(null);
                        onRefresh();
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                    >
                      Issue Invoice
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Body: Add Event */}
              {activeModal === 'addEvent' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Event / Meeting Title:</label>
                    <input
                      type="text"
                      value={newEventForm.title}
                      onChange={e => setNewEventForm({ ...newEventForm, title: e.target.value })}
                      placeholder="e.g. Scope Approval Call"
                      className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Client:</label>
                      <select
                        value={newEventForm.clientName}
                        onChange={e => setNewEventForm({ ...newEventForm, clientName: e.target.value })}
                        className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200"
                      >
                        {clients.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Date & Time:</label>
                      <input
                        type="text"
                        value={newEventForm.timeLabel}
                        onChange={e => setNewEventForm({ ...newEventForm, timeLabel: e.target.value })}
                        className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newEventForm.title) return;
                        const created: DeadlineMeetingItem = {
                          id: `dl-${Date.now()}`,
                          priority: newEventForm.priority,
                          timeLabel: newEventForm.timeLabel,
                          title: newEventForm.title,
                          clientName: newEventForm.clientName
                        };
                        setDeadlines(prev => [created, ...prev]);
                        showToast(`Event "${created.title}" scheduled!`, '📅');
                        setActiveModal(null);
                        setNewEventForm({ title: '', clientName: clients[0]?.name || 'Client', timeLabel: 'Next Mon, 11 AM', priority: 'yellow' });
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                    >
                      Schedule Event
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Body: Open Portal Live Preview */}
              {activeModal === 'openPortal' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#080d14] rounded-xl border border-emerald-500/40 text-slate-300 space-y-2">
                    <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-1">
                      <span>🔗 CLIENT SELF-SERVICE PORTAL</span>
                      <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded">AUTHENTICATED</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Viewing secure client interface for: <strong className="text-slate-100">{selectedClient?.name || clients[0]?.name || 'Active Client'}</strong>
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                      <div className="p-2 bg-[#0d1520] rounded border border-slate-800">
                        <strong className="block text-cyan-300">
                          {selectedClient ? agency.tasks.filter(t => t.projectId && agency.projects.find(p => p.id === t.projectId)?.clientName.toLowerCase() === selectedClient.name.toLowerCase()).length : 0}
                        </strong> Deliverables
                      </div>
                      <div className="p-2 bg-[#0d1520] rounded border border-slate-800">
                        <strong className="block text-emerald-300">
                          ${selectedClient ? invoices.filter(i => i.clientName.toLowerCase() === selectedClient.name.toLowerCase() && i.status === 'pending').reduce((s, i) => s + i.amount, 0).toLocaleString() : '0'}
                        </strong> Due Balance
                      </div>
                      <div className="p-2 bg-[#0d1520] rounded border border-slate-800">
                        <strong className="block text-amber-300">
                          {selectedClient ? `${selectedClient.progressPct}%` : '0%'}
                        </strong> Progress
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Body: Send Invite */}
              {activeModal === 'sendInvite' && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-400">Send an instant encrypted portal access link:</p>
                  <div>
                    <label className="block text-slate-400 mb-1">Recipient Email:</label>
                    <input
                      type="email"
                      defaultValue="owner@tcgshop.com"
                      className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        showToast('📧 Portal invitation link emailed to client!', '🚀');
                        setActiveModal(null);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                    >
                      Send Invite
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Body: Portal Settings */}
              {activeModal === 'portalSettings' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2 bg-[#080d14] rounded">
                    <span>Allow Client to View Unreleased Tasks</span>
                    <span className="text-rose-400 font-bold">DISABLED</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#080d14] rounded">
                    <span>Stripe Instant Invoice Payment Gateway</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#080d14] rounded">
                    <span>Direct Chat with Engineering Lead</span>
                    <span className="text-emerald-400 font-bold">ENABLED</span>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        showToast('⚙️ Portal security & permission settings updated', '✅');
                        setActiveModal(null);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Body: Add Comm Note */}
              {activeModal === 'addCommNote' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Communication / Meeting Summary:</label>
                    <textarea
                      rows={3}
                      value={newCommNoteText}
                      onChange={e => setNewCommNoteText(e.target.value)}
                      placeholder="e.g. Call with client: confirmed scope and timeline."
                      className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newCommNoteText.trim()) return;
                        const created: CommLogItem = {
                          id: `comm-${Date.now()}`,
                          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                          type: 'note',
                          text: newCommNoteText.trim()
                        };
                        setCommHistory(prev => [created, ...prev]);
                        showToast('📝 Communication note logged to client record!', '✅');
                        setActiveModal(null);
                        setNewCommNoteText('');
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
