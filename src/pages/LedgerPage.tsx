import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  RotateCcw,
  Building,
  User,
  Calendar,
  ArrowUpDown,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { LedgerEntry, LedgerPartySummary } from '../types';
import { SummaryCard } from '../components/common/SummaryCard';
import { ExportButtons } from '../components/common/ExportButtons';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { SearchableSelect } from '../components/common/SearchableSelect';

export const LedgerPage: React.FC = () => {
  const {
    selectedCompany,
    selectedFY,
    formatCurrency,
    openInvoicePreview,
  } = useApp();

  const [loading, setLoading] = useState(true);
  const [selectedParty, setSelectedParty] = useState('SHIVAM CREATION & FABRICS');
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-10-05');
  const [searchQuery, setSearchQuery] = useState('');

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [partySummary, setPartySummary] = useState<LedgerPartySummary | null>(null);

  const availableParties = [
    'SHIVAM CREATION & FABRICS',
    'AMBICA TEXTILES LTD',
    'RADHIKA FASHIONS PVT LTD',
    'PARAS SILK MILLS',
    'MAHAVIR CLOTH AGENCY',
    'TIRUPATI TEXTILE TRADERS',
  ];

  const fetchLedger = () => {
    setLoading(true);
    api
      .getLedger({
        companyId: selectedCompany.id,
        fy: selectedFY,
        party: selectedParty,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      .then((res) => {
        if (res.success) {
          setLedgerEntries(res.data.entries);
          setPartySummary(res.data.summary);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLedger();
  }, [selectedParty, selectedCompany.id, selectedFY]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return ledgerEntries;
    const q = searchQuery.toLowerCase();
    return ledgerEntries.filter(
      (e) =>
        e.billNo.toLowerCase().includes(q) ||
        e.voucherNo.toLowerCase().includes(q) ||
        e.reference.toLowerCase().includes(q) ||
        e.remarks.toLowerCase().includes(q)
    );
  }, [ledgerEntries, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Filter and Party Selection Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Party Statement of Account (Ledger)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Complete transaction journal with running Dr/Cr balance verification
            </p>
          </div>

          <ExportButtons
            filename={`ledger-${selectedParty.replace(/\s+/g, '_')}-${selectedFY}`}
            tableData={filteredEntries as unknown as Record<string, unknown>[]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Select Account / Party
            </label>
            <SearchableSelect
              options={availableParties}
              value={selectedParty}
              onChange={setSelectedParty}
              showAllOption={false}
              placeholder="Search account/party..."
              searchPlaceholder="Type party name..."
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Search Voucher / Bill
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter entries..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="text-2xs text-slate-500">
            GSTIN: <span className="font-mono font-semibold text-slate-700">{partySummary?.gstin}</span> · {partySummary?.city}
          </div>
          <button
            type="button"
            onClick={fetchLedger}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs"
          >
            <Filter className="w-3 h-3" />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards: Opening Balance, Total Debit, Total Credit, Closing Balance */}
      {loading || !partySummary ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            label="Opening Balance"
            value={formatCurrency(partySummary.openingBalance)}
            subValue={`Balance Type: ${partySummary.openingType} (Receivable)`}
            variant="default"
          />
          <SummaryCard
            label="Total Debit (+)"
            value={formatCurrency(partySummary.totalDebit)}
            subValue="Bills & Debit Notes"
            variant="primary"
          />
          <SummaryCard
            label="Total Credit (-)"
            value={formatCurrency(partySummary.totalCredit)}
            subValue="Receipts & Payments"
            variant="success"
          />
          <SummaryCard
            label="Closing Balance"
            value={formatCurrency(partySummary.closingBalance)}
            subValue={`Net Outstanding (${partySummary.closingType})`}
            variant="danger"
          />
        </div>
      )}

      {/* Main Ledger Table */}
      {loading ? (
        <TableSkeleton rows={8} columns={8} />
      ) : filteredEntries.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] relative">
            <table className="w-full text-left text-xs divide-y divide-slate-200 whitespace-nowrap">
              <thead className="bg-slate-50 font-semibold text-slate-600 sticky top-0 z-10 border-b border-slate-200 shadow-2xs">
                <tr>
                  <th className="py-2.5 px-3.5">Date</th>
                  <th className="py-2.5 px-3">Reference / Type</th>
                  <th className="py-2.5 px-3">Bill No.</th>
                  <th className="py-2.5 px-3">Voucher No.</th>
                  <th className="py-2.5 px-3 text-right">Debit (Dr ₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit (Cr ₹)</th>
                  <th className="py-2.5 px-3 text-right">Running Balance (₹)</th>
                  <th className="py-2.5 px-3">Remarks / Particulars</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((entry) => {
                  const isOpening = entry.voucherType === 'Opening';
                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isOpening ? 'bg-amber-50/60 font-semibold border-y border-amber-200/60' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3.5 font-mono tabular-nums text-slate-700">
                        {entry.date}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold ${
                            entry.voucherType === 'Sale'
                              ? 'text-blue-700'
                              : entry.voucherType === 'Receipt'
                              ? 'text-emerald-700'
                              : entry.voucherType === 'Opening'
                              ? 'text-amber-800'
                              : 'text-slate-800'
                          }`}
                        >
                          {entry.reference}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                        {entry.billNo.startsWith('INV-') ? (
                          <button
                            onClick={() => openInvoicePreview(42)}
                            className="text-blue-600 hover:underline cursor-pointer"
                            title="Click to view Invoice details"
                          >
                            {entry.billNo}
                          </button>
                        ) : (
                          entry.billNo
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {entry.voucherNo}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                        {entry.debit > 0
                          ? entry.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                          : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-emerald-700">
                        {entry.credit > 0
                          ? entry.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                          : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                        <span className="mr-1">
                          {entry.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span
                          className={`text-2xs font-mono font-bold px-1 py-0.2 rounded ${
                            entry.balanceType === 'Dr'
                              ? 'text-rose-700 bg-rose-50'
                              : 'text-emerald-700 bg-emerald-50'
                          }`}
                        >
                          {entry.balanceType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-sm truncate text-2xs">
                        {entry.remarks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Table Footer with Ledger Totals */}
              {partySummary && (
                <tfoot className="bg-slate-100/80 font-semibold text-slate-800 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={4} className="py-2.5 px-3 text-right">
                      Statement Period Totals:
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                      ₹ {partySummary.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-700">
                      ₹ {partySummary.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-blue-900">
                      ₹ {partySummary.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}{' '}
                      <span className="text-2xs">{partySummary.closingType}</span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Ledger Entries Found"
          description="There are no debit or credit transactions recorded for this party within the specified date range."
          onAction={() => {
            setDateFrom('2026-04-01');
            setDateTo('2026-10-05');
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
};
