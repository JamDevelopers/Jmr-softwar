import React, { useState } from 'react';
import { Printer, FileSpreadsheet, Download, Check } from 'lucide-react';

interface ExportButtonsProps {
  onExportCsv?: () => void;
  onExportPdf?: () => void;
  onPrint?: () => void;
  dataCount?: number;
  filename?: string;
  tableData?: Record<string, unknown>[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportCsv,
  onExportPdf,
  onPrint,
  filename = 'report',
  tableData,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleExportCsv = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }

    if (!tableData || tableData.length === 0) return;

    // Convert tableData to CSV
    const headers = Object.keys(tableData[0]);
    const csvRows = [
      headers.join(','),
      ...tableData.map((row) =>
        headers
          .map((header) => {
            const val = row[header];
            const escaped = ('' + (val ?? '')).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('CSV');
    setTimeout(() => setDownloadSuccess(null), 2000);
  };

  const handleExportPdf = () => {
    if (onExportPdf) {
      onExportPdf();
    } else {
      // Print dialog handles save to PDF in modern browsers
      window.print();
    }
    setDownloadSuccess('PDF');
    setTimeout(() => setDownloadSuccess(null), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 no-print">
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
        title="Print Report"
      >
        <Printer className="w-3.5 h-3.5 text-slate-500" />
        <span className="hidden sm:inline">Print</span>
      </button>

      <button
        onClick={handleExportCsv}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
        title="Export to Excel / CSV"
      >
        {downloadSuccess === 'CSV' ? (
          <Check className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
        )}
        <span className="hidden sm:inline">Excel/CSV</span>
      </button>

      <button
        onClick={handleExportPdf}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
        title="Export PDF Document"
      >
        {downloadSuccess === 'PDF' ? (
          <Check className="w-3.5 h-3.5 text-blue-600" />
        ) : (
          <Download className="w-3.5 h-3.5 text-blue-600" />
        )}
        <span className="hidden sm:inline">PDF</span>
      </button>
    </div>
  );
};
