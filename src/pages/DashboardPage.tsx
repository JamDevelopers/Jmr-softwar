import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Clock,
  RefreshCw,
  Building,
  Calendar,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DashboardMetric, ChartDataPoint, TopParty, DateFilterType } from '../types';
import { SummaryCard } from '../components/common/SummaryCard';
import { CardSkeleton, ChartSkeleton } from '../components/common/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const {
    selectedCompany,
    selectedFY,
    dateFilter,
    setDateFilter,
    formatCurrency,
    formatNumber,
    setCurrentPage,
    setSyncModalOpen,
  } = useApp();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetric | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopParty[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<TopParty[]>([]);
  const [chartView, setChartView] = useState<'sales' | 'purchase' | 'both'>('both');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .getDashboardData(selectedCompany.id, selectedFY, dateFilter)
      .then((res) => {
        if (isMounted && res.success) {
          setMetrics(res.data.metrics);
          setChartData(res.data.chartData);
          setTopCustomers(res.data.topCustomers);
          setTopSuppliers(res.data.topSuppliers);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCompany.id, selectedFY, dateFilter]);

  const dateFilterOptions: { key: DateFilterType; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'this_fy', label: 'This Financial Year' },
    { key: 'custom', label: 'Custom Date' },
  ];

  // Helper for SVG chart maximum calculation
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.sales, d.purchase)),
    100000
  );

  return (
    <div className="space-y-5">
      {/* Top Banner: Company Info + Sync Status + Date Filter */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {selectedCompany.name}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                FY {selectedFY}
              </span>
            </div>

            <div className="flex items-center gap-3 text-2xs text-slate-500 mt-1 flex-wrap font-medium">
              <span className="font-mono">GSTIN: {selectedCompany.gstin}</span>
              <span>·</span>
              <span>{selectedCompany.city}, {selectedCompany.state}</span>
              <span>·</span>
              <button
                onClick={() => setSyncModalOpen(true)}
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Last Sync: {selectedCompany.lastSync}</span>
              </button>
            </div>
          </div>

          {/* Date Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md self-start lg:self-auto overflow-x-auto max-w-full">
            {dateFilterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDateFilter(opt.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  dateFilter === opt.key
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      {loading || !metrics ? (
        <CardSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <SummaryCard
            label="Total Sales"
            value={formatCurrency(metrics.totalSales)}
            subValue={`${metrics.salesBillsCount} Bills issued`}
            variant="primary"
            icon={TrendingUp}
            trend={{ value: `+${metrics.salesGrowth}%`, isPositive: true }}
            onClick={() => setCurrentPage('sales')}
          />
          <SummaryCard
            label="Total Purchase"
            value={formatCurrency(metrics.totalPurchase)}
            subValue={`${metrics.purchaseBillsCount} Inward bills`}
            variant="default"
            icon={ShoppingBag}
            trend={{ value: `+${metrics.purchaseGrowth}%`, isPositive: true }}
            onClick={() => setCurrentPage('purchase')}
          />
          <SummaryCard
            label="Receivable"
            value={formatCurrency(metrics.receivable)}
            subValue="From Debtors"
            variant="danger"
            icon={Clock}
            onClick={() => setCurrentPage('outstanding')}
          />
          <SummaryCard
            label="Payable"
            value={formatCurrency(metrics.payable)}
            subValue="To Creditors"
            variant="warning"
            icon={Building}
            onClick={() => setCurrentPage('purchase')}
          />
          <SummaryCard
            label="Sales Bills"
            value={formatNumber(metrics.salesBillsCount)}
            subValue="Avg. ₹ 33.2k/bill"
            variant="default"
            icon={FileText}
            onClick={() => setCurrentPage('sales')}
          />
          <SummaryCard
            label="Purchase Bills"
            value={formatNumber(metrics.purchaseBillsCount)}
            subValue="Avg. ₹ 38.3k/bill"
            variant="default"
            icon={FileText}
            onClick={() => setCurrentPage('purchase')}
          />
        </div>
      )}

      {/* Middle Section: Trends & Receivable Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales & Purchase Trend Chart (2 columns on lg) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Sales & Purchase Trend
              </h3>
              <p className="text-xs text-slate-500">
                Monthly turnover comparison for FY {selectedFY}
              </p>
            </div>

            {/* Chart toggle controls */}
            <div className="flex items-center gap-1 text-xs bg-slate-100 p-0.5 rounded">
              <button
                onClick={() => setChartView('both')}
                className={`px-2 py-0.5 rounded text-2xs font-semibold cursor-pointer ${
                  chartView === 'both' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Comparison
              </button>
              <button
                onClick={() => setChartView('sales')}
                className={`px-2 py-0.5 rounded text-2xs font-semibold cursor-pointer ${
                  chartView === 'sales' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Sales Only
              </button>
              <button
                onClick={() => setChartView('purchase')}
                className={`px-2 py-0.5 rounded text-2xs font-semibold cursor-pointer ${
                  chartView === 'purchase' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Purchase Only
              </button>
            </div>
          </div>

          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="space-y-4">
              {/* Responsive SVG Chart */}
              <div className="h-56 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = 180 - ratio * 150;
                    return (
                      <g key={idx}>
                        <line
                          x1="40"
                          y1={y}
                          x2="690"
                          y2={y}
                          stroke="#F1F5F9"
                          strokeDasharray="3 3"
                        />
                        <text
                          x="35"
                          y={y + 3}
                          fontSize="9"
                          fill="#94A3B8"
                          textAnchor="end"
                          className="font-mono"
                        >
                          ₹{Math.round(((ratio * maxVal) / 100000) * 10) / 10}L
                        </text>
                      </g>
                    );
                  })}

                  {/* Bars for Each Month */}
                  {chartData.map((d, index) => {
                    const step = 640 / (chartData.length || 1);
                    const x = 50 + index * step;
                    const barWidth = chartView === 'both' ? step * 0.32 : step * 0.55;

                    const salesH = (d.sales / maxVal) * 150;
                    const purchaseH = (d.purchase / maxVal) * 150;

                    return (
                      <g key={d.period} className="group cursor-pointer">
                        {/* Sales Bar */}
                        {(chartView === 'both' || chartView === 'sales') && (
                          <rect
                            x={chartView === 'both' ? x : x + step * 0.15}
                            y={180 - salesH}
                            width={barWidth}
                            height={salesH}
                            fill="#2563EB"
                            rx="2"
                            className="transition-all hover:opacity-85"
                          >
                            <title>{`${d.period} Sales: ₹${d.sales.toLocaleString('en-IN')}`}</title>
                          </rect>
                        )}

                        {/* Purchase Bar */}
                        {(chartView === 'both' || chartView === 'purchase') && (
                          <rect
                            x={chartView === 'both' ? x + barWidth + 3 : x + step * 0.15}
                            y={180 - purchaseH}
                            width={barWidth}
                            height={purchaseH}
                            fill="#94A3B8"
                            rx="2"
                            className="transition-all hover:opacity-85"
                          >
                            <title>{`${d.period} Purchase: ₹${d.purchase.toLocaleString('en-IN')}`}</title>
                          </rect>
                        )}

                        {/* X-axis label */}
                        <text
                          x={x + step * 0.35}
                          y="196"
                          fontSize="10"
                          fill="#64748B"
                          textAnchor="middle"
                          className="font-medium"
                        >
                          {d.period.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-blue-600" />
                  <span className="text-slate-700 font-medium">Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-slate-400" />
                  <span className="text-slate-700 font-medium">Purchase</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Receivable / Ageing Distribution Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Receivables Ageing
              </h3>
              <button
                onClick={() => setCurrentPage('outstanding')}
                className="text-2xs text-blue-600 hover:underline flex items-center font-medium"
              >
                Full Report <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Overdue analysis by payment delay brackets
            </p>

            {/* Ageing Brackets Progress Stack */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Current (&lt; 1 Day)</span>
                  <span className="font-semibold text-slate-900 tabular-nums">₹ 4,95,350 (19%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '19%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">1 - 30 Days</span>
                  <span className="font-semibold text-slate-900 tabular-nums">₹ 13,58,725 (51%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '51%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">31 - 60 Days</span>
                  <span className="font-semibold text-slate-900 tabular-nums">₹ 2,84,000 (11%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '11%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">61 - 90 Days</span>
                  <span className="font-semibold text-slate-900 tabular-nums">₹ 1,48,000 (6%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: '6%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">90+ Days (Overdue)</span>
                  <span className="font-semibold text-rose-600 tabular-nums">₹ 3,60,000 (13%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: '13%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 p-4 rounded-b-lg flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Total Pending:</span>
            <span className="font-bold text-slate-900 tabular-nums text-sm">
              ₹ 26,46,075.00
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Customers & Top Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Customers */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Customers</h3>
              <p className="text-xs text-slate-500">By sales turnover in current period</p>
            </div>
            <button
              onClick={() => setCurrentPage('sales')}
              className="text-2xs text-blue-600 hover:underline flex items-center font-medium"
            >
              View Sales <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topCustomers.map((cust, idx) => (
              <div
                key={cust.name}
                onClick={() => setCurrentPage('ledger')}
                className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-5 text-center text-2xs font-mono font-bold text-slate-400">
                    0{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{cust.name}</p>
                    <p className="text-2xs text-slate-400">{cust.city} · {cust.billsCount} Bills</p>
                  </div>
                </div>
                <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                  {formatCurrency(cust.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Suppliers</h3>
              <p className="text-xs text-slate-500">By purchase volume in current period</p>
            </div>
            <button
              onClick={() => setCurrentPage('purchase')}
              className="text-2xs text-blue-600 hover:underline flex items-center font-medium"
            >
              View Purchases <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topSuppliers.map((supp, idx) => (
              <div
                key={supp.name}
                onClick={() => setCurrentPage('purchase')}
                className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-5 text-center text-2xs font-mono font-bold text-slate-400">
                    0{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{supp.name}</p>
                    <p className="text-2xs text-slate-400">{supp.city} · {supp.billsCount} Bills</p>
                  </div>
                </div>
                <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                  {formatCurrency(supp.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
