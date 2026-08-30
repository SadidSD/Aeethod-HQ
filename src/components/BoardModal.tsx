import { useState, useEffect } from 'react';
import { AgencyState, Lead, LeadStatus, ProjectPackage } from '../core/agencyTypes';
import AgencyManager from '../core/agency';
import ContentManagementRoom from './ContentManagementRoom';
import MeetingPlanningRoom from './MeetingPlanningRoom';

interface BoardModalProps {
  boardType: 'leads' | 'architecture' | 'content';
  agency: AgencyState;
  manager: AgencyManager;
  onClose: () => void;
  onRefresh: () => void;
}

export default function BoardModal({ boardType, agency, manager, onClose, onRefresh }: BoardModalProps) {
  if (boardType === 'content') {
    return (
      <ContentManagementRoom
        agency={agency}
        manager={manager}
        onClose={onClose}
        onRefresh={onRefresh}
      />
    );
  }

  if (boardType === 'architecture') {
    return (
      <MeetingPlanningRoom
        agency={agency}
        manager={manager}
        onClose={onClose}
        onRefresh={onRefresh}
      />
    );
  }
  // Leads board form
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadIndustry, setLeadIndustry] = useState('TCG');
  const [leadPkg, setLeadPkg] = useState<ProjectPackage>('enterprise');
  const [leadValue, setLeadValue] = useState(10000);
  const [leadNotes, setLeadNotes] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCompany.trim()) return;

    manager.addLead({
      name: leadName || 'Contact Lead',
      company: leadCompany,
      industry: leadIndustry,
      source: 'website',
      packageInterest: leadPkg,
      estimatedValue: leadValue,
      status: 'new' as LeadStatus,
      notes: leadNotes
    });

    setShowLeadForm(false);
    setLeadCompany('');
    setLeadName('');
    onRefresh();
  };

  const handleConvertLead = (leadId: string) => {
    manager.convertLeadToProject(leadId);
    onRefresh();
  };

  const renderLeadsBoard = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-base text-slate-200">Reception Lead Intake Board</h3>
          <p className="text-xs text-slate-400">Incoming inquiries from e-commerce stores & TCG shops</p>
        </div>
        <button
          onClick={() => setShowLeadForm(!showLeadForm)}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition"
        >
          {showLeadForm ? 'Cancel' : '+ New Inbound Lead'}
        </button>
      </div>

      {showLeadForm && (
        <form onSubmit={handleAddLead} className="bg-[#121b26] border border-cyan-500/40 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Company Name (e.g. Card Vault Pro)" className="bg-[#0b1016] border border-slate-800 rounded p-2 text-xs text-slate-200" value={leadCompany} onChange={e => setLeadCompany(e.target.value)} />
            <input placeholder="Contact Person" className="bg-[#0b1016] border border-slate-800 rounded p-2 text-xs text-slate-200" value={leadName} onChange={e => setLeadName(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Industry (e.g. TCG, Retail)" className="bg-[#0b1016] border border-slate-800 rounded p-2 text-xs text-slate-200" value={leadIndustry} onChange={e => setLeadIndustry(e.target.value)} />
            <select className="bg-[#0b1016] border border-slate-800 rounded p-2 text-xs text-slate-200" value={leadPkg} onChange={e => setLeadPkg(e.target.value as ProjectPackage)}>
              <option value="essential">Essential ($3k-$5k)</option>
              <option value="professional">Professional ($6k-$9k)</option>
              <option value="enterprise">Enterprise ($10k-$15k)</option>
            </select>
            <input type="number" placeholder="Estimated Value ($)" className="bg-[#0b1016] border border-slate-800 rounded p-2 text-xs text-slate-200" value={leadValue} onChange={e => setLeadValue(Number(e.target.value))} />
          </div>
          <input placeholder="Requirements / Inquiry Notes" className="w-full bg-[#0b1016] border border-slate-800 rounded p-2 text-xs text-slate-200" value={leadNotes} onChange={e => setLeadNotes(e.target.value)} />
          <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition">
            Register Lead into Intake Pipeline
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agency.leads.length === 0 ? (
          <div className="col-span-2 p-8 bg-[#121b26]/40 border border-slate-800/80 rounded-lg text-center text-xs text-slate-500 italic">
            No incoming inquiries on the board. Click "+ New Inbound Lead" to register a client prospect!
          </div>
        ) : (
          agency.leads.map(l => (
            <div key={l.id} className="p-4 bg-[#121b26] border border-slate-800 rounded-lg flex flex-col justify-between gap-3">
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm text-slate-100">{l.company}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${l.status === 'won' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'}`}>
                    {l.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{l.industry} • Contact: {l.name}</div>
                {l.notes && <div className="text-xs text-slate-400 bg-[#0b1016] p-2 rounded mt-2 border border-slate-800/50">{l.notes}</div>}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-cyan-400 font-mono font-bold text-sm">${l.estimatedValue.toLocaleString()}</span>
                {l.status !== 'won' && (
                  <button
                    onClick={() => handleConvertLead(l.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition"
                  >
                    Convert to Active Deal 🚀
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderArchitectureBoard = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-base text-slate-200">Plan & Meeting Room Whiteboard</h3>
        <p className="text-xs text-slate-400">System Architecture Diagrams & Aeethod Methodology Specs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#121b26] border border-slate-800 rounded-lg space-y-3">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">📐 The 5-Phase Aeethod Method</div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 p-2 bg-[#0b1016] rounded border border-slate-800">
              <span className="text-amber-400 font-bold">1.</span>
              <span><strong>Discovery:</strong> Deep audit of client inventory, buylist, and card pricing flows.</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-[#0b1016] rounded border border-slate-800">
              <span className="text-blue-400 font-bold">2.</span>
              <span><strong>Architecture:</strong> Schema design, database models, AI pricing engine spec.</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-[#0b1016] rounded border border-slate-800">
              <span className="text-cyan-400 font-bold">3.</span>
              <span><strong>Build:</strong> Next.js frontend, Laravel/Node API, TCG card sync.</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-[#0b1016] rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">4.</span>
              <span><strong>Launch:</strong> Production deployment, load testing, payment verification.</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-[#0b1016] rounded border border-slate-800">
              <span className="text-purple-400 font-bold">5.</span>
              <span><strong>Grow:</strong> Ongoing retainer, AI inventory predictor updates.</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#121b26] border border-slate-800 rounded-lg space-y-3">
          <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">📦 Active System Blueprints</div>
          {agency.projects.filter(p => p.phase !== 'completed').map(p => (
            <div key={p.id} className="p-3 bg-[#0b1016] rounded border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-slate-200">
                <span>{p.name}</span>
                <span className="text-cyan-400">${p.value.toLocaleString()}</span>
              </div>
              <div className="text-slate-400">Phase: <span className="text-amber-400 uppercase font-mono text-[10px]">{p.phase}</span> • Client: {p.clientName}</div>
              <div className="text-slate-500 font-mono text-[10px]">Stack: React/Next.js + Node.js API + PostgreSQL</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[#0c1219] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#101820] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              🛎️ Reception Lead Registry
            </span>
          </div>

          <button onClick={onClose} className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-200 rounded text-xs transition">
            ESC
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {renderLeadsBoard()}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#101820] border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Press ESC or click Done to return to office</span>
          <button onClick={onClose} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition font-medium">
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
