import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import { DashboardFilters } from '../types/visa';
import { formatMonthLabel } from '../utils/excelParser';
import { getActiveFilterList } from '../utils/aggregation';

interface FilterBarProps {
  filters: DashboardFilters;
  options: {
    months: string[];
    visaClasses: string[];
    outcomes: string[];
    posts: string[];
    departments: string[];
    workCities: string[];
  };
  onChangeFilter: (key: keyof DashboardFilters, value: string) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  options,
  onChangeFilter,
  onResetFilters,
}) => {
  const activeFilters = getActiveFilterList(filters);

  return (
    <section
      aria-label="Dashboard filters"
      className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
    >
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="space-y-1">
          <label htmlFor="filter-month" className="block text-xs font-medium text-slate-600">
            Appointment Month
          </label>
          <select
            id="filter-month"
            value={filters.month}
            onChange={(e) => onChangeFilter('month', e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
          >
            <option value="All">All Months</option>
            {options.months.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filter-visa" className="block text-xs font-medium text-slate-600">
            Visa Class
          </label>
          <select
            id="filter-visa"
            value={filters.visaClass}
            onChange={(e) => onChangeFilter('visaClass', e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
          >
            <option value="All">All Visa Classes</option>
            {options.visaClasses.map((vc) => (
              <option key={vc} value={vc}>
                {vc}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filter-outcome" className="block text-xs font-medium text-slate-600">
            Outcome
          </label>
          <select
            id="filter-outcome"
            value={filters.outcome}
            onChange={(e) => onChangeFilter('outcome', e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
          >
            <option value="All">All Outcomes</option>
            {options.outcomes.map((o) => (
              <option key={o} value={o}>
                {o === '221G' ? '221(g)' : o}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filter-post" className="block text-xs font-medium text-slate-600">
            Interview Post
          </label>
          <select
            id="filter-post"
            value={filters.post}
            onChange={(e) => onChangeFilter('post', e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
          >
            <option value="All">All Posts</option>
            {options.posts.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filter-department" className="block text-xs font-medium text-slate-600">
            Department
          </label>
          <select
            id="filter-department"
            value={filters.department}
            onChange={(e) => onChangeFilter('department', e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
          >
            <option value="All">All Departments</option>
            {options.departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filter-city" className="block text-xs font-medium text-slate-600">
            India Work City
          </label>
          <select
            id="filter-city"
            value={filters.workCity}
            onChange={(e) => onChangeFilter('workCity', e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
          >
            <option value="All">All Work Cities</option>
            {options.workCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-600">
          <span className="font-medium text-slate-700">Active Filters:</span>
          {activeFilters.length === 0 ? (
            <span className="text-slate-500">None (showing all validated records)</span>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => onChangeFilter(f.key, 'All')}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  title={`Clear ${f.label} filter`}
                >
                  <span>
                    {f.label}: {f.displayValue}
                  </span>
                  <X className="no-print h-3 w-3 text-slate-500" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          disabled={activeFilters.length === 0}
          className={`no-print inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            activeFilters.length === 0
              ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
              : 'text-slate-800 bg-slate-100 hover:bg-slate-200 cursor-pointer'
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset Filters
        </button>
      </div>
    </section>
  );
};
