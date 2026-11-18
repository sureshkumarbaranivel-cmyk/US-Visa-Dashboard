import React from 'react';
import { CheckCircle2, Clock, Percent, Users, XCircle } from 'lucide-react';
import { KpiMetrics } from '../types/visa';

interface KpiStripProps {
  kpis: KpiMetrics;
}

export const KpiStrip: React.FC<KpiStripProps> = ({ kpis }) => {
  const shareOfTotal = (count: number) => {
    if (kpis.total === 0) return '—';
    return `${((count / kpis.total) * 100).toFixed(1)}% of total`;
  };

  return (
    <section aria-label="Key performance indicators" className="print-break-inside-avoid space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 print-shadow-none">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Interviews</span>
            <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {kpis.total.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Unique valid Case IDs
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 print-shadow-none">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-700">
            <span>Approved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {kpis.approved.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs text-emerald-700 font-medium tabular-nums">
            {shareOfTotal(kpis.approved)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 print-shadow-none">
          <div className="flex items-center justify-between text-xs font-medium text-red-700">
            <span>Rejected</span>
            <XCircle className="h-4 w-4 text-red-700" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {kpis.rejected.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs text-red-700 font-medium tabular-nums">
            {shareOfTotal(kpis.rejected)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 print-shadow-none">
          <div className="flex items-center justify-between text-xs font-medium text-amber-700">
            <span>221(g)</span>
            <Clock className="h-4 w-4 text-amber-700" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {kpis.g221.toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs text-amber-700 font-medium tabular-nums">
            {shareOfTotal(kpis.g221)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 print-shadow-none">
          <div className="flex items-center justify-between text-xs font-medium text-blue-700">
            <span>Approval Rate</span>
            <Percent className="h-4 w-4 text-blue-700" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {kpis.approvalRateFormatted}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Approved ÷ (Approved + Rejected + 221G)
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Note: 221(g) is tracked as its own recorded interview outcome—a refusal that may be reconsidered—and does not indicate final case disposition or current status.
      </p>
    </section>
  );
};
