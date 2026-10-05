export interface Company {
  id: string;
  name: string;
  gstin: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  email: string;
  currentFY: string;
  lastSync: string;
  syncStatus: 'synced' | 'syncing' | 'failed';
  recordsUpdated: number;
  softwareSource: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Auditor' | 'Director' | 'Accountant';
  accessibleCompanies: string[];
}

export interface SalesSummaryItem {
  id: number;
  date: string;
  invoiceNo: string;
  party: string;
  city: string;
  series: string;
  salesBook: string;
  pieces: number;
  quantity: number;
  unit: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grossAmount: number;
  status: 'Paid' | 'Unpaid' | 'Partial';
}

export interface SalesDetailItem {
  id: number;
  invoiceId: number;
  invoiceNo: string;
  date: string;
  party: string;
  item: string;
  description: string;
  hsn: string;
  rate: number;
  pieces: number;
  quantity: number;
  unit: string;
  amount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface PurchaseSummaryItem {
  id: number;
  date: string;
  billNo: string;
  supplier: string;
  city: string;
  pieces: number;
  quantity: number;
  unit: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grossAmount: number;
  status: 'Paid' | 'Pending';
}

export interface PurchaseDetailItem {
  id: number;
  purchaseId: number;
  billNo: string;
  date: string;
  supplier: string;
  item: string;
  hsn: string;
  rate: number;
  pieces: number;
  quantity: number;
  unit: string;
  amount: number;
  tax: number;
}

export interface LedgerEntry {
  id: number;
  date: string;
  reference: string;
  billNo: string;
  voucherNo: string;
  voucherType: 'Sale' | 'Purchase' | 'Receipt' | 'Payment' | 'Journal' | 'Opening';
  debit: number;
  credit: number;
  balance: number;
  balanceType: 'Dr' | 'Cr';
  remarks: string;
}

export interface LedgerPartySummary {
  partyName: string;
  gstin: string;
  city: string;
  openingBalance: number;
  openingType: 'Dr' | 'Cr';
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  closingType: 'Dr' | 'Cr';
}

export interface OutstandingItem {
  id: number;
  party: string;
  book: string;
  billNo: string;
  billDate: string;
  amount: number;
  received: number;
  discount: number;
  balance: number;
  receiptDate: string;
  daysOutstanding: number;
  ageingBracket: 'Current' | '1-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days';
  remarks: string;
}

export interface OutstandingSummary {
  totalOutstanding: number;
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
}

export interface InvoiceItem {
  srNo: number;
  item: string;
  description: string;
  hsn: string;
  pieces: number;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
}

export interface FullInvoice {
  id: number;
  invoiceNo: string;
  date: string;
  dueDate: string;
  salesSeries: string;
  companyDetails: {
    name: string;
    address: string;
    city: string;
    state: string;
    stateCode: string;
    gstin: string;
    pan: string;
    phone: string;
    email: string;
    bankName: string;
    accountNo: string;
    ifsc: string;
    branch: string;
  };
  partyDetails: {
    name: string;
    address: string;
    city: string;
    state: string;
    stateCode: string;
    gstin: string;
    phone: string;
  };
  items: InvoiceItem[];
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  roundOff: number;
  grossAmount: number;
  amountInWords: string;
  termsAndConditions: string[];
}

export interface DashboardMetric {
  totalSales: number;
  totalPurchase: number;
  receivable: number;
  payable: number;
  salesBillsCount: number;
  purchaseBillsCount: number;
  salesGrowth: number;
  purchaseGrowth: number;
}

export interface ChartDataPoint {
  period: string;
  sales: number;
  purchase: number;
}

export interface TopParty {
  name: string;
  city: string;
  amount: number;
  billsCount: number;
}

export type DateFilterType = 'today' | 'this_week' | 'this_month' | 'this_fy' | 'custom';
