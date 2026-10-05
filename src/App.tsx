/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SalesPage } from './pages/SalesPage';
import { PurchasePage } from './pages/PurchasePage';
import { LedgerPage } from './pages/LedgerPage';
import { OutstandingPage } from './pages/OutstandingPage';
import { InvoicePreviewPage } from './pages/InvoicePreviewPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { isAuthenticated, currentPage, selectedCompany, selectedFY } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <AppLayout
            pageTitle="Financial & Accounting Dashboard"
            pageSubtitle={`Overview for ${selectedCompany.name} · FY ${selectedFY}`}
          >
            <DashboardPage />
          </AppLayout>
        );

      case 'sales':
        return (
          <AppLayout
            pageTitle="Sales Register & Analysis"
            pageSubtitle={`Bill-wise summary and item-level details for ${selectedCompany.name}`}
          >
            <SalesPage />
          </AppLayout>
        );

      case 'purchase':
        return (
          <AppLayout
            pageTitle="Purchase Register & Inward"
            pageSubtitle={`Supplier bills and raw materials register for ${selectedCompany.name}`}
          >
            <PurchasePage />
          </AppLayout>
        );

      case 'ledger':
        return (
          <AppLayout
            pageTitle="Party Ledger Statement"
            pageSubtitle="Party-wise debit and credit journal with running balances"
          >
            <LedgerPage />
          </AppLayout>
        );

      case 'outstanding':
        return (
          <AppLayout
            pageTitle="Outstanding Receivables"
            pageSubtitle="Debtor payment overdue analysis and ageing brackets"
          >
            <OutstandingPage />
          </AppLayout>
        );

      case 'invoice-preview':
        return (
          <AppLayout
            pageTitle="Sales Invoice Preview"
            pageSubtitle="Print-ready original tax invoice document (A4 Format)"
          >
            <InvoicePreviewPage />
          </AppLayout>
        );

      case 'companies':
        return (
          <AppLayout
            pageTitle="Company Directory"
            pageSubtitle="Switch between multi-entity accounting ledgers"
          >
            <CompaniesPage />
          </AppLayout>
        );

      case 'settings':
        return (
          <AppLayout
            pageTitle="System & Sync Settings"
            pageSubtitle="Windows push daemon configuration and API endpoint diagnostics"
          >
            <SettingsPage />
          </AppLayout>
        );

      default:
        return (
          <AppLayout pageTitle="Dashboard">
            <DashboardPage />
          </AppLayout>
        );
    }
  };

  return renderCurrentPage();
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
