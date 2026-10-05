import React from 'react';
import { X, CheckCircle2, RefreshCw, Server, Database, ArrowRightLeft, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SyncStatusModal: React.FC = () => {
  const {
    isSyncModalOpen,
    setSyncModalOpen,
    selectedCompany,
    triggerSyncRefresh,
    isSyncing,
  } = useApp();

  if (!isSyncModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Accounting Data Synchronization
              </h3>
              <p className="text-xs text-slate-500">
                Automated offline-to-cloud push status
              </p>
            </div>
          </div>
          <button
            onClick={() => setSyncModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Last Sync Time</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 tabular-nums">
                {selectedCompany.lastSync}
              </p>
            </div>

            <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Database className="w-3.5 h-3.5" />
                <span>Records Updated</span>
              </div>
              <p className="text-sm font-semibold text-emerald-700 tabular-nums">
                {selectedCompany.recordsUpdated.toLocaleString('en-IN')} Entries
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500">Active Entity:</span>
              <span className="font-semibold text-slate-800">{selectedCompany.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500">GSTIN:</span>
              <span className="font-mono text-slate-800 tabular-nums">{selectedCompany.gstin}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500">Offline Source:</span>
              <span className="font-medium text-slate-800">{selectedCompany.softwareSource}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500">Sync Pipeline:</span>
              <span className="font-mono text-xs text-blue-600">POST /api/v1/sync/push</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Data Integrity:</span>
              <span className="inline-flex items-center text-emerald-700 font-medium">
                Verified (SHA-256 Checksum OK)
              </span>
            </div>
          </div>

          {/* Sync timeline / recent batches */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Recent Batches</p>
            <div className="space-y-1.5 text-xs text-slate-600 font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="tabular-nums">14:15:02 · Batch #4491</span>
                <span className="text-emerald-600 font-semibold tabular-nums">142 Sales Bills</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="tabular-nums">14:14:58 · Batch #4490</span>
                <span className="text-emerald-600 font-semibold tabular-nums">88 Purchase Bills</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="tabular-nums">14:14:55 · Batch #4489</span>
                <span className="text-emerald-600 font-semibold tabular-nums">1,252 Ledger Entries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/60">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            Direct Windows Daemon
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerSyncRefresh}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              {isSyncing ? 'Checking...' : 'Check Status'}
            </button>
            <button
              onClick={() => setSyncModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
