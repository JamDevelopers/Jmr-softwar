import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Search,
  Filter,
  RotateCcw,
  ArrowUpDown,
  Building,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { OutstandingItem, OutstandingSummary } from '../types';
import { SummaryCard } from '../components/common/SummaryCard';
import { ExportButtons } from '../components/common/ExportButtons';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { SearchableSelect } from '../components/common/SearchableSelect';

export const OutstandingPage: React.FC = () => {
  const {
    selectedCompany,
    selectedFY,
    formatCurrency,
    openInvoicePreview,
  } = useApp();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<OutstandingItem[]>([]);
  const [summary, setSummary] = useState<OutstandingSummary | null>(null);

  // Filters
  const [partyFilter, setPartyFilter] = useState('ALL');
  const [ageingFilter, setAgeingFilter] = useState('ALL');
  const [salesBookFilter, setSalesBookFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<string>('daysOutstanding');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const fetchOutstanding = () => {
    setLoading(true);
    api
      .getOutstanding({
        companyId: selectedCompany.id,
        fy: selectedFY,
        party: partyFilter !== 'ALL' ? partyFilter : undefined,
        ageing: ageingFilter !== 'ALL' ? ageingFilter : undefined,
        salesBook: salesBookFilter !== 'ALL' ? salesBookFilter : undefined,
        search: searchQuery || undefined,
      })
      .then((res) => {
        if (res.success) {
          setItems(res.data.items);
          setSummary(res.data.summary);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOutstanding();
  }, [selectedCompany.id, selectedFY]);

  const handleResetFilters = () => {
    setPartyFilter('ALL');
    setAgeingFilter('ALL');
    setSalesBookFilter('ALL');
    setSearchQuery('');
    setTimeout(fetchOutstanding, 10);
  };

  const partiesList = useMemo(() => {
    const set = new Set(items.map((i) => i.party));
    return Array.from(set);
  }, [items]);

  const sortedItems = useMemo(() => {
    let list = [...items];
    if (partyFilter !== 'ALL') {
      list = list.filter((i) => i.party === partyFilter);
    }
    if (ageingFilter !== 'ALL') {
      list = list.filter((i) => i.ageingBracket === ageingFilter);
    }
    if (salesBookFilter !== 'ALL') {
      list = list.filter((i) => i.book === salesBookFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.party.toLowerCase().includes(q) ||
          i.billNo.toLowerCase().includes(q) ||
          i.remarks.toLowerCase().includes(q)
      );
    }

    if (sortField) {
      list.sort((a, b) => {
        const valA = (a as unknown as Record<string, unknown>)[sortField];
        const valB = (b as unknown as Record<string, unknown>)[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    return list;
  }, [items, partyFilter, ageingFilter, salesBookFilter, searchQuery, sortField, sortAsc]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getAgeingBadge = (bracket: OutstandingItem['ageingBracket']) => {
    switch (bracket) {
      case 'Current':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case '1-30 Days':
        return 'text-blue-700 bg-blue-50 border border-blue-200';
      case '31-60 Days':
        return 'text-amber-700 bg-amber-50 border border-amber-200';
      case '61-90 Days':
        return 'text-orange-700 bg-orange-50 border border-orange-200';
      case '90+ Days':
        return 'text-rose-700 bg-rose-50 border border-rose-200 font-bold';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-600" />
            <span>Outstanding Receivables & Ageing Analysis</span>
          </h2>
          <p className="text-xs text-slate-500">
            Bill-by-bill pending debtor payments with automated day intervals
          </p>
        </div>

        <ExportButtons
          filename={`outstanding-receivables-${selectedFY}`}
          tableData={sortedItems as unknown as Record<string, unknown>[]}
        />
      </div>

      {/* Summary KPI Cards for Ageing */}
      {loading || !summary ? (
        <CardSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard
            label="Total Outstanding"
            value={formatCurrency(summary.totalOutstanding)}
            subValue="Debtors Balance"
            variant="danger"
            onClick={() => setAgeingFilter('ALL')}
          />
          <SummaryCard
            label="Current (< 1d)"
            value={formatCurrency(summary.current)}
            subValue="Due Today"
            variant="success"
            onClick={() => setAgeingFilter('Current')}
          />
          <SummaryCard
            label="1–30 Days"
            value={formatCurrency(summary.days1To30)}
            subValue="Within 1 month"
            variant="primary"
            onClick={() => setAgeingFilter('1-30 Days')}
          />
          <SummaryCard
            label="31–60 Days"
            value={formatCurrency(summary.days31To60)}
            subValue="Mild Delay"
            variant="warning"
            onClick={() => setAgeingFilter('31-60 Days')}
          />
          <SummaryCard
            label="61–90 Days"
            value={formatCurrency(summary.days61To90)}
            subValue="Action Needed"
            variant="warning"
            onClick={() => setAgeingFilter('61-90 Days')}
          />
          <SummaryCard
            label="90+ Days"
            value={formatCurrency(summary.days90Plus)}
            subValue="Critical Overdue"
            variant="danger"
            onClick={() => setAgeingFilter('90+ Days')}
          />
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Customer / Party
            </label>
            <SearchableSelect
              options={partiesList}
              value={partyFilter}
              onChange={setPartyFilter}
              allOptionLabel="All Parties"
              placeholder="Select customer/party..."
              searchPlaceholder="Search customer/party..."
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Ageing Bracket
            </label>
            <select
              value={ageingFilter}
              onChange={(e) => setAgeingFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800"
            >
              <option value="ALL">All Ageing</option>
              <option value="Current">Current (&lt; 1 Day)</option>
              <option value="1-30 Days">1 - 30 Days</option>
              <option value="31-60 Days">31 - 60 Days</option>
              <option value="61-90 Days">61 - 90 Days</option>
              <option value="90+ Days">90+ Days (Critical)</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Sales Book
            </label>
            <select
              value={salesBookFilter}
              onChange={(e) => setSalesBookFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800"
            >
              <option value="ALL">All Sales Books</option>
              <option value="Main Sales Book">Main Sales Book</option>
              <option value="Export / Inter-State">Export / Inter-State</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Search Invoice / Party
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={fetchOutstanding}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs"
          >
            <Filter className="w-3 h-3" />
            <span>Apply</span>
          </button>
        </div>
      </div>

      {/* Main Outstanding Table */}
      {loading ? (
        <TableSkeleton rows={8} columns={11} />
      ) : sortedItems.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] relative">
            <table className="w-full text-left text-xs divide-y divide-slate-200 whitespace-nowrap">
              <thead className="bg-slate-50 font-semibold text-slate-600 sticky top-0 z-10 border-b border-slate-200 shadow-2xs">
                <tr>
                  <th
                    onClick={() => handleSort('party')}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1">
                      Party Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">Sales Book</th>
                  <th
                    onClick={() => handleSort('billNo')}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1">
                      Bill No. <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">Bill Date</th>
                  <th className="py-2.5 px-3 text-right">Bill Amount (₹)</th>
                  <th className="py-2.5 px-3 text-right">Received (₹)</th>
                  <th className="py-2.5 px-3 text-right">Discount (₹)</th>
                  <th
                    onClick={() => handleSort('balance')}
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 font-bold text-rose-700 bg-rose-50/50"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Pending Balance (₹) <ArrowUpDown className="w-3 h-3 text-rose-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('daysOutstanding')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center justify-center gap-1">
                      Days Overdue <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">Ageing Bracket</th>
                  <th className="py-2.5 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-900 max-w-xs truncate">
                      {item.party}
                    </td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-2xs">{item.book}</td>
                    <td className="py-2 px-3 font-semibold text-blue-700 font-mono">
                      <button
                        onClick={() => openInvoicePreview(42)}
                        className="hover:underline cursor-pointer"
                        title="View invoice"
                      >
                        {item.billNo}
                      </button>
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-mono tabular-nums">
                      {item.billDate}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-800">
                      {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-emerald-700">
                      {item.received > 0
                        ? item.received.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                        : '-'}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-500">
                      {item.discount > 0
                        ? item.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                        : '-'}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-rose-700 bg-rose-50/30">
                      {item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums font-bold text-slate-900">
                      {item.daysOutstanding} d
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-2xs font-semibold ${getAgeingBadge(item.ageingBracket)}`}>
                        {item.ageingBracket}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500 max-w-xs truncate text-2xs">
                      {item.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Outstanding Total Row */}
              <tfoot className="bg-slate-100/90 font-semibold text-slate-800 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="py-2.5 px-3 text-right">
                    Total Filtered Balance:
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                    ₹{' '}
                    {sortedItems
                      .reduce((acc, i) => acc + i.amount, 0)
                      .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-700">
                    ₹{' '}
                    {sortedItems
                      .reduce((acc, i) => acc + i.received, 0)
                      .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                    ₹{' '}
                    {sortedItems
                      .reduce((acc, i) => acc + i.discount, 0)
                      .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-rose-700 bg-rose-100/50">
                    ₹{' '}
                    {sortedItems
                      .reduce((acc, i) => acc + i.balance, 0)
                      .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Outstanding Items Found"
          description="No receivables match the selected party or ageing bracket."
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
};
