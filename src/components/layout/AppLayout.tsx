import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { SyncStatusModal } from '../common/SyncStatusModal';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { useApp, NavPage } from '../../context/AppContext';
import { ChevronRight, Home } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  actionSlot?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  actionSlot,
}) => {
  const { currentPage, setCurrentPage, selectedCompany, selectedFY } = useApp();

  const getBreadcrumbLabel = (page: NavPage) => {
    switch (page) {
      case 'dashboard':
        return 'Executive Dashboard';
      case 'sales':
        return 'Sales Register & Details';
      case 'purchase':
        return 'Purchase Register & Inward';
      case 'ledger':
        return 'Party Statement of Account';
      case 'outstanding':
        return 'Outstanding Receivables & Ageing';
      case 'invoice-preview':
        return 'Sales Invoice Preview';
      case 'companies':
        return 'Company Directory';
      case 'settings':
        return 'System & Sync Settings';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        {/* Top Header */}
        <Header />

        {/* Page Header Bar (Breadcrumb + Title + Action Slot) */}
        <div className="px-4 sm:px-6 pt-4 pb-2 no-print">
          {/* Breadcrumb Trail */}
          <nav className="flex items-center gap-1.5 text-2xs text-slate-500 mb-1 font-medium">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <Home className="w-3 h-3" />
              <span>{selectedCompany.name}</span>
            </button>
            <ChevronRight className="w-2.5 h-2.5 text-slate-400" />
            <span className="font-mono text-slate-600">{selectedFY}</span>
            <ChevronRight className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-slate-800 font-semibold">{getBreadcrumbLabel(currentPage)}</span>
          </nav>

          {/* Title and Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-b border-slate-200/70 pb-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {pageTitle}
              </h1>
              {pageSubtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{pageSubtitle}</p>
              )}
            </div>

            {actionSlot && <div className="flex items-center gap-2">{actionSlot}</div>}
          </div>
        </div>

        {/* Dynamic Body Content */}
        <main className="flex-1 px-4 sm:px-6 py-4">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals */}
      <SyncStatusModal />
      <GlobalSearchModal />
    </div>
  );
};
