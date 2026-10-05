import React, { useState } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Clock,
  History,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/common/EmptyState';

export const CompaniesPage: React.FC = () => {
  const {
    companies,
    selectedCompany,
    selectCompany,
    selectedFY,
    setCurrentPage,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentCompanies] = useState<string[]>(['CMP-101', 'CMP-102']);

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.gstin.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  const handleSelectAndGo = (companyId: string) => {
    selectCompany(companyId);
    setCurrentPage('dashboard');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Intro Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Select Operating Business Entity
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Switch between authorized company accounts to view isolated accounting registers, tax ledgers, and financial summaries pushed by the Windows desktop synchronization agent.
            </p>
          </div>

          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, GSTIN, city..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-600 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recently Opened Companies */}
      {recentCompanies.length > 0 && !searchQuery && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>Recently Opened</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {companies
              .filter((c) => recentCompanies.includes(c.id))
              .map((comp) => (
                <div
                  key={`recent-${comp.id}`}
                  onClick={() => handleSelectAndGo(comp.id)}
                  className="bg-white border border-slate-200/80 hover:border-blue-400 p-3.5 rounded-lg flex items-center justify-between cursor-pointer transition-all shadow-2xs hover:shadow-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {comp.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                        {comp.name}
                      </p>
                      <p className="text-2xs text-slate-500 font-mono">
                        GSTIN: {comp.gstin} · {comp.city}
                      </p>
                    </div>
                  </div>

                  <span className="text-2xs font-semibold text-blue-600 flex items-center gap-1 shrink-0">
                    Open <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Companies Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              All Available Companies ({filteredCompanies.length})
            </h3>
          </div>
          <span className="text-2xs text-slate-500">
            Active: <span className="font-semibold text-slate-900">{selectedCompany.name}</span>
          </span>
        </div>

        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCompanies.map((comp) => {
              const isActive = comp.id === selectedCompany.id;
              return (
                <div
                  key={comp.id}
                  className={`bg-white border rounded-lg p-5 transition-all shadow-2xs flex flex-col justify-between ${
                    isActive
                      ? 'border-blue-600 ring-1 ring-blue-600/30'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {comp.name}
                          </h4>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-2xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-2xs text-slate-400 font-mono font-medium">
                          ID: {comp.id}
                        </span>
                      </div>

                      <div className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-2xs font-mono font-semibold text-slate-700 flex items-center gap-1 shrink-0">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {comp.city}
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-1.5 my-3 text-xs bg-slate-50/70 p-3 rounded border border-slate-100">
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-2xs text-slate-400 uppercase font-semibold">
                          GSTIN:
                        </span>
                        <span className="font-mono font-bold text-slate-900">{comp.gstin}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-2xs text-slate-400 uppercase font-semibold">
                          Location:
                        </span>
                        <span className="truncate max-w-[200px] text-2xs text-slate-700">
                          {comp.address}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-2xs text-slate-400 uppercase font-semibold">
                          Last Push Sync:
                        </span>
                        <span className="text-2xs text-slate-700 flex items-center gap-1 tabular-nums">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {comp.lastSync}
                        </span>
                      </div>
                    </div>

                    {/* Current Financial Year Display */}
                    <div className="mb-4 flex items-center justify-between text-xs p-2.5 bg-slate-50 border border-slate-200/80 rounded">
                      <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Reporting Financial Year:
                      </span>
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                        {comp.currentFY}
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    type="button"
                    onClick={() => handleSelectAndGo(comp.id)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                    }`}
                  >
                    <span>{isActive ? 'Continue to Dashboard' : 'Switch to this Company'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No Companies Found"
            description={`No business entities matched "${searchQuery}". Please check the spelling or GSTIN.`}
            onAction={() => setSearchQuery('')}
            actionText="Clear Search"
          />
        )}
      </div>

      {/* Security & Isolation Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center gap-3 text-2xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Strict Company Isolation Enforced: Reports, ledgers, vouchers, and outstanding ageing numbers are scoped exclusively to the active company and financial year.
        </span>
      </div>
    </div>
  );
};
