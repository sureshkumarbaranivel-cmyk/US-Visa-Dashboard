import React, { useRef, useState } from 'react';
import { AlertCircle, FileSpreadsheet, Lock, Upload } from 'lucide-react';

interface UploadViewProps {
  isLoading: boolean;
  errorMessage: string | null;
  onFileSelected: (file: File) => void;
  onLoadSampleSnapshot: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  isLoading,
  errorMessage,
  onFileSelected,
  onLoadSampleSnapshot,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFileSelected(files[0]);
  };

  return (
    <main className="mx-auto max-w-[1160px] px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <section id="upload-intake" className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500">
              Global Mobility &amp; HR Operations · Offline Browser Processing
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
              U.S. Visa Interview Status Reporting
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-[65ch]">
              Upload an Excel workbook containing the <strong className="font-semibold text-slate-900">Interview Records</strong> worksheet to compute validated outcomes, post-level approval rates, and aggregate-only leadership summaries.
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Upload Excel workbook"
            onClick={() => !isLoading && inputRef.current?.click()}
            onKeyDown={(e) => {
              if (!isLoading && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (!isLoading) handleFiles(e.dataTransfer.files);
            }}
            className={`rounded-xl border border-dashed p-10 text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              isDragging
                ? 'border-blue-700 bg-blue-50/50'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.xlsm,.xlsb,.ods,.csv"
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />

            {isLoading ? (
              <div className="space-y-3 py-4">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                <p className="text-sm font-semibold text-slate-900">
                  Reading and validating workbook in memory…
                </p>
                <p className="text-xs text-slate-500">
                  Checking required headers, dates, categories, and duplicate Case IDs
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-slate-900">
                    Drop your Excel workbook here, or click to browse
                  </p>
                  <p className="text-xs text-slate-500">
                    Supports .xlsx, .xls, .xlsm, .xlsb, .ods, and .csv via locally bundled SheetJS
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white">
                    <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                    Select Excel File
                  </span>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-900"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-semibold">Workbook upload failed</p>
                  <p className="text-red-800 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-slate-900">
                Explore without uploading a file
              </p>
              <p className="text-xs text-slate-500">
                Opens an aggregate-only snapshot labeled Fictional sample data (200 interviews, zero PII).
              </p>
            </div>
            <button
              type="button"
              onClick={onLoadSampleSnapshot}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Open Sample Snapshot
            </button>
          </div>

          <div className="flex items-start gap-3 text-xs text-slate-500 pt-1">
            <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              Workbooks are parsed strictly in browser memory. Employee names, employee IDs, case IDs, and follow-up notes are never uploaded over the network, sent to analytics, or written to persistent browser storage.
            </p>
          </div>
        </section>

        <aside className="lg:col-span-5 space-y-6 rounded-xl border border-slate-200 bg-white p-6">
          <div id="schema-guide" className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">
              Workbook Expectations
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Source worksheet: <strong className="font-semibold text-slate-900">Interview Records</strong>. Optional <strong className="font-semibold text-slate-900">Summary</strong> worksheet is reconciled automatically against validated records.
            </p>

            <div className="divide-y divide-slate-100 border-t border-b border-slate-100 text-xs">
              <div className="py-2.5 flex items-baseline justify-between gap-4">
                <span className="font-medium text-slate-900">Required Columns</span>
                <span className="text-right text-slate-600">
                  Case ID · Visa Class · Appointment Date · Interview Post in India · Interview Status
                </span>
              </div>
              <div className="py-2.5 flex items-baseline justify-between gap-4">
                <span className="font-medium text-slate-900">Filter Dimensions</span>
                <span className="text-right text-slate-600">
                  Department · India Work City (kept separate from Interview Post)
                </span>
              </div>
              <div className="py-2.5 flex items-baseline justify-between gap-4">
                <span className="font-medium text-slate-900">Omitted from Output</span>
                <span className="text-right text-slate-600">
                  Employee ID · Employee Name · Designation · Sample Follow-up · Case ID
                </span>
              </div>
            </div>
          </div>

          <div id="decision-rules" className="space-y-3 pt-2">
            <h2 className="text-base font-semibold text-slate-900">
              Classification &amp; Decision Rules
            </h2>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <li>
                <strong className="font-semibold text-slate-800">Visa Classes:</strong> H-1B, L-1A, L-1B (case and whitespace normalized).
              </li>
              <li>
                <strong className="font-semibold text-slate-800">Outcomes:</strong> Approved, Rejected, 221G (shown as 221(g)).
              </li>
              <li>
                <strong className="font-semibold text-slate-800">Deduplication:</strong> One interview counted per valid unique Case ID; conflicting duplicates require manual resolution before counting.
              </li>
              <li>
                <strong className="font-semibold text-slate-800">Approval Rate:</strong> Approved ÷ (Approved + Rejected + 221G). Displays — when denominator is zero.
              </li>
              <li>
                <strong className="font-semibold text-slate-800">221(g) Policy:</strong> Reported as a refusal that may be reconsidered, never inferred as final disposition.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
};
