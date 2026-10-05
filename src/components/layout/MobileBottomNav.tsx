import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  BookOpen,
  MoreHorizontal,
  Clock,
  FileCheck2,
  Building2,
  Settings,
  X,
  LogOut,
} from 'lucide-react';
import { useApp, NavPage } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { currentPage, setCurrentPage, logout } = useApp();
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);

  const mainTabs: { id: NavPage; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'purchase', label: 'Purchase', icon: ShoppingBag },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
  ];

  const secondaryTabs: { id: NavPage; label: string; icon: React.ElementType }[] = [
    { id: 'outstanding', label: 'Outstanding Ageing', icon: Clock },
    { id: 'invoice-preview', label: 'Invoice Preview', icon: FileCheck2 },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'settings', label: 'Settings & Sync', icon: Settings },
  ];

  return (
    <>
      {/* "More" Sheet Overlay */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-2xs flex flex-col justify-end md:hidden">
          <div className="bg-white rounded-t-xl p-4 shadow-xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-800">Additional Reports & Tools</span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 py-3">
              {secondaryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentPage === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCurrentPage(tab.id);
                      setMoreMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium border text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-600" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  logout();
                  setMoreMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-white border-t border-slate-200 shadow-lg flex items-center justify-around px-2 no-print">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentPage(tab.id);
                setMoreMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-2xs transition-colors ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setMoreMenuOpen(!isMoreMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-2xs transition-colors ${
            isMoreMenuOpen ||
            secondaryTabs.some((t) => t.id === currentPage)
              ? 'text-blue-600 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MoreHorizontal className="w-4 h-4 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
