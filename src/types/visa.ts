export type VisaClass = 'H-1B' | 'L-1A' | 'L-1B';

export type InterviewStatus = 'Approved' | 'Rejected' | '221G';

export const VISA_CLASSES: VisaClass[] = ['H-1B', 'L-1A', 'L-1B'];
export const INTERVIEW_OUTCOMES: InterviewStatus[] = ['Approved', 'Rejected', '221G'];

export interface AggregateBucket {
  month: string; // YYYY-MM
  visaClass: VisaClass;
  outcome: InterviewStatus;
  post: string;
  department: string;
  workCity: string;
  count: number;
}

export interface ValidatedRecord {
  caseId: string;
  visaClass: VisaClass;
  appointmentDateISO: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  post: string;
  status: InterviewStatus;
  department: string;
  workCity: string;
  sourceRow: number;
}

export interface RowIssue {
  rowNumber: number;
  category: 'missing_required' | 'invalid_date' | 'unknown_category';
  fields: string[];
  message: string;
}

export interface DuplicateRowOption {
  rowNumber: number;
  visaClass: VisaClass;
  appointmentDateISO: string;
  month: string;
  post: string;
  status: InterviewStatus;
  department: string;
  workCity: string;
}

export interface DuplicateCaseGroup {
  caseId: string;
  rows: DuplicateRowOption[];
  isConflicting: boolean;
  resolvedChoice: number | 'exclude' | null; // rowNumber selected, 'exclude', or null if unresolved
}

export interface WorkbookSummaryTotals {
  found: boolean;
  total: number | null;
  approved: number | null;
  rejected: number | null;
  g221: number | null;
  rawRowsDetected: boolean;
}

export interface ParsedWorkbookState {
  fileName: string;
  isSampleSnapshot: boolean;
  totalDataRowsScanned: number;
  acceptedSingleRecords: ValidatedRecord[];
  duplicateGroups: DuplicateCaseGroup[];
  rowIssues: RowIssue[];
  summarySheet: WorkbookSummaryTotals;
  reportingPeriodLabel: string;
}

export interface DashboardFilters {
  month: string;
  visaClass: string;
  outcome: string;
  post: string;
  department: string;
  workCity: string;
}

export const INITIAL_FILTERS: DashboardFilters = {
  month: 'All',
  visaClass: 'All',
  outcome: 'All',
  post: 'All',
  department: 'All',
  workCity: 'All',
};

export interface KpiMetrics {
  total: number;
  approved: number;
  rejected: number;
  g221: number;
  approvalRate: number | null;
  approvalRateFormatted: string;
}

export interface PostSummaryRow {
  post: string;
  total: number;
  approved: number;
  rejected: number;
  g221: number;
  approvalRateFormatted: string;
}

export interface MonthlyBreakdownRow {
  month: string;
  monthLabel: string;
  total: number;
  approved: number;
  rejected: number;
  g221: number;
  approvalRateFormatted: string;
}

export interface VisaClassBreakdownRow {
  visaClass: VisaClass;
  total: number;
  approved: number;
  rejected: number;
  g221: number;
  approvalRateFormatted: string;
}
