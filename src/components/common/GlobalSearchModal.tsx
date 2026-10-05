import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, ArrowRight, Building2, User, CreditCard, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setSearchModalOpen,
    openInvoicePreview,
    setCurrentPage,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  // Search items list
  const allItems = [
    {
      category: 'Invoices',
      title: 'INV-2026-0042 · SHIVAM CREATION & FABRICS (₹ 1,93,725.00)',
      sub: 'Tax Invoice · Date: 04 Oct 2026',
      icon: FileText,
      action: () => {
        openInvoicePreview(42);
        setSearchModalOpen(false);
      },
    },
    {
      category: 'Invoices',
      title: 'INV-2026-0041 · AMBICA TEXTILES LTD (₹ 4,01,625.00)',
      sub: 'Tax Invoice · Date: 03 Oct 2026',
      icon: FileText,
      action: () => {
        openInvoicePreview(41);
        setSearchModalOpen(false);
      },
    },
    {
      category: 'Parties',
      title: 'SHIVAM CREATION & FABRICS',
      sub: 'Customer · Balance: ₹ 6,73,925.00 Dr · Surat',
      icon: User,
      action: () => {
        setCurrentPage('ledger');
        setSearchModalOpen(false);
      },
    },
    {
      category: 'Parties',
      title: 'AMBICA TEXTILES LTD',
      sub: 'Customer · Balance: ₹ 9,75,500.00 Dr · Mumbai',
      icon: User,
      action: () => {
        setCurrentPage('ledger');
        setSearchModalOpen(false);
      },
    },
    {
      category: 'Parties',
      title: 'RELIANCE INDUSTRIES YARN DIV',
      sub: 'Supplier · Hazira, Surat',
      icon: Building2,
      action: () => {
        setCurrentPage('purchase');
        setSearchModalOpen(false);
      },
    },
    {
      category: 'Reports',
      title: 'Outstanding Receivables & Ageing Analysis',
      sub: 'View 0-30, 31-60, 61-90, 90+ days aging breakdown',
      icon: CreditCard,
      action: () => {
        setCurrentPage('outstanding');
        setSearchModalOpen(false);
      },
    },
    {
      category: 'Reports',
      title: 'Sales Summary & Register',
      sub: 'Bill-wise sales register with GST breakdown',
      icon: FileText,
      action: () => {
        setCurrentPage('sales');
        setSearchModalOpen(false);
      },
    },
    {
      category: 'Reports',
      title: 'Purchase Summary & Register',
      sub: 'Inward purchase bills and supplier summaries',
      icon: FileText,
      action: () => {
        setCurrentPage('purchase');
        setSearchModalOpen(false);
      },
    },
  ];

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.sub.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search party, invoice no., bill, item, or report..."
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-2xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={item.action}
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-700">
                        {item.title}
                      </p>
                      <p className="text-2xs text-slate-500 truncate">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0 transition-colors" />
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching records found for "{query}". Try party name, city, or invoice number.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-2xs text-slate-400">
          <span>Press Enter to select</span>
          <span className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3" /> Quick jump
          </span>
        </div>
      </div>
    </div>
  );
};
