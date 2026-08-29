import { useState } from 'react';
import { AgencyState } from '../../core/agencyTypes';
import AgencyManager from '../../core/agency';

interface FinanceTabProps {
  agency: AgencyState;
  manager: AgencyManager;
  onRefresh?: () => void;
}

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString();
}

interface Invoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'draft';
}

interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  date: string;
  vendor: string;
}

export default function FinanceTab({ agency, manager, onRefresh }: FinanceTabProps) {
  // Financial State values based on System Rules
  const [cashBalance, setCashBalance] = useState(12000);
  const [profitPool, setProfitPool] = useState(10000);
  const [cashReserve, setCashReserve] = useState(8000);
  const cashReserveTarget = 15000;

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Monthly Salaries
  const founderSalaries = [
    { name: 'You (Founder)', role: 'CEO & Architect', salary: 1000, status: 'paid' },
    { name: 'Designer (Founder)', role: 'Creative Director', salary: 1000, status: 'paid' },
    { name: 'Frontend (Founder)', role: 'UI/UX Lead', salary: 1000, status: 'paid' },
  ];

  const employeeSalaries = [
    { name: 'Marcus Chen', role: 'Backend Engineer', salary: 1500, due: 'Mar 31', status: 'pending' },
    { name: 'Sarah Connor', role: 'Graphic Designer', salary: 1200, due: 'Mar 31', status: 'pending' },
    { name: 'Leo Vance', role: 'Operations & QA', salary: 800, due: 'Mar 31', status: 'pending' },
  ];

  const totalMonthlySalaries = 6500;
  const annualSalaries = totalMonthlySalaries * 12;

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'inv-1', client: 'RNG Gamez', amount: 2000, dueDate: '15 Mar', status: 'paid' },
    { id: 'inv-2', client: 'Perfume Shop', amount: 2500, dueDate: '20 Mar', status: 'pending' },
    { id: 'inv-3', client: 'TCG Shop', amount: 4000, dueDate: '25 Mar', status: 'pending' },
    { id: 'inv-4', client: 'New Lead Enterprise', amount: 5000, dueDate: '01 Apr', status: 'draft' },
  ]);

  const totalReceivables = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

  // Growth Fund (20% of 60,000 = 12,000)
  const totalRevenue6mo = 60000;
  const totalGrowthFund = 12000;
  const growthAllocations = [
    { category: 'Marketing & Ads', pct: '40%', amount: 4800, bar: '████████░░░░░░' },
    { category: 'Tools & Software', pct: '30%', amount: 3600, bar: '██████░░░░░░░░' },
    { category: 'Training & Skillsets', pct: '20%', amount: 2400, bar: '████░░░░░░░░░░' },
    { category: 'Operational Experiments', pct: '10%', amount: 1200, bar: '██░░░░░░░░░░░░' },
  ];

  // Project Profitability Breakdown
  const projectProfits = [
    { name: 'RNG Gamez', revenue: 10000, cost: 4000, profit: 6000, margin: '60%' },
    { name: 'Perfume Shop', revenue: 5000, cost: 2500, profit: 2500, margin: '50%' },
    { name: 'TCG Shop', revenue: 8000, cost: 4000, profit: 4000, margin: '50%' },
    { name: 'SaaS Dev Suite', revenue: 12000, cost: 6000, profit: 6000, margin: '50%' },
    { name: 'Content Marketing', revenue: 5000, cost: 3000, profit: 2000, margin: '40%' },
  ];

  // Handlers
  const handlePayPayroll = () => {
    showToast('💳 Monthly Payroll of $3,500 executed for all employees!');
    setCashBalance(prev => Math.max(0, prev - 3500));
  };

  const handleDistributeProfits = () => {
    if (profitPool <= 0) return;
    showToast('🎉 6-Month Profit Distribution executed! $5,400 paid to Founder, $1,800 each to Co-founders!');
    setProfitPool(0);
  };

  const handleCollectInvoice = (id: string, client: string, amount: number) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'paid' } : inv));
    setCashBalance(prev => prev + amount);
    showToast(`💰 Payment received from ${client}: +${formatCurrency(amount)}!`);
  };

  const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-5 space-y-5 text-slate-200 bg-[#080d14] overflow-y-auto max-h-[85vh] font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-14 right-8 z-50 px-4 py-2.5 bg-emerald-950 border border-emerald-500 rounded-lg shadow-2xl text-emerald-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
          <span>🔔</span> {notification}
        </div>
      )}

      {/* =========================================================================
          💰 HEADER: AEETHOD FINANCE CONSOLE
          ========================================================================= */}
      <div className="bg-[#0e1622] border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.1)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💰</span>
            <h1 className="text-lg font-black tracking-wider text-cyan-400 font-mono">
              AEETHOD FINANCE <span className="text-slate-500 font-normal">—</span> {agency.agency.name || 'Founder'} <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 ml-2">FINANCIAL OS</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1 font-mono">
            <span>📅 Today: {todayDate}</span>
            <span>💳 Next Payroll: <strong className="text-slate-200">8 Days</strong></span>
            <span>💰 Cash Balance: <strong className="text-emerald-400">{formatCurrency(cashBalance)}</strong></span>
            <span>🎯 Next Distribution: <strong className="text-cyan-300">92 Days</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handlePayPayroll}
            className="px-3.5 py-1.5 bg-[#172334] hover:bg-cyan-900/50 border border-cyan-600/40 rounded text-xs text-cyan-300 font-bold transition flex items-center gap-1.5"
          >
            <span>💳</span> Run Payroll
          </button>
          <button 
            onClick={() => showToast('🧾 Balance statement generated for Q1 2026!')}
            className="px-3.5 py-1.5 bg-[#172334] hover:bg-cyan-900/50 border border-cyan-600/40 rounded text-xs text-cyan-300 font-bold transition flex items-center gap-1.5"
          >
            <span>📊</span> Export Statement
          </button>
        </div>
      </div>

      {/* =========================================================================
          ROW 1: SECTION 1 (FINANCIAL SNAPSHOT) + SECTION 2 (REVENUE & EXPENSES)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Section 1: Financial Snapshot */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span>💰</span> FINANCIAL SNAPSHOT (Top Bar)
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">6-MONTH CYCLE</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">💵 Total Revenue</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(totalRevenue6mo)}</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">💸 Total Expenses</span>
              <span className="text-sm font-bold text-rose-400 font-mono">$20,000</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">💰 Net Profit</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">$10,000</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">📊 Profit Margin</span>
              <span className="text-sm font-bold text-cyan-300 font-mono">16.7%</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">💳 Cash in Bank</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(cashBalance)}</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">📋 Profit Pool</span>
              <span className="text-sm font-bold text-amber-300 font-mono">{formatCurrency(profitPool)}</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">📊 A/R (Receivable)</span>
              <span className="text-sm font-bold text-cyan-300 font-mono">{formatCurrency(totalReceivables)}</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-mono">💳 A/P (Payable)</span>
              <span className="text-sm font-bold text-rose-300 font-mono">$3,000</span>
            </div>
          </div>
        </div>

        {/* Section 2: Revenue + Expenses Breakdown */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span>📊</span> REVENUE + EXPENSES BREAKDOWN
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">ALLOCATION FLOW</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 w-32">Gross Revenue:</span>
              <span className="text-emerald-400 tracking-wider flex-1">██████████████████░░</span>
              <span className="text-slate-200 font-bold w-16 text-right">$60,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 w-32">Operating Costs:</span>
              <span className="text-rose-400 tracking-wider flex-1">████░░░░░░░░░░░░░░░░</span>
              <span className="text-slate-200 font-bold w-16 text-right">$12,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 w-32">Salaries:</span>
              <span className="text-blue-400 tracking-wider flex-1">████████░░░░░░░░░░░░</span>
              <span className="text-slate-200 font-bold w-16 text-right">$18,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 w-32">Growth Fund (20%):</span>
              <span className="text-amber-400 tracking-wider flex-1">████░░░░░░░░░░░░░░░░</span>
              <span className="text-slate-200 font-bold w-16 text-right">$12,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 w-32">Cash Reserve:</span>
              <span className="text-purple-400 tracking-wider flex-1">██████░░░░░░░░░░░░░░</span>
              <span className="text-slate-200 font-bold w-16 text-right">$8,000</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5">
              <span className="text-emerald-300 font-bold w-32">Profit Pool:</span>
              <span className="text-emerald-400 tracking-wider flex-1">████░░░░░░░░░░░░░░░░</span>
              <span className="text-emerald-400 font-bold w-16 text-right">$10,000</span>
            </div>
          </div>

          <div className="mt-3 p-2 bg-[#121c2a] rounded text-[11px] text-emerald-300 flex items-center justify-between font-mono">
            <span>📈 Trend: Revenue Up 15% from last period</span>
            <span className="text-slate-400">Zero Late Receivables</span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          ROW 2: SECTION 3 (SALARY TRACKER) + SECTION 4 (GROWTH FUND 20%)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Section 3: Salary Tracker */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>👤</span> SALARY TRACKER (Monthly)
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">FIXED COMPENSATION</span>
            </div>

            {/* Founders */}
            <span className="text-[11px] font-bold text-amber-400 uppercase font-mono block mb-1.5">
              Founders ($1,000 / mo Fixed)
            </span>
            <div className="space-y-1.5 text-xs mb-3">
              {founderSalaries.map((f, i) => (
                <div key={i} className="p-2 bg-[#121c2a] rounded border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200">{f.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({f.role})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold">{formatCurrency(f.salary)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-mono">✅ Paid</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Employees */}
            <span className="text-[11px] font-bold text-cyan-400 uppercase font-mono block mb-1.5">
              Employees (Monthly Fixed)
            </span>
            <div className="space-y-1.5 text-xs mb-3">
              {employeeSalaries.map((e, i) => (
                <div key={i} className="p-2 bg-[#121c2a] rounded border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200">{e.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({e.role})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-200 font-bold">{formatCurrency(e.salary)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 font-mono">⏳ Due {e.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Monthly Total: <strong className="text-slate-200">{formatCurrency(totalMonthlySalaries)}</strong></span>
              <span className="text-slate-500 block text-[10px]">Annual Run Rate: {formatCurrency(annualSalaries)}</span>
            </div>
            <button 
              onClick={handlePayPayroll}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition"
            >
              💳 Process Payroll
            </button>
          </div>
        </div>

        {/* Section 4: Growth Fund (20% of Revenue) */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>📈</span> GROWTH FUND (20% of Revenue)
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">REINVESTMENT ENGINE</span>
            </div>

            <div className="p-2.5 bg-[#121c2a] rounded-lg border border-slate-800 mb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Growth Fund Collected</span>
                <span className="text-base font-black text-amber-400 font-mono">{formatCurrency(totalGrowthFund)}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 font-mono">
                Rule: 20% of ALL Revenue
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {growthAllocations.map((g, i) => (
                <div key={i} className="p-2 bg-[#121c2a] rounded border border-slate-800/80 flex items-center justify-between">
                  <div className="w-40">
                    <span className="text-slate-200 block font-bold">{g.category}</span>
                    <span className="text-[10px] text-slate-500">{g.pct} allocation</span>
                  </div>
                  <div className="text-amber-400 tracking-wider flex-1 text-center">{g.bar}</div>
                  <span className="text-slate-200 font-bold w-16 text-right">{formatCurrency(g.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-gradient-to-r from-amber-950/30 to-transparent border-l-2 border-amber-500 rounded text-xs flex items-center justify-between font-mono">
            <span className="text-slate-400 text-[11px]">🎯 Fully Allocated into Q2 Sprints</span>
            <button 
              onClick={() => showToast('💰 Growth Fund allocation editor opened!')}
              className="text-[10px] px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold transition"
            >
              Allocate Funds
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          ROW 3: SECTION 5 (CASH RESERVE 3-MO) + SECTION 6 (PROFIT POOL 6-MO)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Section 5: Cash Reserve Tracker */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <span>🛡️</span> CASH RESERVE TRACKER (3 Months)
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">EMERGENCY RUNWAY</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target (3 Months Expenses):</span>
                <span className="text-purple-300 font-bold">{formatCurrency(cashReserveTarget)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Reserve:</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(cashReserve)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Remaining to Target:</span>
                <span className="text-amber-400 font-bold">{formatCurrency(cashReserveTarget - cashReserve)}</span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Runway Progress</span>
                  <span className="text-purple-300 font-bold">53%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '53%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 bg-[#121c2a] rounded border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">🟡</span>
                <span>Status: <strong>Building</strong> (Est. 3 months to target)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                <span>✅</span>
                <span>Rule: When reserve reaches $15,000, 100% of surplus flows into Profit Pool!</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-right">
            <button 
              onClick={() => {
                setCashReserve(prev => Math.min(cashReserveTarget, prev + 1000));
                showToast('🛡️ Transferred $1,000 surplus to Cash Reserve!');
              }}
              className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-500 text-white rounded text-xs font-bold transition"
            >
              + Fund Reserve ($1,000)
            </button>
          </div>
        </div>

        {/* Section 6: Profit Pool (6-Month Accumulation) */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>📋</span> PROFIT POOL (6-Month Accumulation)
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">DISTRIBUTION CYCLE</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-1.5 bg-[#121c2a] rounded border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-300">Month 1: $1,500</span>
                <span className="text-emerald-400">████░░░░░░░░░░░░</span>
                <span className="text-emerald-400 font-bold">✅ Logged</span>
              </div>
              <div className="p-1.5 bg-[#121c2a] rounded border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-300">Month 2: $2,000</span>
                <span className="text-emerald-400">██████░░░░░░░░░░</span>
                <span className="text-emerald-400 font-bold">✅ Logged</span>
              </div>
              <div className="p-1.5 bg-[#121c2a] rounded border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-300">Month 3: $800</span>
                <span className="text-emerald-400">██░░░░░░░░░░░░░░</span>
                <span className="text-emerald-400 font-bold">✅ Logged</span>
              </div>
              <div className="p-1.5 bg-[#121c2a] rounded border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-300">Month 4: $1,200</span>
                <span className="text-emerald-400">████░░░░░░░░░░░░</span>
                <span className="text-emerald-400 font-bold">✅ Logged</span>
              </div>
              <div className="p-1.5 bg-[#121c2a] rounded border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-300">Month 5: $2,500</span>
                <span className="text-emerald-400">████████░░░░░░░░</span>
                <span className="text-emerald-400 font-bold">✅ Logged</span>
              </div>
              <div className="p-1.5 bg-[#121c2a] rounded border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-300">Month 6: $2,000</span>
                <span className="text-emerald-400">██████░░░░░░░░░░</span>
                <span className="text-emerald-400 font-bold">✅ Logged</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Accumulated Pool: <strong className="text-emerald-400">{formatCurrency(profitPool)}</strong></span>
              <span className="text-slate-500 block text-[10px]">Next Distribution: June 30, 2026 (92 days)</span>
            </div>
            <button 
              onClick={() => showToast('📈 Projected distribution for Q3: $14,500!')}
              className="px-3 py-1.5 bg-[#121c2a] hover:bg-slate-700 text-slate-300 rounded text-xs font-bold transition border border-slate-700"
            >
              Project Future
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          ROW 4: SECTION 7 (DISTRIBUTION CALCULATOR) + SECTION 8 (DEBT & INVESTMENT)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Section 7: 6-Month Distribution Calculator */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>🎯</span> 6-MONTH DISTRIBUTION CALCULATOR
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">EQUITY SPLIT (60/20/20)</span>
            </div>

            <div className="p-2.5 bg-[#121c2a] rounded border border-slate-800 text-xs font-mono space-y-1 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Profit Pool:</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(profitPool)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Employee Bonus Pool (Rule: Profit only):</span>
                <span className="text-rose-400 font-bold">-$1,000</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-1 font-bold">
                <span className="text-cyan-300">Available for Founder Payout:</span>
                <span className="text-emerald-400">{formatCurrency(Math.max(0, profitPool - 1000))}</span>
              </div>
            </div>

            {/* Founder Equity Table */}
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 bg-[#121c2a] rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-100">You (Founder)</span>
                  <span className="text-[10px] text-cyan-400 ml-2">60% Equity</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold text-sm">$5,400</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">🏦 Payout</span>
                </div>
              </div>

              <div className="p-2 bg-[#121c2a] rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-100">Designer (Co-Founder)</span>
                  <span className="text-[10px] text-cyan-400 ml-2">20% Equity</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold text-sm">$1,800</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">🏦 Payout</span>
                </div>
              </div>

              <div className="p-2 bg-[#121c2a] rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-100">Frontend (Co-Founder)</span>
                  <span className="text-[10px] text-cyan-400 ml-2">20% Equity</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold text-sm">$1,800</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">🏦 Payout</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">100% of Payout approved by founders</span>
            <button 
              onClick={handleDistributeProfits}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <span>💰</span> Distribute Now
            </button>
          </div>
        </div>

        {/* Section 8: Debt & Investment Tracker */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <span>💳</span> DEBT & INVESTMENT TRACKER
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">GOVERNANCE LIMITS</span>
            </div>

            <div className="space-y-2 text-xs font-mono mb-3">
              <div className="p-2.5 bg-[#121c2a] rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Equipment & Hardware</span>
                  <span className="text-[10px] text-slate-400">Limit: $5,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">$0 Used</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">🟢 Available</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#121c2a] rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Marketing & Ads Debt</span>
                  <span className="text-[10px] text-slate-400">Limit: $3,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">$0 Used</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">🟢 Available</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#121c2a] rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Hiring & Expansion</span>
                  <span className="text-[10px] text-slate-400">Limit: $10,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">$0 Used</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">🟢 Available</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-[#121c2a] rounded text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="text-slate-300 font-bold">💡 Investment Rules:</div>
              <div>• Max $5,000 for equipment · Max $3,000 for marketing · Max $10,000 for hiring</div>
              <div>• All debts require unanimous sign-off by all 3 founders</div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button 
              onClick={() => showToast('📝 Loan application portal opened!')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold transition"
            >
              Request Loan
            </button>
            <span className="text-emerald-400 font-mono text-xs font-bold">0 Active Debts (100% Debt Free)</span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          ROW 5: SECTION 9 (PROJECT PROFITABILITY) + SECTION 10 (INVOICE TRACKER)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Section 9: Project Profitability */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>📊</span> PROJECT PROFITABILITY (Real-Time)
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">MARGIN ANALYSIS</span>
            </div>

            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 text-[10px]">
                  <th className="pb-1.5">Project</th>
                  <th className="pb-1.5 text-right">Revenue</th>
                  <th className="pb-1.5 text-right">Cost</th>
                  <th className="pb-1.5 text-right">Profit</th>
                  <th className="pb-1.5 text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {projectProfits.map((p, i) => (
                  <tr key={i} className="hover:bg-[#121c2a] transition">
                    <td className="py-2 font-bold text-slate-100">{p.name}</td>
                    <td className="py-2 text-right">{formatCurrency(p.revenue)}</td>
                    <td className="py-2 text-right text-rose-400">{formatCurrency(p.cost)}</td>
                    <td className="py-2 text-right text-emerald-400 font-bold">{formatCurrency(p.profit)}</td>
                    <td className="py-2 text-right font-bold text-cyan-300">{p.margin}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-800 text-xs font-bold text-slate-100">
                <tr>
                  <td className="pt-2">Total</td>
                  <td className="pt-2 text-right">$40,000</td>
                  <td className="pt-2 text-right text-rose-400">$19,500</td>
                  <td className="pt-2 text-right text-emerald-400">$20,500</td>
                  <td className="pt-2 text-right text-cyan-300">51.25%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-400">🏆 Most Profitable: RNG Gamez ($6,000 / 60%)</span>
            <span className="text-amber-400">⚠️ Least: Content ($2,000 / 40%)</span>
          </div>
        </div>

        {/* Section 10: Invoice & Payment Tracker */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>💳</span> INVOICE & PAYMENT TRACKER
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">RECEIVABLES</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {invoices.map(inv => (
                <div key={inv.id} className="p-2 bg-[#121c2a] rounded border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200">{inv.client}</span>
                    <span className="text-[10px] text-slate-500 ml-2">Due {inv.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-100">{formatCurrency(inv.amount)}</span>
                    {inv.status === 'paid' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                        ✅ Paid
                      </span>
                    ) : inv.status === 'pending' ? (
                      <button 
                        onClick={() => handleCollectInvoice(inv.id, inv.client, inv.amount)}
                        className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 hover:bg-emerald-900 hover:text-emerald-200 transition"
                      >
                        ⏳ Collect Now
                      </button>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        📝 Draft
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Receivable: <strong className="text-cyan-300">{formatCurrency(totalReceivables)}</strong></span>
              <span className="text-amber-400 block text-[10px]">🟡 2 invoices pending collection</span>
            </div>
            <button 
              onClick={() => showToast('🧾 New client invoice created!')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition"
            >
              + Add Invoice
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          ROW 6: QUICK ACTIONS (CONTROL PANEL)
          ========================================================================= */}
      <div className="bg-[#0e1622] border border-cyan-500/30 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <span>💡</span> FINANCIAL QUICK ACTIONS
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Instant treasury execution</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setCashBalance(prev => prev + 5000);
              showToast('💰 Recorded +$5,000 client retainer revenue!');
            }}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#152336] hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>💰</span> Add Revenue
          </button>
          <button
            onClick={() => {
              setCashBalance(prev => Math.max(0, prev - 1200));
              showToast('💸 Recorded -$1,200 hosting & software expense!');
            }}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#152336] hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>💸</span> Record Expense
          </button>
          <button
            onClick={handlePayPayroll}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#152336] hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>👤</span> Payroll
          </button>
          <button
            onClick={() => showToast('📊 Financial report exported to PDF!')}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#152336] hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>📊</span> Export Report
          </button>
          <button
            onClick={() => showToast('🧾 Tax statement & profit loss ledger exported!')}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#152336] hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>🧾</span> Statement
          </button>
          <button
            onClick={() => showToast('⚙️ Financial governance & tax settings opened!')}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#152336] hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>⚙️</span> Settings
          </button>
        </div>
      </div>

    </div>
  );
}
