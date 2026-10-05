import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RotateCcw,
  Eye,
  ArrowUpDown,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PurchaseSummaryItem, PurchaseDetailItem } from '../types';
import { SummaryCard } from '../components/common/SummaryCard';
import { Pagination } from '../components/common/Pagination';
import { ExportButtons } from '../components/common/ExportButtons';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { SearchableSelect } from '../components/common/SearchableSelect';

export const PurchasePage: React.FC = () => {
  const { selectedCompany, selectedFY, formatCurrency, formatNumber } = useApp();

  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');
  const [loading, setLoading] = useState(true);

  // Data states
  const [summaryData, setSummaryData] = useState<PurchaseSummaryItem[]>([]);
  const [detailsData, setDetailsData] = useState<PurchaseDetailItem[]>([]);

  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [searchBill, setSearchBill] = useState('');

  // Pagination states
  const [summaryPage, setSummaryPage] = useState(1);
  const [summaryPageSize, setSummaryPageSize] = useState(10);
  const [detailsPage, setDetailsPage] = useState(1);
  const [detailsPageSize, setDetailsPageSize] = useState(10);

  // Sorting
  const [sortField, setSortField] = useState<string>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Selected bill popup/preview
  const [previewBill, setPreviewBill] = useState<PurchaseSummaryItem | null>(null);

  const fetchSummary = () => {
    setLoading(true);
    api
      .getPurchaseSummary({
        companyId: selectedCompany.id,
        fy: selectedFY,
        supplier: supplierFilter !== 'ALL' ? supplierFilter : undefined,
        search: searchBill || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      .then((res) => {
        if (res.success) {
          setSummaryData(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchDetails = () => {
    setLoading(true);
    api
      .getPurchaseDetails({
        companyId: selectedCompany.id,
        fy: selectedFY,
        supplier: supplierFilter !== 'ALL' ? supplierFilter : undefined,
        search: searchBill || undefined,
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
    setSupplierFilter('ALL');
    setSearchBill('');
    setTimeout(() => {
      if (activeTab === 'summary') fetchSummary();
      else fetchDetails();
    }, 10);
  };

  const suppliersList = useMemo(() => {
    const set = new Set(summaryData.map((s) => s.supplier));
    return Array.from(set);
  }, [summaryData]);

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
      {/* Top Header Row with Tabs & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Purchase Summary (Bill-Wise)
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'details'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Purchase Details (Item-Wise)
          </button>
        </div>

        <ExportButtons
          filename={`purchase-${activeTab}-${selectedFY}`}
          tableData={activeTab === 'summary' ? (summaryData as unknown as Record<string, unknown>[]) : (detailsData as unknown as Record<string, unknown>[])}
        />
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
              Supplier / Creditor
            </label>
            <SearchableSelect
              options={suppliersList}
              value={supplierFilter}
              onChange={setSupplierFilter}
              allOptionLabel="All Suppliers"
              placeholder="Select supplier..."
              searchPlaceholder="Search supplier..."
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Search Bill No.
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchBill}
                onChange={(e) => setSearchBill(e.target.value)}
                placeholder="PUR-2026-..."
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
            onClick={activeTab === 'summary' ? fetchSummary : fetchDetails}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs"
          >
            <Filter className="w-3 h-3" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PURCHASE SUMMARY */}
      {activeTab === 'summary' && (
        <>
          {/* KPI Cards */}
          {loading ? (
            <CardSkeleton count={5} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                label="CGST + SGST"
                value={formatCurrency(summaryTotals.cgst + summaryTotals.sgst)}
                variant="default"
              />
              <SummaryCard
                label="IGST"
                value={formatCurrency(summaryTotals.igst)}
                variant="default"
              />
              <SummaryCard
                label="Gross Purchase"
                value={formatCurrency(summaryTotals.gross)}
                variant="default"
              />
            </div>
          )}

          {/* Table */}
          {loading ? (
            <TableSkeleton rows={8} columns={10} />
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
                        onClick={() => handleSort('billNo')}
                        className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Bill No. <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('supplier')}
                        className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Supplier / Vendor <ArrowUpDown className="w-3 h-3 text-slate-400" />
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
                        <td className="py-2 px-3 font-semibold text-slate-900 font-mono">
                          {item.billNo}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900 max-w-xs truncate">
                          {item.supplier}
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
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => setPreviewBill(item)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-2xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
              title="No Purchase Bills Found"
              description="No purchase vouchers match your filter criteria."
              onAction={handleResetFilters}
            />
          )}
        </>
      )}

      {/* TAB 2: PURCHASE DETAILS */}
      {activeTab === 'details' && (
        <>
          {loading ? (
            <TableSkeleton rows={8} columns={10} />
          ) : detailsData.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] relative">
                <table className="w-full text-left text-xs divide-y divide-slate-200 whitespace-nowrap">
                  <thead className="bg-slate-50 font-semibold text-slate-600 sticky top-0 z-10 border-b border-slate-200 shadow-2xs">
                    <tr>
                      <th className="py-2.5 px-3">Bill No.</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Supplier Name</th>
                      <th className="py-2.5 px-3">Raw Material / Item</th>
                      <th className="py-2.5 px-3">HSN</th>
                      <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Pcs</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Taxable Amount (₹)</th>
                      <th className="py-2.5 px-3 text-right">Tax (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedDetails.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-900 font-mono">
                          {item.billNo}
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono tabular-nums">
                          {item.date}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800 truncate max-w-xs">
                          {item.supplier}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900">{item.item}</td>
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
                          {item.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
              title="No Purchase Details Found"
              description="No itemized purchases found for the selected query."
              onAction={handleResetFilters}
            />
          )}
        </>
      )}

      {/* Bill Details Modal */}
      {previewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                  Purchase Voucher Details
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-mono">
                  {previewBill.billNo}
                </h4>
              </div>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {previewBill.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-semibold text-slate-900">{previewBill.supplier}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Bill Date:</span>
                <span className="font-mono">{previewBill.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">City / Station:</span>
                <span>{previewBill.city}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Pieces / Quantity:</span>
                <span className="font-mono">
                  {previewBill.pieces} Pcs / {previewBill.quantity} {previewBill.unit}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Taxable Value:</span>
                <span className="font-bold tabular-nums">
                  ₹ {previewBill.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">GST Breakdown:</span>
                <span className="font-mono text-slate-700">
                  CGST: ₹{previewBill.cgst} | SGST: ₹{previewBill.sgst} | IGST: ₹{previewBill.igst}
                </span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-sm text-slate-900">
                <span>Gross Payable:</span>
                <span className="text-blue-700 tabular-nums">
                  ₹ {previewBill.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewBill(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
