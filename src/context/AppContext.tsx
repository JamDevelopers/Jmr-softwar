import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, UserProfile, DateFilterType } from '../types';
import { MOCK_COMPANIES } from '../services/mockData';

export type NavPage =
  | 'dashboard'
  | 'sales'
  | 'purchase'
  | 'ledger'
  | 'outstanding'
  | 'invoice-preview'
  | 'companies'
  | 'settings';

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (emailOrMobile: string, role?: 'Director' | 'Auditor' | 'Accountant') => void;
  logout: () => void;

  // Company & Current FY (Only current year data supported)
  companies: Company[];
  selectedCompany: Company;
  selectCompany: (companyId: string) => void;
  selectedFY: string;

  // Navigation
  currentPage: NavPage;
  setCurrentPage: (page: NavPage) => void;
  viewInvoiceId: number | null;
  openInvoicePreview: (invoiceId: number) => void;

  // Global Date Filter
  dateFilter: DateFilterType;
  setDateFilter: (filter: DateFilterType) => void;
  customDateFrom: string;
  setCustomDateFrom: (d: string) => void;
  customDateTo: string;
  setCustomDateTo: (d: string) => void;

  // Sync Details Modal
  isSyncModalOpen: boolean;
  setSyncModalOpen: (open: boolean) => void;
  triggerSyncRefresh: () => void;
  isSyncing: boolean;

  // Global Search Modal
  isSearchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // Utilities
  formatCurrency: (amount: number) => string;
  formatNumber: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>({
    id: 'USR-892',
    name: 'Rajesh Shah',
    email: 'rajesh.shah@rajmills.com',
    phone: '+91 98251 77660',
    role: 'Director',
    accessibleCompanies: ['CMP-101', 'CMP-102', 'CMP-103', 'CMP-104'],
  });

  const [companies] = useState<Company[]>(MOCK_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState<Company>(MOCK_COMPANIES[0]);
  // Strictly current financial year data
  const selectedFY = selectedCompany.currentFY;

  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(42);

  const [dateFilter, setDateFilter] = useState<DateFilterType>('this_fy');
  const [customDateFrom, setCustomDateFrom] = useState<string>('2026-04-01');
  const [customDateTo, setCustomDateTo] = useState<string>('2026-10-05');

  const [isSyncModalOpen, setSyncModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState<boolean>(false);

  const selectCompany = (companyId: string) => {
    const found = companies.find((c) => c.id === companyId);
    if (found) {
      setSelectedCompany(found);
    }
  };

  const login = (emailOrMobile: string, role: 'Director' | 'Auditor' | 'Accountant' = 'Director') => {
    setIsAuthenticated(true);
    setUser({
      id: 'USR-892',
      name: emailOrMobile.includes('@') ? emailOrMobile.split('@')[0].toUpperCase() : 'Rajesh Shah',
      email: emailOrMobile.includes('@') ? emailOrMobile : 'rajesh.shah@rajmills.com',
      phone: '+91 98251 77660',
      role,
      accessibleCompanies: ['CMP-101', 'CMP-102', 'CMP-103', 'CMP-104'],
    });
    setCurrentPage('dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const openInvoicePreview = (invoiceId: number) => {
    setViewInvoiceId(invoiceId);
    setCurrentPage('invoice-preview');
  };

  const triggerSyncRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 900);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        companies,
        selectedCompany,
        selectCompany,
        selectedFY,
        currentPage,
        setCurrentPage,
        viewInvoiceId,
        openInvoicePreview,
        dateFilter,
        setDateFilter,
        customDateFrom,
        setCustomDateFrom,
        customDateTo,
        setCustomDateTo,
        isSyncModalOpen,
        setSyncModalOpen,
        triggerSyncRefresh,
        isSyncing,
        isSearchModalOpen,
        setSearchModalOpen,
        formatCurrency,
        formatNumber,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
