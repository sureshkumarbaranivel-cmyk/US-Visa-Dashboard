import { AggregateBucket } from '../types/visa';

/**
 * Pre-computed aggregate-only snapshot labeled "Fictional sample data".
 * Contains zero PII (no employee names, employee IDs, case IDs, or follow-up notes)
 * and zero raw Excel workbook data.
 *
 * Verified totals (no filters):
 * - Total Interviews: 200
 * - Approved: 162 (81.0%)
 * - Rejected: 11
 * - 221(g): 27
 * - Hyderabad: 108 | Chennai: 92
 */
export const SAMPLE_SNAPSHOT_BUCKETS: AggregateBucket[] = [
  // Hyderabad — Approved (89)
  { month: '2026-01', visaClass: 'H-1B', outcome: 'Approved', post: 'Hyderabad', department: 'Engineering', workCity: 'Bengaluru', count: 10 },
  { month: '2026-01', visaClass: 'L-1A', outcome: 'Approved', post: 'Hyderabad', department: 'Cloud Infrastructure', workCity: 'Hyderabad', count: 4 },
  { month: '2026-02', visaClass: 'H-1B', outcome: 'Approved', post: 'Hyderabad', department: 'Engineering', workCity: 'Hyderabad', count: 9 },
  { month: '2026-02', visaClass: 'L-1B', outcome: 'Approved', post: 'Hyderabad', department: 'Data & Analytics', workCity: 'Pune', count: 5 },
  { month: '2026-03', visaClass: 'H-1B', outcome: 'Approved', post: 'Hyderabad', department: 'Product & Design', workCity: 'Bengaluru', count: 11 },
  { month: '2026-03', visaClass: 'L-1A', outcome: 'Approved', post: 'Hyderabad', department: 'Enterprise Consulting', workCity: 'Gurugram', count: 5 },
  { month: '2026-04', visaClass: 'H-1B', outcome: 'Approved', post: 'Hyderabad', department: 'Engineering', workCity: 'Bengaluru', count: 10 },
  { month: '2026-04', visaClass: 'L-1B', outcome: 'Approved', post: 'Hyderabad', department: 'Cloud Infrastructure', workCity: 'Hyderabad', count: 4 },
  { month: '2026-05', visaClass: 'H-1B', outcome: 'Approved', post: 'Hyderabad', department: 'Data & Analytics', workCity: 'Pune', count: 8 },
  { month: '2026-05', visaClass: 'L-1A', outcome: 'Approved', post: 'Hyderabad', department: 'Engineering', workCity: 'Hyderabad', count: 5 },
  { month: '2026-06', visaClass: 'H-1B', outcome: 'Approved', post: 'Hyderabad', department: 'Cloud Infrastructure', workCity: 'Bengaluru', count: 9 },
  { month: '2026-06', visaClass: 'L-1B', outcome: 'Approved', post: 'Hyderabad', department: 'Product & Design', workCity: 'Gurugram', count: 4 },
  { month: '2026-07', visaClass: 'H-1B', outcome: 'Approved', post: 'Hyderabad', department: 'Engineering', workCity: 'Hyderabad', count: 5 },

  // Hyderabad — Rejected (6)
  { month: '2026-01', visaClass: 'H-1B', outcome: 'Rejected', post: 'Hyderabad', department: 'Engineering', workCity: 'Pune', count: 1 },
  { month: '2026-03', visaClass: 'L-1B', outcome: 'Rejected', post: 'Hyderabad', department: 'Product & Design', workCity: 'Bengaluru', count: 1 },
  { month: '2026-04', visaClass: 'H-1B', outcome: 'Rejected', post: 'Hyderabad', department: 'Data & Analytics', workCity: 'Gurugram', count: 1 },
  { month: '2026-05', visaClass: 'H-1B', outcome: 'Rejected', post: 'Hyderabad', department: 'Engineering', workCity: 'Hyderabad', count: 1 },
  { month: '2026-06', visaClass: 'L-1A', outcome: 'Rejected', post: 'Hyderabad', department: 'Enterprise Consulting', workCity: 'Bengaluru', count: 1 },
  { month: '2026-07', visaClass: 'H-1B', outcome: 'Rejected', post: 'Hyderabad', department: 'Cloud Infrastructure', workCity: 'Pune', count: 1 },

  // Hyderabad — 221G (13)
  { month: '2026-01', visaClass: 'H-1B', outcome: '221G', post: 'Hyderabad', department: 'Cloud Infrastructure', workCity: 'Bengaluru', count: 2 },
  { month: '2026-02', visaClass: 'H-1B', outcome: '221G', post: 'Hyderabad', department: 'Engineering', workCity: 'Hyderabad', count: 2 },
  { month: '2026-03', visaClass: 'L-1B', outcome: '221G', post: 'Hyderabad', department: 'Data & Analytics', workCity: 'Pune', count: 2 },
  { month: '2026-04', visaClass: 'H-1B', outcome: '221G', post: 'Hyderabad', department: 'Product & Design', workCity: 'Bengaluru', count: 2 },
  { month: '2026-05', visaClass: 'L-1A', outcome: '221G', post: 'Hyderabad', department: 'Enterprise Consulting', workCity: 'Gurugram', count: 1 },
  { month: '2026-06', visaClass: 'H-1B', outcome: '221G', post: 'Hyderabad', department: 'Engineering', workCity: 'Hyderabad', count: 2 },
  { month: '2026-07', visaClass: 'L-1B', outcome: '221G', post: 'Hyderabad', department: 'Cloud Infrastructure', workCity: 'Bengaluru', count: 2 },

  // Chennai — Approved (73)
  { month: '2026-01', visaClass: 'H-1B', outcome: 'Approved', post: 'Chennai', department: 'Engineering', workCity: 'Chennai', count: 8 },
  { month: '2026-01', visaClass: 'L-1A', outcome: 'Approved', post: 'Chennai', department: 'Enterprise Consulting', workCity: 'Bengaluru', count: 4 },
  { month: '2026-02', visaClass: 'H-1B', outcome: 'Approved', post: 'Chennai', department: 'Product & Design', workCity: 'Chennai', count: 7 },
  { month: '2026-02', visaClass: 'L-1B', outcome: 'Approved', post: 'Chennai', department: 'Cloud Infrastructure', workCity: 'Bengaluru', count: 4 },
  { month: '2026-03', visaClass: 'H-1B', outcome: 'Approved', post: 'Chennai', department: 'Engineering', workCity: 'Pune', count: 9 },
  { month: '2026-03', visaClass: 'L-1A', outcome: 'Approved', post: 'Chennai', department: 'Data & Analytics', workCity: 'Chennai', count: 4 },
  { month: '2026-04', visaClass: 'H-1B', outcome: 'Approved', post: 'Chennai', department: 'Cloud Infrastructure', workCity: 'Bengaluru', count: 8 },
  { month: '2026-04', visaClass: 'L-1B', outcome: 'Approved', post: 'Chennai', department: 'Engineering', workCity: 'Chennai', count: 4 },
  { month: '2026-05', visaClass: 'H-1B', outcome: 'Approved', post: 'Chennai', department: 'Enterprise Consulting', workCity: 'Gurugram', count: 7 },
  { month: '2026-05', visaClass: 'L-1A', outcome: 'Approved', post: 'Chennai', department: 'Product & Design', workCity: 'Bengaluru', count: 4 },
  { month: '2026-06', visaClass: 'H-1B', outcome: 'Approved', post: 'Chennai', department: 'Engineering', workCity: 'Chennai', count: 7 },
  { month: '2026-06', visaClass: 'L-1B', outcome: 'Approved', post: 'Chennai', department: 'Data & Analytics', workCity: 'Pune', count: 3 },
  { month: '2026-07', visaClass: 'H-1B', outcome: 'Approved', post: 'Chennai', department: 'Cloud Infrastructure', workCity: 'Chennai', count: 4 },

  // Chennai — Rejected (5)
  { month: '2026-02', visaClass: 'H-1B', outcome: 'Rejected', post: 'Chennai', department: 'Engineering', workCity: 'Bengaluru', count: 1 },
  { month: '2026-03', visaClass: 'L-1B', outcome: 'Rejected', post: 'Chennai', department: 'Cloud Infrastructure', workCity: 'Chennai', count: 1 },
  { month: '2026-05', visaClass: 'H-1B', outcome: 'Rejected', post: 'Chennai', department: 'Data & Analytics', workCity: 'Pune', count: 1 },
  { month: '2026-06', visaClass: 'L-1A', outcome: 'Rejected', post: 'Chennai', department: 'Enterprise Consulting', workCity: 'Gurugram', count: 1 },
  { month: '2026-07', visaClass: 'H-1B', outcome: 'Rejected', post: 'Chennai', department: 'Product & Design', workCity: 'Chennai', count: 1 },

  // Chennai — 221G (14)
  { month: '2026-01', visaClass: 'H-1B', outcome: '221G', post: 'Chennai', department: 'Engineering', workCity: 'Chennai', count: 2 },
  { month: '2026-02', visaClass: 'L-1B', outcome: '221G', post: 'Chennai', department: 'Data & Analytics', workCity: 'Bengaluru', count: 2 },
  { month: '2026-03', visaClass: 'H-1B', outcome: '221G', post: 'Chennai', department: 'Cloud Infrastructure', workCity: 'Chennai', count: 2 },
  { month: '2026-04', visaClass: 'H-1B', outcome: '221G', post: 'Chennai', department: 'Engineering', workCity: 'Pune', count: 3 },
  { month: '2026-05', visaClass: 'L-1B', outcome: '221G', post: 'Chennai', department: 'Product & Design', workCity: 'Bengaluru', count: 2 },
  { month: '2026-06', visaClass: 'H-1B', outcome: '221G', post: 'Chennai', department: 'Enterprise Consulting', workCity: 'Chennai', count: 2 },
  { month: '2026-07', visaClass: 'L-1A', outcome: '221G', post: 'Chennai', department: 'Engineering', workCity: 'Gurugram', count: 1 },
];

export const SAMPLE_REPORTING_PERIOD = 'Jan 2026 – Jul 2026';
export const SAMPLE_SOURCE_LABEL = 'Fictional sample data (Aggregate-Only Snapshot)';
