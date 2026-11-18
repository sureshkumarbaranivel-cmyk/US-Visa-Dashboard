import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { DuplicateCaseGroup, RowIssue, WorkbookSummaryTotals } from '../types/visa';

interface DataQualityPanelProps {
  summarySheet: WorkbookSummaryTotals;
  validatedTotals: {
    total: number;
    approved: number;
    rejected: number;
    g221: number;
  };
  rowIssues: RowIssue[];
  duplicateGroups: DuplicateCaseGroup[];
  excludedRowCount: number;
  unresolvedCaseCount: number;
  onResolveDuplicate: (caseId: string, choice: number | 'exclude') => void;
}

export function hasSummaryMismatch(
  summary: WorkbookSummaryTotals,
  validated: { total: number; approved: number; rejected: number; g221: number }
): boolean {
  if (!summary.found || !summary.rawRowsDetected) return false;
  if (summary.approved !== null && summary.approved !== validated.approved) return true;
  if (summary.rejected !== null && summary.rejected !== validated.rejected) return true;
  if (summary.g221 !== null && summary.g221 !== validated.g221) return true;
  if (summary.total !== null && summary.total !== validated.total) return true;
  return false;
}

export const DataQualityPanel: React.FC<DataQualityPanelProps> = ({
  summarySheet,
  validatedTotals,
  rowIssues,
  duplicateGroups,
  excludedRowCount,
  unresolvedCaseCount,
  onResolveDuplicate,
}) => {
  const mismatch = hasSummaryMismatch(summarySheet, validatedTotals);
  const conflictingDuplicates = duplicateGroups.filter((g) => g.isConflicting);
  const identicalDuplicates = duplicateGroups.filter((g) => !g.isConflicting);

  return (
    <section aria-label="Data quality and reconciliation" className="space-y-6">
      {/* Summary Worksheet Reconciliation */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-start gap-3">
          {mismatch ? (
            <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              {!summarySheet.found
                ? 'Summary Worksheet Not Present'
                : mismatch
                ? 'Summary Worksheet Reconciliation Warning'
                : 'Summary Worksheet Reconciled'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {!summarySheet.found
                ? 'No "Summary" worksheet was found in this workbook. All dashboard metrics are calculated directly from validated rows in "Interview Records".'
                : !summarySheet.rawRowsDetected
                ? 'A "Summary" worksheet was found, but standard outcome total cells (Approved, Rejected, 221G, Total) could not be matched. Dashboard calculations use validated Interview Records.'
                : mismatch
                ? 'Outcome counts in the workbook Summary worksheet differ from the validated Interview Records. Dashboard calculations use the validated Interview Records.'
                : 'Outcome counts in the workbook Summary worksheet match the validated Interview Records.'}
            </p>
          </div>
        </div>

        {summarySheet.found && summarySheet.rawRowsDetected && (
          <div className="overflow-x-auto border-t border-slate-100 pt-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="py-2 font-medium">Source</th>
                  <th className="py-2 font-medium text-right">Total</th>
                  <th className="py-2 font-medium text-right text-emerald-700">Approved</th>
                  <th className="py-2 font-medium text-right text-red-700">Rejected</th>
                  <th className="py-2 font-medium text-right text-amber-700">221(g)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                <tr>
                  <td className="py-2.5 font-medium text-slate-700">Workbook Summary Sheet</td>
                  <td className="py-2.5 text-right">{summarySheet.total ?? '—'}</td>
                  <td className="py-2.5 text-right">{summarySheet.approved ?? '—'}</td>
                  <td className="py-2.5 text-right">{summarySheet.rejected ?? '—'}</td>
                  <td className="py-2.5 text-right">{summarySheet.g221 ?? '—'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-slate-900">
                    Validated Interview Records (Active)
                  </td>
                  <td className="py-2.5 text-right font-semibold text-slate-900">
                    {validatedTotals.total}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-emerald-700">
                    {validatedTotals.approved}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-red-700">
                    {validatedTotals.rejected}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-amber-700">
                    {validatedTotals.g221}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Counts of Excluded / Unresolved Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Excluded Rows</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {excludedRowCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Invalid rows, duplicate extra rows, or excluded conflicts
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Unresolved Conflicting Case IDs</p>
          <p
            className={`mt-2 text-2xl font-bold tabular-nums ${
              unresolvedCaseCount > 0 ? 'text-amber-700' : 'text-slate-900'
            }`}
          >
            {unresolvedCaseCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Held out of reporting totals until resolved below
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Row Validation Flags</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {rowIssues.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Missing required fields, invalid dates, or unknown categories
          </p>
        </div>
      </div>

      {/* Conflicting Duplicates Resolution */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Conflicting Duplicate Case IDs ({conflictingDuplicates.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Same Case ID appears across multiple rows with differing Visa Class, Appointment Date, Interview Post, or Interview Status. Select one row to count or exclude the case.
          </p>
        </div>

        {conflictingDuplicates.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">
            No conflicting duplicate Case IDs detected.
          </p>
        ) : (
          <div className="space-y-4">
            {conflictingDuplicates.map((group) => (
              <div
                key={group.caseId}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900 font-mono-tabular">
                      Case ID: {group.caseId}
                    </span>
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="text-slate-600">
                      Rows {group.rows.map((r) => r.rowNumber).join(', ')}
                    </span>
                  </div>
                  <div className="text-xs font-medium">
                    {group.resolvedChoice === null ? (
                      <span className="text-amber-700">Unresolved — currently excluded</span>
                    ) : group.resolvedChoice === 'exclude' ? (
                      <span className="text-red-700">Resolved: Case excluded</span>
                    ) : (
                      <span className="text-emerald-700">
                        Resolved: Counting Row {group.resolvedChoice}
                      </span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs bg-white rounded-md border border-slate-200">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 text-left">
                        <th className="px-3 py-2 font-medium">Excel Row</th>
                        <th className="px-3 py-2 font-medium">Visa Class</th>
                        <th className="px-3 py-2 font-medium">Appointment Date</th>
                        <th className="px-3 py-2 font-medium">Interview Post</th>
                        <th className="px-3 py-2 font-medium">Outcome</th>
                        <th className="px-3 py-2 font-medium">Department</th>
                        <th className="px-3 py-2 font-medium">Work City</th>
                        <th className="px-3 py-2 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 tabular-nums">
                      {group.rows.map((opt) => {
                        const isChosen = group.resolvedChoice === opt.rowNumber;
                        return (
                          <tr key={opt.rowNumber} className={isChosen ? 'bg-emerald-50/50' : ''}>
                            <td className="px-3 py-2 font-mono-tabular font-semibold text-slate-900">
                              Row {opt.rowNumber}
                            </td>
                            <td className="px-3 py-2">{opt.visaClass}</td>
                            <td className="px-3 py-2 font-mono-tabular">{opt.appointmentDateISO}</td>
                            <td className="px-3 py-2">{opt.post}</td>
                            <td className="px-3 py-2 font-medium">
                              {opt.status === '221G' ? '221(g)' : opt.status}
                            </td>
                            <td className="px-3 py-2 text-slate-600">{opt.department}</td>
                            <td className="px-3 py-2 text-slate-600">{opt.workCity}</td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => onResolveDuplicate(group.caseId, opt.rowNumber)}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                                  isChosen
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                              >
                                {isChosen ? 'Selected' : `Keep Row ${opt.rowNumber}`}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onResolveDuplicate(group.caseId, 'exclude')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                      group.resolvedChoice === 'exclude'
                        ? 'border-red-700 bg-red-50 text-red-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Exclude Entire Case ID
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Identical Duplicate Case IDs */}
      {identicalDuplicates.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Identical Duplicate Case IDs Deduplicated ({identicalDuplicates.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each Case ID below appeared on multiple rows with matching details and was counted once.
              </p>
            </div>
          </div>
          <ul className="divide-y divide-slate-100 text-xs">
            {identicalDuplicates.map((g) => (
              <li key={g.caseId} className="py-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono-tabular font-medium text-slate-800">
                  {g.caseId}
                </span>
                <span className="text-slate-600">
                  Appears on rows {g.rows.map((r) => r.rowNumber).join(', ')} — counted once (Row {g.rows[0].rowNumber})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Row Validation Issues */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Flagged &amp; Excluded Row Issues ({rowIssues.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Rows with missing required values, invalid or ambiguous dates, or unrecognized Visa Class / Interview Status categories.
          </p>
        </div>

        {rowIssues.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">
            All scanned rows passed required field, date, and category validation.
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
            {rowIssues.map((issue, idx) => (
              <div key={`${issue.rowNumber}-${idx}`} className="px-4 py-2.5 flex items-start justify-between gap-4">
                <span className="text-slate-800">{issue.message}</span>
                <span className="shrink-0 font-mono-tabular text-slate-500">
                  Row {issue.rowNumber}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
