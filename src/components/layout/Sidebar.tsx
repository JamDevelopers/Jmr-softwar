import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  BookOpen,
  Clock,
  FileCheck2,
  Building2,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useApp, NavPage } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, selectedCompany, setSyncModalOpen } = useApp();

  const navItems: { id: NavPage; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'purchase', label: 'Purchase', icon: ShoppingBag },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
    { id: 'outstanding', label: 'Outstanding', icon: Clock },
    { id: 'invoice-preview', label: 'Invoice Preview', icon: FileCheck2 },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 h-screen sticky top-0 select-none no-print">
      {/* Brand Header */}
      <div className="flex items-center gap-3 h-14 px-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-base tracking-tighter">
          LP
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm tracking-tight text-white leading-tight">
            LedgerPulse
          </span>
          <span className="text-2xs text-slate-400 truncate">
            B2B Reporting Platform
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-2xs font-semibold text-slate-400 uppercase tracking-wider">
          Reports & Analytics
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-2xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Company & Software Source Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div
          onClick={() => setSyncModalOpen(true)}
          className="p-2.5 rounded-md bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
              Connected Entity
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-white truncate">{selectedCompany.name}</p>
          <p className="text-2xs text-slate-400 truncate mt-0.5 font-mono">
            GSTIN: {selectedCompany.gstin}
          </p>
          <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-700/40 text-2xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate">{selectedCompany.softwareSource.split('(')[0]}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
