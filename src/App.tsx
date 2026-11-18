import React, { useMemo, useState } from 'react';
import { AlertTriangle, Download, Printer, RotateCcw } from 'lucide-react';
import {
  SAMPLE_REPORTING_PERIOD,
  SAMPLE_SNAPSHOT_BUCKETS,
  SAMPLE_SOURCE_LABEL,
} from './data/sampleSnapshot';
import {
  DashboardFilters,
  INITIAL_FILTERS,
  ParsedWorkbookState,
} from './types/visa';
import {
  buildAggregateBucketsFromWorkbook,
  buildSummaryCsv,
  computeKpis,
  computeMonthlyBreakdown,
  computePostSummary,
  computeVisaClassBreakdown,
  extractFilterOptions,
  filterBuckets,
} from './utils/aggregation';
import { WorkbookUploadError, parseVisaWorkbook } from './utils/excelParser';
import { TopBar } from './components/TopBar';
import { UploadView } from './components/UploadView';
import { FilterBar } from './components/FilterBar';
import { KpiStrip } from './components/KpiStrip';
import { ChartsSection } from './components/ChartsSection';
import { PostSummaryTable } from './components/PostSummaryTable';
import { DataQualityPanel, hasSummaryMismatch } from './components/DataQualityPanel';

export default function App() {
  const [mode, setMode] = useState<'upload' | 'dashboard'>('upload');
  const [activeTab, setActiveTab] = useState<'overview' | 'data-quality'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [workbookState, setWorkbookState] = useState<ParsedWorkbookState | null>(null);
  const [isSampleMode, setIsSampleMode] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(INITIAL_FILTERS);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setUploadError(null);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseVisaWorkbook(buffer, file.name);
      setWorkbookState(parsed);
      setIsSampleMode(false);
      setFilters(INITIAL_FILTERS);
      setActiveTab('overview');
      setMode('dashboard');
    } catch (err) {
      if (err instanceof WorkbookUploadError) {
        setUploadError(err.message);
      } else {
        setUploadError(
          'Unexpected error reading workbook. Please verify the file is a valid Excel workbook with an "Interview Records" sheet.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSampleSnapshot = () => {
    setUploadError(null);
    setWorkbookState(null);
    setIsSampleMode(true);
    setFilters(INITIAL_FILTERS);
    setActiveTab('overview');
    setMode('dashboard');
  };

  const handleResolveDuplicate = (caseId: string, choice: number | 'exclude') => {
    setWorkbookState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        duplicateGroups: prev.duplicateGroups.map((group) =>
          group.caseId === caseId ? { ...group, resolvedChoice: choice } : group
        ),
      };
    });
  };

  const derivedWorkbook = useMemo(() => {
    if (isSampleMode || !workbookState) {
      return {
        buckets: SAMPLE_SNAPSHOT_BUCKETS,
        acceptedCount: 200,
        excludedRowCount: 0,
        unresolvedCaseCount: 0,
        reportingPeriodLabel: SAMPLE_REPORTING_PERIOD,
        sourceLabel: SAMPLE_SOURCE_LABEL,
      };
    }
    const agg = buildAggregateBucketsFromWorkbook(workbookState);
    return {
      ...agg,
      sourceLabel: workbookState.fileName,
    };
  }, [isSampleMode, workbookState]);

  const filterOptions = useMemo(
    () => extractFilterOptions(derivedWorkbook.buckets),
    [derivedWorkbook.buckets]
  );

  const filteredBuckets = useMemo(
    () => filterBuckets(derivedWorkbook.buckets, filters),
    [derivedWorkbook.buckets, filters]
  );

  const unfilteredKpis = useMemo(
    () => computeKpis(derivedWorkbook.buckets),
    [derivedWorkbook.buckets]
  );

  const kpis = useMemo(() => computeKpis(filteredBuckets), [filteredBuckets]);
  const monthlyRows = useMemo(
    () => computeMonthlyBreakdown(filteredBuckets),
    [filteredBuckets]
  );
  const visaRows = useMemo(
    () => computeVisaClassBreakdown(filteredBuckets),
    [filteredBuckets]
  );
  const postRows = useMemo(
    () => computePostSummary(filteredBuckets),
    [filteredBuckets]
  );

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleDownloadCsv = () => {
    const csvContent = buildSummaryCsv({
      sourceLabel: derivedWorkbook.sourceLabel,
      reportingPeriod: derivedWorkbook.reportingPeriodLabel,
      filters,
      kpis,
      postRows,
      visaRows,
      monthlyRows,
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (isSampleMode ? 'fictional-sample' : workbookState?.fileName ?? 'visa-summary')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-');
    link.href = url;
    link.setAttribute('download', `${safeName}-aggregate-summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const showReconciliationWarning =
    !isSampleMode &&
    workbookState !== null &&
    hasSummaryMismatch(workbookState.summarySheet, {
      total: unfilteredKpis.total,
      approved: unfilteredKpis.approved,
      rejected: unfilteredKpis.rejected,
      g221: unfilteredKpis.g221,
    });

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <TopBar
        mode={mode}
        activeTab={activeTab}
        hasWorkbookQualityPanel={!isSampleMode && workbookState !== null}
        unresolvedCount={derivedWorkbook.unresolvedCaseCount}
        onSelectTab={setActiveTab}
        onGoToUpload={() => {
          setMode('upload');
          setUploadError(null);
        }}
        onLoadSampleSnapshot={handleLoadSampleSnapshot}
      />

      {mode === 'upload' ? (
        <UploadView
          isLoading={isLoading}
          errorMessage={uploadError}
          onFileSelected={handleFileSelected}
          onLoadSampleSnapshot={handleLoadSampleSnapshot}
        />
      ) : (
        <main className="mx-auto w-full max-w-[1360px] flex-1 px-6 py-8 space-y-6">
          {/* Header Metadata & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-500">
                {isSampleMode
                  ? 'Fictional sample data · Aggregate-Only Snapshot'
                  : 'Aggregate-Only Published View · Processed Locally in Memory'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {derivedWorkbook.sourceLabel}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 tabular-nums">
                <span>
                  Reporting Period:{' '}
                  <strong className="font-semibold text-slate-900">
                    {derivedWorkbook.reportingPeriodLabel}
                  </strong>
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span>
                  Accepted Records:{' '}
                  <strong className="font-semibold text-slate-900">
                    {derivedWorkbook.acceptedCount.toLocaleString()}
                  </strong>
                </span>
                {!isSampleMode && derivedWorkbook.excludedRowCount > 0 && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('data-quality')}
                      className="text-amber-700 font-semibold hover:underline cursor-pointer"
                    >
                      Excluded / Duplicate Rows: {derivedWorkbook.excludedRowCount}
                    </button>
                  </>
                )}
                {!isSampleMode && derivedWorkbook.unresolvedCaseCount > 0 && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('data-quality')}
                      className="text-red-700 font-semibold hover:underline cursor-pointer"
                    >
                      Unresolved Conflicts: {derivedWorkbook.unresolvedCaseCount}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center gap-3 shrink-0">
              {!isSampleMode && workbookState !== null && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(activeTab === 'overview' ? 'data-quality' : 'overview')
                  }
                  className="md:hidden px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {activeTab === 'overview'
                    ? `Data Quality${
                        derivedWorkbook.unresolvedCaseCount > 0
                          ? ` (${derivedWorkbook.unresolvedCaseCount})`
                          : ''
                      }`
                    : 'Back to Overview'}
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                Print View
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Download Summary CSV
              </button>
            </div>
          </div>

          {/* Alerts: Reconciliation Warning & Unresolved Conflicts */}
          {(showReconciliationWarning || derivedWorkbook.unresolvedCaseCount > 0) && (
            <div className="space-y-3">
              {showReconciliationWarning && (
                <div
                  role="status"
                  className="rounded-xl border border-amber-200 bg-amber-50/70 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className="h-5 w-5 text-amber-700 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="text-xs text-amber-950 space-y-0.5">
                      <p className="font-semibold">
                        Workbook Summary Reconciliation Warning
                      </p>
                      <p className="text-amber-900">
                        The workbook’s Summary worksheet counts differ from the validated Interview Records. Dashboard calculations use the validated Interview Records.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('data-quality')}
                    className="no-print self-start sm:self-center px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Inspect Reconciliation
                  </button>
                </div>
              )}

              {derivedWorkbook.unresolvedCaseCount > 0 && (
                <div
                  role="status"
                  className="rounded-xl border border-red-200 bg-red-50/70 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className="h-5 w-5 text-red-700 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="text-xs text-red-950 space-y-0.5">
                      <p className="font-semibold">
                        {derivedWorkbook.unresolvedCaseCount} Conflicting Duplicate Case ID
                        {derivedWorkbook.unresolvedCaseCount > 1 ? 's' : ''} Pending Resolution
                      </p>
                      <p className="text-red-900">
                        Conflicting Case IDs are excluded from dashboard totals until you select which row to count or exclude them.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('data-quality')}
                    className="no-print self-start sm:self-center px-3 py-1.5 rounded-lg bg-white border border-red-300 text-xs font-semibold text-red-900 hover:bg-red-100/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Resolve Duplicates
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'data-quality' && !isSampleMode && workbookState ? (
            <DataQualityPanel
              summarySheet={workbookState.summarySheet}
              validatedTotals={{
                total: unfilteredKpis.total,
                approved: unfilteredKpis.approved,
                rejected: unfilteredKpis.rejected,
                g221: unfilteredKpis.g221,
              }}
              rowIssues={workbookState.rowIssues}
              duplicateGroups={workbookState.duplicateGroups}
              excludedRowCount={derivedWorkbook.excludedRowCount}
              unresolvedCaseCount={derivedWorkbook.unresolvedCaseCount}
              onResolveDuplicate={handleResolveDuplicate}
            />
          ) : (
            <>
              <FilterBar
                filters={filters}
                options={filterOptions}
                onChangeFilter={handleFilterChange}
                onResetFilters={handleResetFilters}
              />

              <KpiStrip kpis={kpis} />

              {filteredBuckets.length === 0 ? (
                <section
                  aria-label="No matching records"
                  className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-4"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-base font-semibold text-slate-900">
                      No visa interview records match the active filters
                    </h2>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Adjust one or more filter selections above or reset all filters to restore the full validated reporting view. Approval rate displays — when the denominator is zero.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Reset Filters
                  </button>
                </section>
              ) : (
                <>
                  <ChartsSection
                    monthlyRows={monthlyRows}
                    visaRows={visaRows}
                    kpis={kpis}
                  />

                  <PostSummaryTable
                    rows={postRows}
                    totals={kpis}
                    selectedPost={filters.post}
                    onSelectPost={(post) => handleFilterChange('post', post)}
                  />
                </>
              )}
            </>
          )}
        </main>
      )}

      <footer className="no-print border-t border-slate-200 bg-white py-5 px-6 mt-auto">
        <div className="mx-auto max-w-[1360px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            U.S. Visa Interview Status Dashboard · Aggregate-only leadership reporting
          </span>
          <span>
            In-memory browser processing · No employee PII exported or stored
          </span>
        </div>
      </footer>
    </div>
  );
}
