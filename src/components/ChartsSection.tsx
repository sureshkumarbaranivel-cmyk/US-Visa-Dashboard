import React, { useEffect, useRef } from 'react';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { KpiMetrics, MonthlyBreakdownRow, VisaClassBreakdownRow } from '../types/visa';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartsSectionProps {
  monthlyRows: MonthlyBreakdownRow[];
  visaRows: VisaClassBreakdownRow[];
  kpis: KpiMetrics;
}

const COLORS = {
  approved: '#15803d',
  g221: '#d97706',
  rejected: '#b91c1c',
};

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  monthlyRows,
  visaRows,
  kpis,
}) => {
  const monthlyCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const visaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const monthlyChartRef = useRef<Chart<'bar'> | null>(null);
  const visaChartRef = useRef<Chart<'bar'> | null>(null);

  useEffect(() => {
    const canvas = monthlyCanvasRef.current;
    if (!canvas) return;

    if (monthlyChartRef.current) {
      monthlyChartRef.current.destroy();
      monthlyChartRef.current = null;
    }

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: monthlyRows.map((r) => r.monthLabel),
        datasets: [
          {
            label: `Approved (${kpis.approved})`,
            data: monthlyRows.map((r) => r.approved),
            backgroundColor: COLORS.approved,
            borderRadius: 2,
          },
          {
            label: `221(g) (${kpis.g221})`,
            data: monthlyRows.map((r) => r.g221),
            backgroundColor: COLORS.g221,
            borderRadius: 2,
          },
          {
            label: `Rejected (${kpis.rejected})`,
            data: monthlyRows.map((r) => r.rejected),
            backgroundColor: COLORS.rejected,
            borderRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 180 },
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              padding: 14,
              color: '#334155',
              font: {
                family: '"Plus Jakarta Sans", sans-serif',
                size: 12,
                weight: 500,
              },
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#0f172a',
            padding: 10,
            callbacks: {
              footer: (items) => {
                const idx = items[0]?.dataIndex;
                if (idx === undefined || !monthlyRows[idx]) return '';
                const row = monthlyRows[idx];
                return `Total: ${row.total} · Approval Rate: ${row.approvalRateFormatted}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: {
              color: '#475569',
              font: { family: '"Plus Jakarta Sans", sans-serif', size: 11 },
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: '#475569',
              font: { family: '"IBM Plex Mono", monospace', size: 11 },
            },
            grid: { color: '#f1f5f9' },
          },
        },
      },
    };

    monthlyChartRef.current = new Chart(canvas, config);

    return () => {
      if (monthlyChartRef.current) {
        monthlyChartRef.current.destroy();
        monthlyChartRef.current = null;
      }
    };
  }, [monthlyRows, kpis.approved, kpis.g221, kpis.rejected]);

  useEffect(() => {
    const canvas = visaCanvasRef.current;
    if (!canvas) return;

    if (visaChartRef.current) {
      visaChartRef.current.destroy();
      visaChartRef.current = null;
    }

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: visaRows.map((r) => `${r.visaClass} (${r.total})`),
        datasets: [
          {
            label: 'Approved',
            data: visaRows.map((r) => r.approved),
            backgroundColor: COLORS.approved,
            borderRadius: 2,
          },
          {
            label: '221(g)',
            data: visaRows.map((r) => r.g221),
            backgroundColor: COLORS.g221,
            borderRadius: 2,
          },
          {
            label: 'Rejected',
            data: visaRows.map((r) => r.rejected),
            backgroundColor: COLORS.rejected,
            borderRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 180 },
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              padding: 14,
              color: '#334155',
              font: {
                family: '"Plus Jakarta Sans", sans-serif',
                size: 12,
                weight: 500,
              },
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#0f172a',
            padding: 10,
            callbacks: {
              footer: (items) => {
                const idx = items[0]?.dataIndex;
                if (idx === undefined || !visaRows[idx]) return '';
                const row = visaRows[idx];
                return `Total: ${row.total} · Approval Rate: ${row.approvalRateFormatted}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: false,
            grid: { display: false },
            ticks: {
              color: '#334155',
              font: { family: '"Plus Jakarta Sans", sans-serif', size: 12, weight: 600 },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: '#475569',
              font: { family: '"IBM Plex Mono", monospace', size: 11 },
            },
            grid: { color: '#f1f5f9' },
          },
        },
      },
    };

    visaChartRef.current = new Chart(canvas, config);

    return () => {
      if (visaChartRef.current) {
        visaChartRef.current.destroy();
        visaChartRef.current = null;
      }
    };
  }, [visaRows]);

  return (
    <section
      id="monthly-trends"
      aria-label="Outcome charts"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 print-break-inside-avoid print-shadow-none flex flex-col">
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Monthly Interviews by Outcome
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Stacked outcome counts derived from Appointment Date
            </p>
          </div>
          <p className="text-xs text-slate-600 tabular-nums">
            Approved {kpis.approved} · 221(g) {kpis.g221} · Rejected {kpis.rejected}
          </p>
        </div>

        <div className="relative h-[300px] w-full pt-4">
          <canvas ref={monthlyCanvasRef} aria-label="Stacked monthly interviews chart" />
        </div>
      </div>

      <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 print-break-inside-avoid print-shadow-none flex flex-col justify-between">
        <div>
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              Comparison by Visa Class
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Outcome counts and approval rates for H-1B, L-1A, and L-1B
            </p>
          </div>

          <div className="relative h-[200px] w-full pt-4">
            <canvas ref={visaCanvasRef} aria-label="Visa class comparison chart" />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto border-t border-slate-100 pt-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-1.5 font-medium">Class</th>
                <th className="py-1.5 font-medium text-right">Total</th>
                <th className="py-1.5 font-medium text-right text-emerald-700">Approved</th>
                <th className="py-1.5 font-medium text-right text-red-700">Rejected</th>
                <th className="py-1.5 font-medium text-right text-amber-700">221(g)</th>
                <th className="py-1.5 font-medium text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {visaRows.map((row) => (
                <tr key={row.visaClass}>
                  <td className="py-2 font-semibold text-slate-900">{row.visaClass}</td>
                  <td className="py-2 text-right font-medium text-slate-900">{row.total}</td>
                  <td className="py-2 text-right text-emerald-700">{row.approved}</td>
                  <td className="py-2 text-right text-red-700">{row.rejected}</td>
                  <td className="py-2 text-right text-amber-700">{row.g221}</td>
                  <td className="py-2 text-right font-semibold text-slate-900">
                    {row.approvalRateFormatted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
