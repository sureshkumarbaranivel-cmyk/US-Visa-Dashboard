import {
  AggregateBucket,
  DashboardFilters,
  INTERVIEW_OUTCOMES,
  KpiMetrics,
  MonthlyBreakdownRow,
  ParsedWorkbookState,
  PostSummaryRow,
  VISA_CLASSES,
  VisaClassBreakdownRow,
} from '../types/visa';
import { computeReportingPeriodLabel, formatMonthLabel } from './excelParser';

export function formatApprovalRate(approved: number, total: number): string {
  if (total <= 0) return '—';
  return `${((approved / total) * 100).toFixed(1)}%`;
}

export function buildAggregateBucketsFromWorkbook(state: ParsedWorkbookState): {
  buckets: AggregateBucket[];
  acceptedCount: number;
  excludedRowCount: number;
  unresolvedCaseCount: number;
  reportingPeriodLabel: string;
} {
  const bucketMap = new Map<string, AggregateBucket>();
  const months: string[] = [];
  let acceptedCount = 0;
  let excludedDuplicateRows = 0;
  let unresolvedCaseCount = 0;

  const addEntry = (entry: {
    month: string;
    visaClass: AggregateBucket['visaClass'];
    outcome: AggregateBucket['outcome'];
    post: string;
    department: string;
    workCity: string;
  }) => {
    acceptedCount += 1;
    months.push(entry.month);
    const key = [
      entry.month,
      entry.visaClass,
      entry.outcome,
      entry.post,
      entry.department,
      entry.workCity,
    ].join('||');
    const existing = bucketMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      bucketMap.set(key, { ...entry, count: 1 });
    }
  };

  for (const rec of state.acceptedSingleRecords) {
    addEntry({
      month: rec.month,
      visaClass: rec.visaClass,
      outcome: rec.status,
      post: rec.post,
      department: rec.department,
      workCity: rec.workCity,
    });
  }

  for (const group of state.duplicateGroups) {
    if (group.resolvedChoice === null) {
      unresolvedCaseCount += 1;
      excludedDuplicateRows += group.rows.length;
    } else if (group.resolvedChoice === 'exclude') {
      excludedDuplicateRows += group.rows.length;
    } else {
      const selected = group.rows.find((r) => r.rowNumber === group.resolvedChoice);
      if (selected) {
        addEntry({
          month: selected.month,
          visaClass: selected.visaClass,
          outcome: selected.status,
          post: selected.post,
          department: selected.department,
          workCity: selected.workCity,
        });
        excludedDuplicateRows += group.rows.length - 1;
      }
    }
  }

  return {
    buckets: Array.from(bucketMap.values()),
    acceptedCount,
    excludedRowCount: state.rowIssues.length + excludedDuplicateRows,
    unresolvedCaseCount,
    reportingPeriodLabel: computeReportingPeriodLabel(months),
  };
}

export function filterBuckets(
  buckets: AggregateBucket[],
  filters: DashboardFilters
): AggregateBucket[] {
  return buckets.filter((b) => {
    if (filters.month !== 'All' && b.month !== filters.month) return false;
    if (filters.visaClass !== 'All' && b.visaClass !== filters.visaClass) return false;
    if (filters.outcome !== 'All' && b.outcome !== filters.outcome) return false;
    if (filters.post !== 'All' && b.post !== filters.post) return false;
    if (filters.department !== 'All' && b.department !== filters.department) return false;
    if (filters.workCity !== 'All' && b.workCity !== filters.workCity) return false;
    return true;
  });
}

export function computeKpis(buckets: AggregateBucket[]): KpiMetrics {
  let approved = 0;
  let rejected = 0;
  let g221 = 0;

  for (const b of buckets) {
    if (b.outcome === 'Approved') approved += b.count;
    else if (b.outcome === 'Rejected') rejected += b.count;
    else if (b.outcome === '221G') g221 += b.count;
  }

  const total = approved + rejected + g221;
  return {
    total,
    approved,
    rejected,
    g221,
    approvalRate: total > 0 ? (approved / total) * 100 : null,
    approvalRateFormatted: formatApprovalRate(approved, total),
  };
}

export function computeMonthlyBreakdown(buckets: AggregateBucket[]): MonthlyBreakdownRow[] {
  const map = new Map<string, { approved: number; rejected: number; g221: number }>();

  for (const b of buckets) {
    const entry = map.get(b.month) ?? { approved: 0, rejected: 0, g221: 0 };
    if (b.outcome === 'Approved') entry.approved += b.count;
    else if (b.outcome === 'Rejected') entry.rejected += b.count;
    else if (b.outcome === '221G') entry.g221 += b.count;
    map.set(b.month, entry);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, counts]) => {
      const total = counts.approved + counts.rejected + counts.g221;
      return {
        month,
        monthLabel: formatMonthLabel(month),
        total,
        approved: counts.approved,
        rejected: counts.rejected,
        g221: counts.g221,
        approvalRateFormatted: formatApprovalRate(counts.approved, total),
      };
    });
}

export function computeVisaClassBreakdown(buckets: AggregateBucket[]): VisaClassBreakdownRow[] {
  return VISA_CLASSES.map((visaClass) => {
    let approved = 0;
    let rejected = 0;
    let g221 = 0;
    for (const b of buckets) {
      if (b.visaClass !== visaClass) continue;
      if (b.outcome === 'Approved') approved += b.count;
      else if (b.outcome === 'Rejected') rejected += b.count;
      else if (b.outcome === '221G') g221 += b.count;
    }
    const total = approved + rejected + g221;
    return {
      visaClass,
      total,
      approved,
      rejected,
      g221,
      approvalRateFormatted: formatApprovalRate(approved, total),
    };
  });
}

export function computePostSummary(buckets: AggregateBucket[]): PostSummaryRow[] {
  const map = new Map<string, { approved: number; rejected: number; g221: number }>();

  for (const b of buckets) {
    const entry = map.get(b.post) ?? { approved: 0, rejected: 0, g221: 0 };
    if (b.outcome === 'Approved') entry.approved += b.count;
    else if (b.outcome === 'Rejected') entry.rejected += b.count;
    else if (b.outcome === '221G') entry.g221 += b.count;
    map.set(b.post, entry);
  }

  return Array.from(map.entries())
    .map(([post, counts]) => {
      const total = counts.approved + counts.rejected + counts.g221;
      return {
        post,
        total,
        approved: counts.approved,
        rejected: counts.rejected,
        g221: counts.g221,
        approvalRateFormatted: formatApprovalRate(counts.approved, total),
      };
    })
    .sort((a, b) => b.total - a.total || a.post.localeCompare(b.post));
}

export function extractFilterOptions(buckets: AggregateBucket[]) {
  const months = new Set<string>();
  const posts = new Set<string>();
  const departments = new Set<string>();
  const workCities = new Set<string>();

  for (const b of buckets) {
    months.add(b.month);
    posts.add(b.post);
    departments.add(b.department);
    workCities.add(b.workCity);
  }

  return {
    months: Array.from(months).sort(),
    visaClasses: [...VISA_CLASSES],
    outcomes: [...INTERVIEW_OUTCOMES],
    posts: Array.from(posts).sort((a, b) => a.localeCompare(b)),
    departments: Array.from(departments).sort((a, b) => a.localeCompare(b)),
    workCities: Array.from(workCities).sort((a, b) => a.localeCompare(b)),
  };
}

export function getActiveFilterList(filters: DashboardFilters): Array<{ key: keyof DashboardFilters; label: string; value: string; displayValue: string }> {
  const items: Array<{ key: keyof DashboardFilters; label: string; value: string; displayValue: string }> = [];
  if (filters.month !== 'All') {
    items.push({ key: 'month', label: 'Month', value: filters.month, displayValue: formatMonthLabel(filters.month) });
  }
  if (filters.visaClass !== 'All') {
    items.push({ key: 'visaClass', label: 'Visa Class', value: filters.visaClass, displayValue: filters.visaClass });
  }
  if (filters.outcome !== 'All') {
    items.push({
      key: 'outcome',
      label: 'Outcome',
      value: filters.outcome,
      displayValue: filters.outcome === '221G' ? '221(g)' : filters.outcome,
    });
  }
  if (filters.post !== 'All') {
    items.push({ key: 'post', label: 'Interview Post', value: filters.post, displayValue: filters.post });
  }
  if (filters.department !== 'All') {
    items.push({ key: 'department', label: 'Department', value: filters.department, displayValue: filters.department });
  }
  if (filters.workCity !== 'All') {
    items.push({ key: 'workCity', label: 'India Work City', value: filters.workCity, displayValue: filters.workCity });
  }
  return items;
}

function escapeCsvField(val: string | number): string {
  const str = String(val);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an aggregate-only summary CSV.
 * Strictly omits Case IDs, Employee IDs, Employee Names, and Sample Follow-up notes.
 */
export function buildSummaryCsv(params: {
  sourceLabel: string;
  reportingPeriod: string;
  filters: DashboardFilters;
  kpis: KpiMetrics;
  postRows: PostSummaryRow[];
  visaRows: VisaClassBreakdownRow[];
  monthlyRows: MonthlyBreakdownRow[];
}): string {
  const activeFilters = getActiveFilterList(params.filters);
  const filterDescription =
    activeFilters.length === 0
      ? 'None (All Records)'
      : activeFilters.map((f) => `${f.label}: ${f.displayValue}`).join('; ');

  const lines: string[] = [];
  const pushRow = (cells: Array<string | number>) => {
    lines.push(cells.map(escapeCsvField).join(','));
  };

  pushRow(['U.S. Visa Interview Status — Aggregate Summary Export']);
  pushRow(['Dataset Source', params.sourceLabel]);
  pushRow(['Reporting Period', params.reportingPeriod]);
  pushRow(['Active Filters', filterDescription]);
  pushRow(['Privacy Scope', 'Aggregate-only (Case IDs, Employee IDs, Employee Names, and Follow-up notes omitted)']);
  pushRow(['221(g) Note', '221(g) is counted as a recorded refusal that may be reconsidered; it does not reflect final disposition.']);
  pushRow([]);

  pushRow(['Overall KPIs']);
  pushRow(['Total Interviews', 'Approved', 'Rejected', '221(g)', 'Approval Rate']);
  pushRow([
    params.kpis.total,
    params.kpis.approved,
    params.kpis.rejected,
    params.kpis.g221,
    params.kpis.approvalRateFormatted,
  ]);
  pushRow([]);

  pushRow(['Interview Post Summary']);
  pushRow(['Interview Post in India', 'Total Interviews', 'Approved', 'Rejected', '221(g)', 'Approval Rate']);
  for (const row of params.postRows) {
    pushRow([row.post, row.total, row.approved, row.rejected, row.g221, row.approvalRateFormatted]);
  }
  pushRow([]);

  pushRow(['Visa Class Comparison']);
  pushRow(['Visa Class', 'Total Interviews', 'Approved', 'Rejected', '221(g)', 'Approval Rate']);
  for (const row of params.visaRows) {
    pushRow([row.visaClass, row.total, row.approved, row.rejected, row.g221, row.approvalRateFormatted]);
  }
  pushRow([]);

  pushRow(['Monthly Breakdown']);
  pushRow(['Appointment Month', 'Total Interviews', 'Approved', 'Rejected', '221(g)', 'Approval Rate']);
  for (const row of params.monthlyRows) {
    pushRow([row.monthLabel, row.total, row.approved, row.rejected, row.g221, row.approvalRateFormatted]);
  }

  return lines.join('\r\n');
}
