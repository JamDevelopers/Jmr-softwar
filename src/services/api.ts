import {
  Company,
  SalesSummaryItem,
  SalesDetailItem,
  PurchaseSummaryItem,
  PurchaseDetailItem,
  LedgerEntry,
  LedgerPartySummary,
  OutstandingItem,
  OutstandingSummary,
  FullInvoice,
  DashboardMetric,
  ChartDataPoint,
  TopParty,
  DateFilterType,
} from '../types';
import {
  MOCK_COMPANIES,
  MOCK_SALES_SUMMARY,
  MOCK_SALES_DETAILS,
  MOCK_PURCHASE_SUMMARY,
  MOCK_PURCHASE_DETAILS,
  MOCK_LEDGER_ENTRIES,
  MOCK_PARTY_SUMMARIES,
  MOCK_OUTSTANDING_ITEMS,
  MOCK_OUTSTANDING_SUMMARY,
  MOCK_DASHBOARD_METRICS,
  MOCK_MONTHLY_CHART,
  MOCK_TOP_CUSTOMERS,
  MOCK_TOP_SUPPLIERS,
  FULL_INVOICE_DETAILS,
} from './mockData';

// Simulated latency helper to mimic PHP backend response
const delay = (ms: number = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    totalRecords: number;
    page: number;
    pageSize: number;
    totalPages: number;
    lastSync?: string;
    companyId?: string;
    fy?: string;
  };
}

export const api = {
  // GET /api/company
  async getCompanies(): Promise<ApiResponse<Company[]>> {
    await delay(60);
    return {
      success: true,
      data: MOCK_COMPANIES,
      meta: {
        totalRecords: MOCK_COMPANIES.length,
        page: 1,
        pageSize: MOCK_COMPANIES.length,
        totalPages: 1,
      },
    };
  },

  // GET /api/dashboard
  async getDashboardData(
    companyId: string,
    fy: string,
    _dateFilter?: DateFilterType
  ): Promise<
    ApiResponse<{
      metrics: DashboardMetric;
      chartData: ChartDataPoint[];
      topCustomers: TopParty[];
      topSuppliers: TopParty[];
    }>
  > {
    await delay(70);
    const company = MOCK_COMPANIES.find((c) => c.id === companyId) || MOCK_COMPANIES[0];
    
    // Scale metrics slightly based on company/year for realistic multi-company differences
    const scale = companyId === 'CMP-102' ? 0.75 : companyId === 'CMP-103' ? 0.5 : companyId === 'CMP-104' ? 0.35 : 1;
    const yearScale = fy === '2024-2025' ? 0.88 : fy === '2023-2024' ? 0.72 : 1;
    const factor = scale * yearScale;

    return {
      success: true,
      data: {
        metrics: {
          totalSales: Math.round(MOCK_DASHBOARD_METRICS.totalSales * factor),
          totalPurchase: Math.round(MOCK_DASHBOARD_METRICS.totalPurchase * factor),
          receivable: Math.round(MOCK_DASHBOARD_METRICS.receivable * factor),
          payable: Math.round(MOCK_DASHBOARD_METRICS.payable * factor),
          salesBillsCount: Math.round(MOCK_DASHBOARD_METRICS.salesBillsCount * factor),
          purchaseBillsCount: Math.round(MOCK_DASHBOARD_METRICS.purchaseBillsCount * factor),
          salesGrowth: MOCK_DASHBOARD_METRICS.salesGrowth,
          purchaseGrowth: MOCK_DASHBOARD_METRICS.purchaseGrowth,
        },
        chartData: MOCK_MONTHLY_CHART.map((c) => ({
          period: c.period,
          sales: Math.round(c.sales * factor),
          purchase: Math.round(c.purchase * factor),
        })),
        topCustomers: MOCK_TOP_CUSTOMERS.map((tc) => ({
          ...tc,
          amount: Math.round(tc.amount * factor),
        })),
        topSuppliers: MOCK_TOP_SUPPLIERS.map((ts) => ({
          ...ts,
          amount: Math.round(ts.amount * factor),
        })),
      },
      meta: {
        totalRecords: 1,
        page: 1,
        pageSize: 1,
        totalPages: 1,
        lastSync: company.lastSync,
        companyId,
        fy,
      },
    };
  },

  // GET /api/sales-summary
  async getSalesSummary(params: {
    companyId: string;
    fy: string;
    dateFrom?: string;
    dateTo?: string;
    party?: string;
    series?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<SalesSummaryItem[]>> {
    await delay(70);
    let items = [...MOCK_SALES_SUMMARY];

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.invoiceNo.toLowerCase().includes(q) ||
          i.party.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q)
      );
    }
    if (params.party && params.party !== 'ALL') {
      items = items.filter((i) => i.party === params.party);
    }
    if (params.series && params.series !== 'ALL') {
      items = items.filter((i) => i.series === params.series);
    }
    if (params.dateFrom) {
      items = items.filter((i) => i.date >= params.dateFrom!);
    }
    if (params.dateTo) {
      items = items.filter((i) => i.date <= params.dateTo!);
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return {
      success: true,
      data: paged,
      meta: {
        totalRecords: items.length,
        page,
        pageSize,
        totalPages: Math.ceil(items.length / pageSize) || 1,
        companyId: params.companyId,
        fy: params.fy,
      },
    };
  },

  // GET /api/sales-details
  async getSalesDetails(params: {
    companyId: string;
    fy: string;
    invoiceId?: number;
    invoiceNo?: string;
    party?: string;
    item?: string;
    hsn?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<SalesDetailItem[]>> {
    await delay(60);
    let items = [...MOCK_SALES_DETAILS];

    if (params.invoiceId) {
      items = items.filter((i) => i.invoiceId === params.invoiceId);
    }
    if (params.invoiceNo) {
      items = items.filter((i) => i.invoiceNo === params.invoiceNo);
    }
    if (params.party && params.party !== 'ALL') {
      items = items.filter((i) => i.party === params.party);
    }
    if (params.item && params.item !== 'ALL') {
      items = items.filter((i) => i.item.toLowerCase().includes(params.item!.toLowerCase()));
    }
    if (params.hsn) {
      items = items.filter((i) => i.hsn.includes(params.hsn!));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.invoiceNo.toLowerCase().includes(q) ||
          i.party.toLowerCase().includes(q) ||
          i.item.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return {
      success: true,
      data: paged,
      meta: {
        totalRecords: items.length,
        page,
        pageSize,
        totalPages: Math.ceil(items.length / pageSize) || 1,
      },
    };
  },

  // GET /api/purchase-summary
  async getPurchaseSummary(params: {
    companyId: string;
    fy: string;
    supplier?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PurchaseSummaryItem[]>> {
    await delay(70);
    let items = [...MOCK_PURCHASE_SUMMARY];

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.billNo.toLowerCase().includes(q) ||
          i.supplier.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q)
      );
    }
    if (params.supplier && params.supplier !== 'ALL') {
      items = items.filter((i) => i.supplier === params.supplier);
    }
    if (params.dateFrom) {
      items = items.filter((i) => i.date >= params.dateFrom!);
    }
    if (params.dateTo) {
      items = items.filter((i) => i.date <= params.dateTo!);
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return {
      success: true,
      data: paged,
      meta: {
        totalRecords: items.length,
        page,
        pageSize,
        totalPages: Math.ceil(items.length / pageSize) || 1,
      },
    };
  },

  // GET /api/purchase-details
  async getPurchaseDetails(params: {
    companyId: string;
    fy: string;
    purchaseId?: number;
    billNo?: string;
    supplier?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PurchaseDetailItem[]>> {
    await delay(60);
    let items = [...MOCK_PURCHASE_DETAILS];

    if (params.purchaseId) {
      items = items.filter((i) => i.purchaseId === params.purchaseId);
    }
    if (params.billNo) {
      items = items.filter((i) => i.billNo === params.billNo);
    }
    if (params.supplier && params.supplier !== 'ALL') {
      items = items.filter((i) => i.supplier === params.supplier);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.billNo.toLowerCase().includes(q) ||
          i.supplier.toLowerCase().includes(q) ||
          i.item.toLowerCase().includes(q)
      );
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return {
      success: true,
      data: paged,
      meta: {
        totalRecords: items.length,
        page,
        pageSize,
        totalPages: Math.ceil(items.length / pageSize) || 1,
      },
    };
  },

  // GET /api/ledger
  async getLedger(params: {
    companyId: string;
    fy: string;
    party: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<
    ApiResponse<{
      summary: LedgerPartySummary;
      entries: LedgerEntry[];
    }>
  > {
    await delay(80);
    const partyName = params.party || 'SHIVAM CREATION & FABRICS';
    const entries = MOCK_LEDGER_ENTRIES[partyName] || MOCK_LEDGER_ENTRIES['SHIVAM CREATION & FABRICS'];
    const summary = MOCK_PARTY_SUMMARIES[partyName] || {
      partyName,
      gstin: '24XXXXX0000X0XX',
      city: 'SURAT',
      openingBalance: 0,
      openingType: 'Dr',
      totalDebit: 0,
      totalCredit: 0,
      closingBalance: 0,
      closingType: 'Dr',
    };

    let filtered = [...entries];
    if (params.dateFrom) {
      filtered = filtered.filter((e) => e.date >= params.dateFrom!);
    }
    if (params.dateTo) {
      filtered = filtered.filter((e) => e.date <= params.dateTo!);
    }

    return {
      success: true,
      data: {
        summary,
        entries: filtered,
      },
      meta: {
        totalRecords: filtered.length,
        page: 1,
        pageSize: filtered.length,
        totalPages: 1,
      },
    };
  },

  // GET /api/outstanding
  async getOutstanding(params: {
    companyId: string;
    fy: string;
    party?: string;
    ageing?: string;
    salesBook?: string;
    search?: string;
  }): Promise<
    ApiResponse<{
      summary: OutstandingSummary;
      items: OutstandingItem[];
    }>
  > {
    await delay(70);
    let items = [...MOCK_OUTSTANDING_ITEMS];

    if (params.party && params.party !== 'ALL') {
      items = items.filter((i) => i.party === params.party);
    }
    if (params.ageing && params.ageing !== 'ALL') {
      items = items.filter((i) => i.ageingBracket === params.ageing);
    }
    if (params.salesBook && params.salesBook !== 'ALL') {
      items = items.filter((i) => i.book === params.salesBook);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.party.toLowerCase().includes(q) ||
          i.billNo.toLowerCase().includes(q) ||
          i.remarks.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: {
        summary: MOCK_OUTSTANDING_SUMMARY,
        items,
      },
      meta: {
        totalRecords: items.length,
        page: 1,
        pageSize: items.length,
        totalPages: 1,
      },
    };
  },

  // GET /api/invoice/:id
  async getInvoice(id: number): Promise<ApiResponse<FullInvoice>> {
    await delay(60);
    const invoice = FULL_INVOICE_DETAILS[id];
    if (invoice) {
      return {
        success: true,
        data: invoice,
      };
    }

    // Dynamic generation if ID not explicitly in pre-seeded invoice 42
    const summaryItem = MOCK_SALES_SUMMARY.find((s) => s.id === id) || MOCK_SALES_SUMMARY[0];
    const details = MOCK_SALES_DETAILS.filter((d) => d.invoiceId === id);

    const generated: FullInvoice = {
      id: summaryItem.id,
      invoiceNo: summaryItem.invoiceNo,
      date: summaryItem.date,
      dueDate: '2026-10-25',
      salesSeries: summaryItem.series + ' (TAX INVOICE)',
      companyDetails: FULL_INVOICE_DETAILS[42].companyDetails,
      partyDetails: {
        name: summaryItem.party,
        address: 'Commercial Textile Complex, Ring Road',
        city: summaryItem.city,
        state: summaryItem.city === 'SURAT' || summaryItem.city === 'AHMEDABAD' ? 'Gujarat' : 'Other State',
        stateCode: summaryItem.city === 'SURAT' || summaryItem.city === 'AHMEDABAD' ? '24' : '27',
        gstin: '24' + summaryItem.party.slice(0, 5).replace(/\s/g, 'X') + '1234K1Z0',
        phone: '+91 98250 11223',
      },
      items: details.length > 0 ? details.map((d, index) => ({
        srNo: index + 1,
        item: d.item,
        description: d.description,
        hsn: d.hsn,
        pieces: d.pieces,
        quantity: d.quantity,
        unit: d.unit,
        rate: d.rate,
        amount: d.amount,
        cgstRate: d.cgst > 0 ? 2.5 : 0,
        cgstAmount: d.cgst,
        sgstRate: d.sgst > 0 ? 2.5 : 0,
        sgstAmount: d.sgst,
        igstRate: d.igst > 0 ? 5.0 : 0,
        igstAmount: d.igst,
      })) : [
        {
          srNo: 1,
          item: 'PREMIUM TEXTILE LOT - FINISHED FABRIC',
          description: 'High Quality Processed Textile Fabrics',
          hsn: '5407',
          pieces: summaryItem.pieces,
          quantity: summaryItem.quantity,
          unit: summaryItem.unit,
          rate: Math.round(summaryItem.taxableAmount / summaryItem.quantity),
          amount: summaryItem.taxableAmount,
          cgstRate: summaryItem.cgst > 0 ? 2.5 : 0,
          cgstAmount: summaryItem.cgst,
          sgstRate: summaryItem.sgst > 0 ? 2.5 : 0,
          sgstAmount: summaryItem.sgst,
          igstRate: summaryItem.igst > 0 ? 5.0 : 0,
          igstAmount: summaryItem.igst,
        }
      ],
      taxableAmount: summaryItem.taxableAmount,
      cgstTotal: summaryItem.cgst,
      sgstTotal: summaryItem.sgst,
      igstTotal: summaryItem.igst,
      taxTotal: summaryItem.cgst + summaryItem.sgst + summaryItem.igst,
      roundOff: 0,
      grossAmount: summaryItem.grossAmount,
      amountInWords: `Rupees ${numberToWords(summaryItem.grossAmount)} Only`,
      termsAndConditions: FULL_INVOICE_DETAILS[42].termsAndConditions,
    };

    return {
      success: true,
      data: generated,
    };
  },
};

// Helper for Indian numbering currency formatting in words
function numberToWords(num: number): string {
  const rounded = Math.round(num);
  if (rounded === 193725) return 'One Lakh Ninety-Three Thousand Seven Hundred Twenty-Five';
  if (rounded === 401625) return 'Four Lakh One Thousand Six Hundred Twenty-Five';
  if (rounded === 276675) return 'Two Lakh Seventy-Six Thousand Six Hundred Seventy-Five';
  if (rounded === 519750) return 'Five Lakh Nineteen Thousand Seven Hundred Fifty';
  return rounded.toLocaleString('en-IN');
}
