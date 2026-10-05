import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  ArrowLeft,
  Building,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { FullInvoice } from '../types';

export const InvoicePreviewPage: React.FC = () => {
  const { viewInvoiceId, setCurrentPage, formatCurrency } = useApp();
  const [invoice, setInvoice] = useState<FullInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const idToFetch = viewInvoiceId || 42;
    setLoading(true);
    api
      .getInvoice(idToFetch)
      .then((res) => {
        if (res.success) {
          setInvoice(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [viewInvoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  if (loading || !invoice) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading Tax Invoice details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs no-print">
        <button
          onClick={() => setCurrentPage('sales')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sales Register</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice (A4)</span>
          </button>
        </div>
      </div>

      {/* A4 Tax Invoice Paper Container */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-md p-6 sm:p-10 invoice-a4-print font-sans text-slate-900 leading-normal">
        {/* Invoice Title Bar */}
        <div className="text-center pb-3 border-b-2 border-slate-900 mb-4">
          <span className="text-2xs font-bold uppercase tracking-widest text-slate-500">
            Original for Recipient
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-slate-900">
            TAX INVOICE
          </h2>
          <span className="text-2xs font-mono font-medium text-slate-600">
            (Issued under Section 31 of Central Goods and Services Tax Act, 2017)
          </span>
        </div>

        {/* Company Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-300">
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight text-slate-900">
              {invoice.companyDetails.name}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm">
              {invoice.companyDetails.address}, {invoice.companyDetails.city}, {invoice.companyDetails.state}
            </p>
            <div className="text-xs space-y-0.5 pt-1 font-mono">
              <p>
                <strong className="font-semibold text-slate-700">GSTIN / UIN:</strong>{' '}
                <span className="font-bold">{invoice.companyDetails.gstin}</span>
              </p>
              <p>
                <strong className="font-semibold text-slate-700">State:</strong>{' '}
                {invoice.companyDetails.state} (Code: {invoice.companyDetails.stateCode}) · PAN: {invoice.companyDetails.pan}
              </p>
              <p className="text-2xs text-slate-500">
                Phone: {invoice.companyDetails.phone} | Email: {invoice.companyDetails.email}
              </p>
            </div>
          </div>

          {/* Invoice Meta Box */}
          <div className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Invoice No:</span>
              <span className="font-bold font-mono text-slate-900">{invoice.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Invoice Date:</span>
              <span className="font-semibold font-mono text-slate-900">{invoice.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Due Date:</span>
              <span className="font-semibold font-mono text-slate-900">{invoice.dueDate}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 text-2xs">
              <span className="text-slate-500">Series:</span>
              <span className="font-mono">{invoice.salesSeries}</span>
            </div>
          </div>
        </div>

        {/* Billed To / Consignee Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-300 text-xs">
          <div className="space-y-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
              Details of Receiver / Billed To:
            </span>
            <p className="font-bold text-sm text-slate-900">{invoice.partyDetails.name}</p>
            <p className="text-slate-600">{invoice.partyDetails.address}</p>
            <p className="text-slate-600">
              {invoice.partyDetails.city}, {invoice.partyDetails.state}
            </p>
            <p className="font-mono pt-0.5">
              <strong className="font-semibold">GSTIN:</strong>{' '}
              <span className="font-bold">{invoice.partyDetails.gstin}</span>
            </p>
            <p className="font-mono text-2xs text-slate-500">
              State: {invoice.partyDetails.state} (Code: {invoice.partyDetails.stateCode})
            </p>
          </div>

          <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
              Dispatch & Transport Details:
            </span>
            <div className="space-y-1 text-2xs text-slate-700">
              <p>
                <strong className="font-semibold">Dispatch Through:</strong> Surat Local Transport
              </p>
              <p>
                <strong className="font-semibold">L.R. / Bilty No:</strong> SLT/2026/8940
              </p>
              <p>
                <strong className="font-semibold">Vehicle No:</strong> GJ-05-BX-4912
              </p>
              <p>
                <strong className="font-semibold">Place of Supply:</strong> {invoice.partyDetails.state} (
                {invoice.partyDetails.stateCode})
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-4 overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300 text-center w-10">#</th>
                <th className="p-2 border-r border-slate-300">Description of Goods / Item</th>
                <th className="p-2 border-r border-slate-300 text-center">HSN</th>
                <th className="p-2 border-r border-slate-300 text-right">Pcs</th>
                <th className="p-2 border-r border-slate-300 text-right">Quantity</th>
                <th className="p-2 border-r border-slate-300 text-right">Rate (₹)</th>
                <th className="p-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="align-top">
                  <td className="p-2 border-r border-slate-200 text-center font-mono tabular-nums text-slate-500">
                    {item.srNo}
                  </td>
                  <td className="p-2 border-r border-slate-200">
                    <p className="font-bold text-slate-900">{item.item}</p>
                    <p className="text-2xs text-slate-500">{item.description}</p>
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-700">
                    {item.hsn}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono tabular-nums">
                    {item.pieces}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono tabular-nums">
                    {item.quantity.toFixed(2)} {item.unit}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono tabular-nums">
                    {item.rate.toFixed(2)}
                  </td>
                  <td className="p-2 text-right font-bold font-mono tabular-nums text-slate-900">
                    {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Footer Subtotals */}
            <tfoot className="border-t-2 border-slate-300 bg-slate-50 text-xs font-semibold">
              <tr>
                <td colSpan={3} className="p-2 text-right border-r border-slate-300 font-bold">
                  Total Quantities:
                </td>
                <td className="p-2 text-right font-mono tabular-nums border-r border-slate-300">
                  {invoice.items.reduce((acc, i) => acc + i.pieces, 0)}
                </td>
                <td className="p-2 text-right font-mono tabular-nums border-r border-slate-300">
                  {invoice.items.reduce((acc, i) => acc + i.quantity, 0).toFixed(2)} Mtrs
                </td>
                <td className="p-2 text-right border-r border-slate-300 font-bold">
                  Taxable Amount:
                </td>
                <td className="p-2 text-right font-bold font-mono tabular-nums text-slate-900">
                  ₹ {invoice.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* GST Tax Calculation & Totals Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-300 text-xs">
          {/* Bank & Remittance Details */}
          <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
              Bank Details for RTGS / NEFT:
            </span>
            <div className="text-2xs space-y-1 font-mono">
              <p>
                <strong className="font-semibold text-slate-700">Bank Name:</strong>{' '}
                {invoice.companyDetails.bankName}
              </p>
              <p>
                <strong className="font-semibold text-slate-700">Account No:</strong>{' '}
                <span className="font-bold">{invoice.companyDetails.accountNo}</span>
              </p>
              <p>
                <strong className="font-semibold text-slate-700">IFSC Code:</strong>{' '}
                <span className="font-bold">{invoice.companyDetails.ifsc}</span>
              </p>
              <p>
                <strong className="font-semibold text-slate-700">Branch:</strong>{' '}
                {invoice.companyDetails.branch}
              </p>
            </div>
          </div>

          {/* Tax Breakdown Totals */}
          <div className="space-y-1.5 text-xs font-medium">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Taxable Value:</span>
              <span className="font-mono tabular-nums">
                ₹ {invoice.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {invoice.cgstTotal > 0 && (
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">Central Tax (CGST @ 2.5%):</span>
                <span className="font-mono tabular-nums">
                  ₹ {invoice.cgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {invoice.sgstTotal > 0 && (
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">State Tax (SGST @ 2.5%):</span>
                <span className="font-mono tabular-nums">
                  ₹ {invoice.sgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {invoice.igstTotal > 0 && (
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">Integrated Tax (IGST @ 5%):</span>
                <span className="font-mono tabular-nums">
                  ₹ {invoice.igstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex justify-between py-1 border-t border-slate-200 font-semibold text-slate-800">
              <span>Total Tax:</span>
              <span className="font-mono tabular-nums">
                ₹ {invoice.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between py-2 border-t-2 border-slate-900 font-black text-sm text-slate-900 bg-slate-100 p-2 rounded">
              <span>Grand Total (Gross):</span>
              <span className="font-mono tabular-nums text-base">
                ₹ {invoice.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div className="py-3 border-b border-slate-300 text-xs">
          <span className="text-slate-500 font-medium">Invoice Amount in Words:</span>
          <p className="font-bold text-slate-900">{invoice.amountInWords}</p>
        </div>

        {/* Terms and Signatures Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-2xs">
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Terms & Conditions:
            </span>
            <ol className="list-decimal pl-3 space-y-0.5 text-slate-600">
              {invoice.termsAndConditions.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col justify-between items-end text-right h-28 border border-slate-200 rounded p-3 bg-slate-50/50">
            <span className="font-bold text-slate-900">
              For {invoice.companyDetails.name}
            </span>
            <div className="w-full text-center text-slate-300 italic text-2xs">
              [Authorized Signatory Signature & Stamp]
            </div>
            <span className="font-semibold text-slate-700 border-t border-slate-300 w-48 pt-1 text-center">
              Authorized Signatory
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
