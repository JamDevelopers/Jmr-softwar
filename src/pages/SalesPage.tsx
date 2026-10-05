import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  RotateCcw,
  Eye,
  ArrowUpDown,
  Building,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { SalesSummaryItem, SalesDetailItem } from '../types';
import { SummaryCard } from '../components/common/SummaryCard';
import { Pagination } from '../components/common/Pagination';
import { ExportButtons } from '../components/common/ExportButtons';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { SearchableSelect } from '../components/common/SearchableSelect';

export const SalesPage: React.FC = () => {
  const {
    selectedCompany,
    selectedFY,
    formatCurrency,
    formatNumber,
    openInvoicePreview,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');
  const [loading, setLoading] = useState(true);

  // Data states
  const [summaryData, setSummaryData] = useState<SalesSummaryItem[]>([]);
  const [detailsData, setDetailsData] = useState<SalesDetailItem[]>([]);

  // Filter states for Summary
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [partyFilter, setPartyFilter] = useState('ALL');
  const [seriesFilter, setSeriesFilter] = useState('ALL');
  const [searchInvoice, setSearchInvoice] = useState('');

  // Filter states for Details
  const [itemFilter, setItemFilter] = useState('ALL');
  const [hsnFilter, setHsnFilter] = useState('');
  const [detailsSearch, setDetailsSearch] = useState('');

  // Pagination states
  const [summaryPage, setSummaryPage] = useState(1);
  const [summaryPageSize, setSummaryPageSize] = useState(10);
  const [detailsPage, setDetailsPage] = useState(1);
  const [detailsPageSize, setDetailsPageSize] = useState(10);

  // Sorting
  const [sortField, setSortField] = useState<string>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Fetch summary data
  const fetchSummary = () => {
    setLoading(true);
    api
      .getSalesSummary({
        companyId: selectedCompany.id,
        fy: selectedFY,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        party: partyFilter !== 'ALL' ? partyFilter : undefined,
        series: seriesFilter !== 'ALL' ? seriesFilter : undefined,
        search: searchInvoice || undefined,
        page: 1,
        pageSize: 100,
      })
      .then((res) => {
        if (res.success) {
          setSummaryData(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  // Fetch details data
  const fetchDetails = () => {
    setLoading(true);
    api
      .getSalesDetails({
        companyId: selectedCompany.id,
        fy: selectedFY,
        party: partyFilter !== 'ALL' ? partyFilter : undefined,
        item: itemFilter !== 'ALL' ? itemFilter : undefined,
        hsn: hsnFilter || undefined,
        search: detailsSearch || undefined,
        page: 1,
        pageSize: 100,
      })
      .then((res) => {
        if (res.success) {
          setDetailsData(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'summary') {
      fetchSummary();
    } else {
      fetchDetails();
    }
  }, [activeTab, selectedCompany.id, selectedFY]);

  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setPartyFilter('ALL');
    setSeriesFilter('ALL');
    setSearchInvoice('');
    setItemFilter('ALL');
    setHsnFilter('');
    setDetailsSearch('');
    setTimeout(() => {
      if (activeTab === 'summary') fetchSummary();
      else fetchDetails();
    }, 10);
  };

  // Unique lists for dropdowns
  const partiesList = useMemo(() => {
    const set = new Set(summaryData.map((s) => s.party));
    return Array.from(set);
  }, [summaryData]);

  const seriesList = useMemo(() => {
    const set = new Set(summaryData.map((s) => s.series));
    return Array.from(set);
  }, [summaryData]);

  const itemsList = useMemo(() => {
    const set = new Set(detailsData.map((d) => d.item));
    return Array.from(set);
  }, [detailsData]);

  // Summary totals calculation
  const summaryTotals = useMemo(() => {
    return summaryData.reduce(
      (acc, curr) => ({
        count: acc.count + 1,
        taxable: acc.taxable + curr.taxableAmount,
        cgst: acc.cgst + curr.cgst,
        sgst: acc.sgst + curr.sgst,
        igst: acc.igst + curr.igst,
        gross: acc.gross + curr.grossAmount,
      }),
      { count: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, gross: 0 }
    );
  }, [summaryData]);

  // Paginated summary items
  const paginatedSummary = useMemo(() => {
    let sorted = [...summaryData];
    if (sortField) {
      sorted.sort((a, b) => {
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
    const start = (summaryPage - 1) * summaryPageSize;
    return sorted.slice(start, start + summaryPageSize);
  }, [summaryData, summaryPage, summaryPageSize, sortField, sortAsc]);

  // Paginated details items
  const paginatedDetails = useMemo(() => {
    const start = (detailsPage - 1) * detailsPageSize;
    return detailsData.slice(start, start + detailsPageSize);
  }, [detailsData, detailsPage, detailsPageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Row with Tabs and Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        {/* Tabs: Sales Summary vs Sales Details */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Summary (Bill-Wise)
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'details'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Details (Item-Wise)
          </button>
        </div>

        {/* Export / Print buttons */}
        <ExportButtons
          filename={`sales-${activeTab}-${selectedFY}`}
          tableData={activeTab === 'summary' ? (summaryData as unknown as Record<string, unknown>[]) : (detailsData as unknown as Record<string, unknown>[])}
        />
      </div>

      {/* TAB 1: SALES SUMMARY */}
      {activeTab === 'summary' && (
        <>
          {/* Top Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800"
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
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Customer / Party
                </label>
                <SearchableSelect
                  options={partiesList}
                  value={partyFilter}
                  onChange={setPartyFilter}
                  allOptionLabel="All Parties"
                  searchPlaceholder="Search customer/party..."
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Sales Series
                </label>
                <select
                  value={seriesFilter}
                  onChange={(e) => setSeriesFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800"
                >
                  <option value="ALL">All Series</option>
                  {seriesList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Search Invoice
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchInvoice}
                    onChange={(e) => setSearchInvoice(e.target.value)}
                    placeholder="INV-2026-..."
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
                onClick={fetchSummary}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs"
              >
                <Filter className="w-3 h-3" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>

          {/* Sales Summary KPI Cards */}
          {loading ? (
            <CardSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <SummaryCard
                label="Total Bills"
                value={formatNumber(summaryTotals.count)}
                subValue="Vouchers"
                variant="default"
              />
              <SummaryCard
                label="Taxable Amount"
                value={formatCurrency(summaryTotals.taxable)}
                variant="primary"
              />
              <SummaryCard
                label="CGST"
                value={formatCurrency(summaryTotals.cgst)}
                variant="default"
              />
              <SummaryCard
                label="SGST"
                value={formatCurrency(summaryTotals.sgst)}
                variant="default"
              />
              <SummaryCard
                label="IGST"
                value={formatCurrency(summaryTotals.igst)}
                variant="default"
              />
              <SummaryCard
                label="Gross Amount"
                value={formatCurrency(summaryTotals.gross)}
                variant="success"
              />
            </div>
          )}

          {/* Main Sales Summary Table */}
          {loading ? (
            <TableSkeleton rows={8} columns={11} />
          ) : summaryData.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] relative">
                <table className="w-full text-left text-xs divide-y divide-slate-200 whitespace-nowrap">
                  <thead className="bg-slate-50 font-semibold text-slate-600 sticky top-0 z-10 border-b border-slate-200 shadow-2xs">
                    <tr>
                      <th
                        onClick={() => handleSort('date')}
                        className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Date <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('invoiceNo')}
                        className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Invoice No. <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('party')}
                        className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Party Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-2.5 px-3 text-right">Pcs</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Taxable Amt (₹)</th>
                      <th className="py-2.5 px-3 text-right">CGST (₹)</th>
                      <th className="py-2.5 px-3 text-right">SGST (₹)</th>
                      <th className="py-2.5 px-3 text-right">IGST (₹)</th>
                      <th
                        onClick={() => handleSort('grossAmount')}
                        className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                      >
                        <div className="flex items-center justify-end gap-1">
                          Gross Total (₹) <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-2.5 px-3">City</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedSummary.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        <td className="py-2 px-3 text-slate-600 font-mono tabular-nums">
                          {item.date}
                        </td>
                        <td className="py-2 px-3 font-semibold text-blue-700 font-mono">
                          <button
                            onClick={() => openInvoicePreview(item.id)}
                            className="hover:underline text-left cursor-pointer"
                            title="Click to preview invoice document"
                          >
                            {item.invoiceNo}
                          </button>
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900 max-w-xs truncate">
                          {item.party}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-700">
                          {item.pieces}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums font-mono text-slate-700">
                          {item.quantity.toFixed(2)} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums font-semibold text-slate-800">
                          {item.taxableAmount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-600">
                          {item.cgst > 0
                            ? item.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                            : '-'}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-600">
                          {item.sgst > 0
                            ? item.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                            : '-'}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-600">
                          {item.igst > 0
                            ? item.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                            : '-'}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums font-bold text-slate-900">
                          {item.grossAmount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-2 px-3 text-slate-500 font-medium">{item.city}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => openInvoicePreview(item.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-2xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                            title="Open A4 Tax Invoice Preview"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={summaryPage}
                totalPages={Math.ceil(summaryData.length / summaryPageSize)}
                totalRecords={summaryData.length}
                pageSize={summaryPageSize}
                onPageChange={setSummaryPage}
                onPageSizeChange={(newSize) => {
                  setSummaryPageSize(newSize);
                  setSummaryPage(1);
                }}
              />
            </div>
          ) : (
            <EmptyState
              title="No Sales Records Found"
              description="No sales invoices match the applied filters for the active financial year."
              onAction={handleResetFilters}
            />
          )}
        </>
      )}

      {/* TAB 2: SALES DETAILS (ITEM-WISE) */}
      {activeTab === 'details' && (
        <>
          {/* Details Filter Bar */}
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
                  searchPlaceholder="Search customer/party..."
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Item Description
                </label>
                <select
                  value={itemFilter}
                  onChange={(e) => setItemFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800 truncate"
                >
                  <option value="ALL">All Items</option>
                  {itemsList.map((it) => (
                    <option key={it} value={it}>
                      {it}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  HSN Code
                </label>
                <input
                  type="text"
                  value={hsnFilter}
                  onChange={(e) => setHsnFilter(e.target.value)}
                  placeholder="e.g. 5407"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Search Item / Bill
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={detailsSearch}
                    onChange={(e) => setDetailsSearch(e.target.value)}
                    placeholder="Search keywords..."
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
                onClick={fetchDetails}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs"
              >
                <Filter className="w-3 h-3" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>

          {/* Details Table */}
          {loading ? (
            <TableSkeleton rows={8} columns={10} />
          ) : detailsData.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] relative">
                <table className="w-full text-left text-xs divide-y divide-slate-200 whitespace-nowrap">
                  <thead className="bg-slate-50 font-semibold text-slate-600 sticky top-0 z-10 border-b border-slate-200 shadow-2xs">
                    <tr>
                      <th className="py-2.5 px-3">Invoice No.</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Party Name</th>
                      <th className="py-2.5 px-3">Item Name</th>
                      <th className="py-2.5 px-3">HSN</th>
                      <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Pcs</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-3 text-right">CGST</th>
                      <th className="py-2.5 px-3 text-right">SGST</th>
                      <th className="py-2.5 px-3 text-right">IGST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedDetails.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                        onClick={() => openInvoicePreview(item.invoiceId)}
                      >
                        <td className="py-2 px-3 font-semibold text-blue-700 font-mono">
                          {item.invoiceNo}
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono tabular-nums">
                          {item.date}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900 truncate max-w-xs">
                          {item.party}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          <div>{item.item}</div>
                          <div className="text-2xs text-slate-400 truncate max-w-xs">
                            {item.description}
                          </div>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">{item.hsn}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-800 font-mono">
                          {item.rate.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-700">
                          {item.pieces}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums font-mono text-slate-700">
                          {item.quantity.toFixed(2)} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums font-bold text-slate-900">
                          {item.amount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-600">
                          {item.cgst > 0
                            ? item.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                            : '-'}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-600">
                          {item.sgst > 0
                            ? item.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                            : '-'}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-600">
                          {item.igst > 0
                            ? item.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={detailsPage}
                totalPages={Math.ceil(detailsData.length / detailsPageSize)}
                totalRecords={detailsData.length}
                pageSize={detailsPageSize}
                onPageChange={setDetailsPage}
                onPageSizeChange={(newSize) => {
                  setDetailsPageSize(newSize);
                  setDetailsPage(1);
                }}
              />
            </div>
          ) : (
            <EmptyState
              title="No Item Records Found"
              description="No item line entries matched your filter selection."
              onAction={handleResetFilters}
            />
          )}
        </>
      )}
    </div>
  );
};
