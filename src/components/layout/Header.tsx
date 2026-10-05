import React, { useState } from 'react';
import {
  Search,
  Building,
  Calendar,
  CheckCircle2,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    companies,
    selectedCompany,
    selectCompany,
    selectedFY,
    setSyncModalOpen,
    setSearchModalOpen,
    user,
    logout,
    setCurrentPage,
  } = useApp();

  const [isCompanyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-white border-b border-slate-200 shadow-2xs no-print">
      {/* Left zone: Company and Current Year Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Company Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setCompanyDropdownOpen(!isCompanyDropdownOpen);
              setProfileDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded border border-slate-200 transition-colors cursor-pointer"
            title="Switch Active Company"
          >
            <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="max-w-[120px] sm:max-w-[180px] md:max-w-[220px] truncate">
              {selectedCompany.name}
            </span>
            <span className="hidden md:inline text-2xs text-slate-500 font-mono">
              ({selectedCompany.city})
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500 ml-0.5" />
          </button>

          {isCompanyDropdownOpen && (
            <div
              className="absolute left-0 mt-1 w-72 sm:w-80 bg-white rounded-md shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setCompanyDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                  Available Companies
                </span>
                <button
                  onClick={() => {
                    setCurrentPage('companies');
                    setCompanyDropdownOpen(false);
                  }}
                  className="text-2xs text-blue-600 hover:underline font-medium"
                >
                  Manage All
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {companies.map((comp) => {
                  const isSelected = comp.id === selectedCompany.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => {
                        selectCompany(comp.id);
                        setCompanyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                          {comp.name}
                        </span>
                        {isSelected && (
                          <span className="text-2xs font-semibold text-blue-600">Active</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-2xs text-slate-500 font-mono">
                        <span>GSTIN: {comp.gstin}</span>
                        <span>·</span>
                        <span>{comp.city}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Current Financial Year (Fixed, only current year data) */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 rounded border border-slate-200 select-none"
          title="Current Reporting Financial Year"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-mono tabular-nums text-slate-900 font-bold">{selectedFY}</span>
          <span className="hidden sm:inline text-2xs font-medium text-slate-400">Current FY</span>
        </div>
      </div>

      {/* Middle: Global Search bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={() => setSearchModalOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search party, invoice, bill no. or report...</span>
          </div>
          <span className="px-1.5 py-0.5 text-2xs font-mono font-medium text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            ⌘K
          </span>
        </button>
      </div>

      {/* Right zone: Sync status, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Sync Status Badge */}
        <button
          onClick={() => setSyncModalOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-2xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded hover:bg-emerald-100/70 transition-colors cursor-pointer"
          title="Click to view automated push sync details"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold">Synced:</span>
          <span className="tabular-nums font-mono text-emerald-900">{selectedCompany.lastSync.split(',')[1]}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
          </button>

          {isNotificationsOpen && (
            <div
              className="absolute right-0 mt-1 w-80 bg-white rounded-md shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setNotificationsOpen(false)}
            >
              <div className="px-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">System Notifications</span>
                <span className="text-2xs text-slate-500">2 New</span>
              </div>
              <div className="divide-y divide-slate-50 text-xs">
                <div className="px-3 py-2 hover:bg-slate-50">
                  <p className="font-semibold text-slate-800 text-xs">Data Sync Completed</p>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    1,482 accounting vouchers synced from Busy Accounting at 02:15 PM.
                  </p>
                </div>
                <div className="px-3 py-2 hover:bg-slate-50">
                  <p className="font-semibold text-slate-800 text-xs">Quarterly Filing Alert</p>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    GSTR-1 data for Q2 is ready for export and chartered accountant reconciliation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!isProfileDropdownOpen);
              setCompanyDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1 pl-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xs">
              {user?.name.slice(0, 2).toUpperCase() || 'RS'}
            </div>
            <span className="hidden md:inline font-semibold text-slate-800 truncate max-w-[100px]">
              {user?.name || 'Rajesh Shah'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden md:inline" />
          </button>

          {isProfileDropdownOpen && (
            <div
              className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                <p className="text-2xs text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-2xs px-1.5 py-0.2 text-blue-700 bg-blue-50 border border-blue-200 rounded font-semibold">
                  Role: {user?.role || 'Director'}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentPage('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Sync & System Settings
                </button>
                <button
                  onClick={() => {
                    setSyncModalOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  API Diagnostics & Logs
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
