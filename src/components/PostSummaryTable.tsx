import React from 'react';
import { KpiMetrics, PostSummaryRow } from '../types/visa';

interface PostSummaryTableProps {
  rows: PostSummaryRow[];
  totals: KpiMetrics;
  selectedPost: string;
  onSelectPost: (post: string) => void;
}

export const PostSummaryTable: React.FC<PostSummaryTableProps> = ({
  rows,
  totals,
  selectedPost,
  onSelectPost,
}) => {
  return (
    <section
      id="post-summary"
      aria-label="Interview post summary"
      className="rounded-xl border border-slate-200 bg-white print-break-inside-avoid print-shadow-none overflow-hidden"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Interview Post Summary
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Outcome breakdown by U.S. consular interview post in India (kept separate from employee India Work City)
          </p>
        </div>
        <p className="no-print text-xs text-slate-500">
          Click a post row to filter by interview post
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
              <th className="px-6 py-3 text-left">Interview Post in India</th>
              <th className="px-6 py-3 text-right">Total Interviews</th>
              <th className="px-6 py-3 text-right text-emerald-700">Approved</th>
              <th className="px-6 py-3 text-right text-red-700">Rejected</th>
              <th className="px-6 py-3 text-right text-amber-700">221(g)</th>
              <th className="px-6 py-3 text-right">Approval Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 tabular-nums">
            {rows.map((row) => {
              const isSelected = selectedPost === row.post;
              return (
                <tr
                  key={row.post}
                  onClick={() => onSelectPost(isSelected ? 'All' : row.post)}
                  className={`transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-6 py-3.5 font-semibold text-slate-900">
                    {row.post}
                    {isSelected && (
                      <span className="ml-2 text-xs font-normal text-blue-700">
                        (Filtered)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                    {row.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 text-right text-emerald-700 font-medium">
                    {row.approved.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 text-right text-red-700 font-medium">
                    {row.rejected.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 text-right text-amber-700 font-medium">
                    {row.g221.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                    {row.approvalRateFormatted}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900 tabular-nums">
              <td className="px-6 py-3.5">All Active Posts</td>
              <td className="px-6 py-3.5 text-right">{totals.total.toLocaleString()}</td>
              <td className="px-6 py-3.5 text-right text-emerald-700">
                {totals.approved.toLocaleString()}
              </td>
              <td className="px-6 py-3.5 text-right text-red-700">
                {totals.rejected.toLocaleString()}
              </td>
              <td className="px-6 py-3.5 text-right text-amber-700">
                {totals.g221.toLocaleString()}
              </td>
              <td className="px-6 py-3.5 text-right">{totals.approvalRateFormatted}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};
