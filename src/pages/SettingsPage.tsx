import React, { useState } from 'react';
import {
  Server,
  Key,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Database,
  ExternalLink,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { selectedCompany, user, setSyncModalOpen } = useApp();
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKey] = useState('lp_live_9a8f27c3d1e490b84c8e712a');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Intro */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">
          Accounting Sync & Reporting Infrastructure
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configuration parameters for the Windows offline accounting daemon (Busy / Tally / Marg / Custom ERP) pushing data via PHP API endpoints.
        </p>
      </div>

      {/* Windows Push Service Configuration */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              PHP Ingestion Gateway
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Listening on Port 443 (HTTPS)
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Active Push API Endpoint
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value="https://api.ledgerpulse.com/v1/sync/push"
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Company Secret Token (For Windows Daemon Config)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded text-slate-700"
              />
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
              </button>
            </div>
            <p className="text-2xs text-slate-400 mt-1">
              Include this bearer key in the <code>X-Sync-Token</code> header for all POST payloads.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setSyncModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>View Sync Activity Logs</span>
          </button>
        </div>
      </div>

      {/* User & Access Profile */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Operator Profile & Scope</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1">
            <span className="text-2xs text-slate-400 uppercase font-semibold">User Name</span>
            <p className="font-bold text-slate-900">{user?.name}</p>
            <p className="text-slate-500">{user?.email}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1">
            <span className="text-2xs text-slate-400 uppercase font-semibold">Assigned Role</span>
            <p className="font-bold text-blue-700">{user?.role} (Read-Only Analytics)</p>
            <p className="text-slate-500">Access to 4 company ledgers</p>
          </div>
        </div>

        <div className="text-2xs text-slate-500 bg-blue-50/50 p-3 rounded border border-blue-100 flex items-start gap-2">
          <Laptop className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>B2B Reporting Policy:</strong> This dashboard operates strictly in read-only audit mode. To create invoices, post journal vouchers, or modify ledger balances, enter records into the desktop Windows accounting package. Changes reflect automatically on the next periodic sync.
          </span>
        </div>
      </div>
    </div>
  );
};
