import * as XLSX from 'xlsx';
import {
  DuplicateCaseGroup,
  DuplicateRowOption,
  InterviewStatus,
  ParsedWorkbookState,
  RowIssue,
  ValidatedRecord,
  VisaClass,
  WorkbookSummaryTotals,
} from '../types/visa';

const REQUIRED_HEADERS = [
  'Case ID',
  'Visa Class',
  'Appointment Date',
  'Interview Post in India',
  'Interview Status',
] as const;

const RECOGNIZED_HEADERS = [
  'Case ID',
  'Employee ID',
  'Employee Name',
  'India Work City',
  'Designation',
  'Department',
  'Visa Class',
  'Appointment Date',
  'Interview Post in India',
  'Interview Status',
  'Sample Follow-up',
] as const;

const MONTH_NAME_MAP: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

export class WorkbookUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkbookUploadError';
  }
}

function normalizeHeader(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function normalizeVisaClass(raw: string): VisaClass | null {
  const cleaned = raw.trim().replace(/\s+/g, '').toUpperCase();
  if (cleaned === 'H-1B') return 'H-1B';
  if (cleaned === 'L-1A') return 'L-1A';
  if (cleaned === 'L-1B') return 'L-1B';
  return null;
}

function normalizeInterviewStatus(raw: string): InterviewStatus | null {
  const cleaned = raw.trim().replace(/\s+/g, '').toLowerCase();
  if (cleaned === 'approved') return 'Approved';
  if (cleaned === 'rejected') return 'Rejected';
  if (cleaned === '221g' || cleaned === '221(g)') return '221G';
  return null;
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 1990 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

function formatDateISO(year: number, month: number, day: number): { iso: string; month: string } {
  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return {
    iso: `${yyyy}-${mm}-${dd}`,
    month: `${yyyy}-${mm}`,
  };
}

function parseExcelSerial(serial: number): { iso: string; month: string } | null {
  // Excel date serial bounds roughly 1970 (25569) to 2099 (73050), also allow 1950+ (18264)
  if (!Number.isFinite(serial) || serial < 18264 || serial > 73050) return null;
  const parsed = XLSX.SSF.parse_date_code(serial);
  if (!parsed || !isValidCalendarDate(parsed.y, parsed.m, parsed.d)) return null;
  return formatDateISO(parsed.y, parsed.m, parsed.d);
}

function parseAppointmentDateCell(cell: XLSX.CellObject | undefined): { iso: string; month: string } | null {
  if (!cell) return null;

  // 1. Native Date object (if ever passed)
  if (cell.v instanceof Date && !Number.isNaN(cell.v.getTime())) {
    const y = cell.v.getFullYear();
    const m = cell.v.getMonth() + 1;
    const d = cell.v.getDate();
    if (!isValidCalendarDate(y, m, d)) return null;
    return formatDateISO(y, m, d);
  }

  // 2. Excel numeric date cell
  if (cell.t === 'n' && typeof cell.v === 'number') {
    const fmt = typeof cell.z === 'string' ? cell.z.toLowerCase() : '';
    const looksLikeDateFmt =
      /[ymd]/.test(fmt) && !/^[0#.,%\s]+$/.test(fmt);
    const formattedLooksLikeDate =
      typeof cell.w === 'string' && /[\/\-a-zA-Z]/.test(cell.w);

    if (looksLikeDateFmt || formattedLooksLikeDate || (cell.v >= 32874 && cell.v <= 60000)) {
      return parseExcelSerial(cell.v);
    }
    return null;
  }

  // 3. String date cell (must be unambiguous)
  const rawStr = String(cell.v ?? cell.w ?? '').trim();
  if (!rawStr) return null;

  // ISO format: YYYY-MM-DD or YYYY/MM/DD (with optional time)
  const isoMatch = rawStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[T\s].*)?$/);
  if (isoMatch) {
    const y = Number(isoMatch[1]);
    const m = Number(isoMatch[2]);
    const d = Number(isoMatch[3]);
    if (!isValidCalendarDate(y, m, d)) return null;
    return formatDateISO(y, m, d);
  }

  // Named month: DD-MMM-YYYY or DD MMM YYYY or DD-MMMM-YYYY
  const dmyTextMatch = rawStr.match(/^(\d{1,2})[\s\-\/,]+([A-Za-z]+)[\s\-\/,]+(\d{4})$/);
  if (dmyTextMatch) {
    const d = Number(dmyTextMatch[1]);
    const m = MONTH_NAME_MAP[dmyTextMatch[2].toLowerCase()];
    const y = Number(dmyTextMatch[3]);
    if (!m || !isValidCalendarDate(y, m, d)) return null;
    return formatDateISO(y, m, d);
  }

  // Named month: MMM DD, YYYY or MMMM DD YYYY
  const mdyTextMatch = rawStr.match(/^([A-Za-z]+)[\s\-\/]+(\d{1,2})[\s,\/\-]+(\d{4})$/);
  if (mdyTextMatch) {
    const m = MONTH_NAME_MAP[mdyTextMatch[1].toLowerCase()];
    const d = Number(mdyTextMatch[2]);
    const y = Number(mdyTextMatch[3]);
    if (!m || !isValidCalendarDate(y, m, d)) return null;
    return formatDateISO(y, m, d);
  }

  // YYYY-MMM-DD
  const ymdTextMatch = rawStr.match(/^(\d{4})[\s\-\/]([A-Za-z]+)[\s\-\/](\d{1,2})$/);
  if (ymdTextMatch) {
    const y = Number(ymdTextMatch[1]);
    const m = MONTH_NAME_MAP[ymdTextMatch[2].toLowerCase()];
    const d = Number(ymdTextMatch[3]);
    if (!m || !isValidCalendarDate(y, m, d)) return null;
    return formatDateISO(y, m, d);
  }

  // Numeric slash/dash format: A/B/YYYY -> only accept when unambiguous!
  const numSlashMatch = rawStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (numSlashMatch) {
    const a = Number(numSlashMatch[1]);
    const b = Number(numSlashMatch[2]);
    const y = Number(numSlashMatch[3]);
    if (a > 12 && b >= 1 && b <= 12) {
      // Unambiguous DD/MM/YYYY
      if (!isValidCalendarDate(y, b, a)) return null;
      return formatDateISO(y, b, a);
    }
    if (b > 12 && a >= 1 && a <= 12) {
      // Unambiguous MM/DD/YYYY
      if (!isValidCalendarDate(y, a, b)) return null;
      return formatDateISO(y, a, b);
    }
    if (a === b && a >= 1 && a <= 12) {
      // Same day & month (e.g. 05/05/2026) -> unambiguous
      if (!isValidCalendarDate(y, a, b)) return null;
      return formatDateISO(y, a, b);
    }
    // Ambiguous (both <= 12 and different)
    return null;
  }

  return null;
}

function getCellDisplayText(cell: XLSX.CellObject | undefined): string {
  if (!cell) return '';
  if (cell.v === undefined || cell.v === null) return '';
  return String(cell.v).trim();
}

function findHeaderRow(sheet: XLSX.WorkSheet): {
  headerRowIndex: number;
  columnMap: Map<string, number>;
  maxCol: number;
  maxRow: number;
} {
  const ref = sheet['!ref'];
  if (!ref) {
    throw new WorkbookUploadError('The "Interview Records" worksheet is empty.');
  }
  const range = XLSX.utils.decode_range(ref);
  const scanLimit = Math.min(range.e.r, range.s.r + 15);
  const recognizedSet = new Set(RECOGNIZED_HEADERS.map((h) => normalizeHeader(h)));

  let bestRow = range.s.r;
  let bestScore = -1;
  let bestMap = new Map<string, number>();

  for (let r = range.s.r; r <= scanLimit; r++) {
    const rowMap = new Map<string, number>();
    let score = 0;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const val = getCellDisplayText(sheet[addr]);
      const norm = normalizeHeader(val);
      if (norm && !rowMap.has(norm)) {
        rowMap.set(norm, c);
        if (recognizedSet.has(norm)) {
          score += 1;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestRow = r;
      bestMap = rowMap;
    }
  }

  return {
    headerRowIndex: bestRow,
    columnMap: bestMap,
    maxCol: range.e.c,
    maxRow: range.e.r,
  };
}

function parseSummarySheet(workbook: XLSX.WorkBook): WorkbookSummaryTotals {
  const summaryName = workbook.SheetNames.find(
    (name) => name.trim().toLowerCase() === 'summary'
  );
  if (!summaryName) {
    return {
      found: false,
      total: null,
      approved: null,
      rejected: null,
      g221: null,
      rawRowsDetected: false,
    };
  }

  const sheet = workbook.Sheets[summaryName];
  if (!sheet || !sheet['!ref']) {
    return {
      found: true,
      total: null,
      approved: null,
      rejected: null,
      g221: null,
      rawRowsDetected: false,
    };
  }

  const range = XLSX.utils.decode_range(sheet['!ref']);
  let total: number | null = null;
  let approved: number | null = null;
  let rejected: number | null = null;
  let g221: number | null = null;

  const readNumericCell = (r: number, c: number): number | null => {
    const cell = sheet[XLSX.utils.encode_cell({ r, c })];
    if (!cell) return null;
    if (typeof cell.v === 'number' && Number.isFinite(cell.v)) {
      return Math.round(cell.v);
    }
    if (typeof cell.v === 'string') {
      const cleaned = cell.v.replace(/,/g, '').trim();
      if (/^\d+$/.test(cleaned)) return Number(cleaned);
    }
    return null;
  };

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      const text = getCellDisplayText(cell).toLowerCase().replace(/\s+/g, ' ');
      if (!text) continue;

      const findAdjacentNumber = (): number | null => {
        for (let offset = 1; offset <= 3 && c + offset <= range.e.c; offset++) {
          const val = readNumericCell(r, c + offset);
          if (val !== null) return val;
        }
        if (r + 1 <= range.e.r) {
          const below = readNumericCell(r + 1, c);
          if (below !== null) return below;
        }
        return null;
      };

      if (
        (text === 'total' ||
          text === 'total interviews' ||
          text === 'grand total' ||
          text === 'total records') &&
        total === null
      ) {
        const val = findAdjacentNumber();
        if (val !== null) total = val;
      } else if (text === 'approved' && approved === null) {
        const val = findAdjacentNumber();
        if (val !== null) approved = val;
      } else if (text === 'rejected' && rejected === null) {
        const val = findAdjacentNumber();
        if (val !== null) rejected = val;
      } else if ((text === '221g' || text === '221(g)') && g221 === null) {
        const val = findAdjacentNumber();
        if (val !== null) g221 = val;
      }
    }
  }

  return {
    found: true,
    total,
    approved,
    rejected,
    g221,
    rawRowsDetected: approved !== null || rejected !== null || g221 !== null || total !== null,
  };
}

export function formatMonthLabel(monthYYYYMM: string): string {
  const [yStr, mStr] = monthYYYYMM.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  if (!y || !m || m < 1 || m > 12) return monthYYYYMM;
  const date = new Date(Date.UTC(y, m - 1, 1));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function computeReportingPeriodLabel(months: string[]): string {
  if (months.length === 0) return 'No valid dates';
  const sorted = [...new Set(months)].sort();
  if (sorted.length === 1) return formatMonthLabel(sorted[0]);
  return `${formatMonthLabel(sorted[0])} – ${formatMonthLabel(sorted[sorted.length - 1])}`;
}

export function parseVisaWorkbook(arrayBuffer: ArrayBuffer, fileName: string): ParsedWorkbookState {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: false,
      cellNF: true,
    });
  } catch {
    throw new WorkbookUploadError(
      'Unable to read the uploaded file. Please ensure it is a valid Excel workbook (.xlsx, .xls, .xlsm, .xlsb, .ods, or .csv).'
    );
  }

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new WorkbookUploadError('The uploaded workbook contains no worksheets.');
  }

  const recordsSheetName = workbook.SheetNames.find(
    (name) => name.trim().toLowerCase() === 'interview records'
  );

  if (!recordsSheetName) {
    throw new WorkbookUploadError(
      `Missing required worksheet "Interview Records". Found worksheets: ${workbook.SheetNames.join(', ')}.`
    );
  }

  const sheet = workbook.Sheets[recordsSheetName];
  const { headerRowIndex, columnMap, maxRow } = findHeaderRow(sheet);

  const missingColumns: string[] = [];
  for (const required of REQUIRED_HEADERS) {
    if (!columnMap.has(normalizeHeader(required))) {
      missingColumns.push(required);
    }
  }

  if (missingColumns.length > 0) {
    throw new WorkbookUploadError(
      `Missing required column${missingColumns.length > 1 ? 's' : ''} in "Interview Records": ${missingColumns.join(', ')}.`
    );
  }

  const colCaseId = columnMap.get(normalizeHeader('Case ID'))!;
  const colVisaClass = columnMap.get(normalizeHeader('Visa Class'))!;
  const colAppointmentDate = columnMap.get(normalizeHeader('Appointment Date'))!;
  const colPost = columnMap.get(normalizeHeader('Interview Post in India'))!;
  const colStatus = columnMap.get(normalizeHeader('Interview Status'))!;
  const colDepartment = columnMap.get(normalizeHeader('Department'));
  const colWorkCity = columnMap.get(normalizeHeader('India Work City'));

  // Note: Employee ID, Employee Name, Designation, and Sample Follow-up
  // are intentionally NOT stored in memory beyond validation if needed,
  // ensuring zero PII is retained in the dashboard state.

  const rowIssues: RowIssue[] = [];
  const validRows: ValidatedRecord[] = [];
  let totalDataRowsScanned = 0;

  for (let r = headerRowIndex + 1; r <= maxRow; r++) {
    const excelRowNum = r + 1;

    const caseIdCell = sheet[XLSX.utils.encode_cell({ r, c: colCaseId })];
    const visaCell = sheet[XLSX.utils.encode_cell({ r, c: colVisaClass })];
    const dateCell = sheet[XLSX.utils.encode_cell({ r, c: colAppointmentDate })];
    const postCell = sheet[XLSX.utils.encode_cell({ r, c: colPost })];
    const statusCell = sheet[XLSX.utils.encode_cell({ r, c: colStatus })];
    const deptCell =
      colDepartment !== undefined ? sheet[XLSX.utils.encode_cell({ r, c: colDepartment })] : undefined;
    const cityCell =
      colWorkCity !== undefined ? sheet[XLSX.utils.encode_cell({ r, c: colWorkCity })] : undefined;

    const rawCaseId = getCellDisplayText(caseIdCell);
    const rawVisa = getCellDisplayText(visaCell);
    const rawDate = getCellDisplayText(dateCell);
    const rawPost = getCellDisplayText(postCell);
    const rawStatus = getCellDisplayText(statusCell);
    const rawDept = getCellDisplayText(deptCell);
    const rawCity = getCellDisplayText(cityCell);

    // Skip completely empty rows
    if (!rawCaseId && !rawVisa && !rawDate && !rawPost && !rawStatus && !rawDept && !rawCity) {
      continue;
    }

    totalDataRowsScanned += 1;

    // 1. Missing required values check
    const missingFields: string[] = [];
    if (!rawCaseId) missingFields.push('Case ID');
    if (!rawVisa) missingFields.push('Visa Class');
    if (!rawDate && !(dateCell && dateCell.t === 'n')) missingFields.push('Appointment Date');
    if (!rawPost) missingFields.push('Interview Post in India');
    if (!rawStatus) missingFields.push('Interview Status');

    if (missingFields.length > 0) {
      rowIssues.push({
        rowNumber: excelRowNum,
        category: 'missing_required',
        fields: missingFields,
        message: `Row ${excelRowNum}: Missing required value${missingFields.length > 1 ? 's' : ''} (${missingFields.join(', ')}).`,
      });
      continue;
    }

    // 2. Category normalization & validation
    const normalizedVisa = normalizeVisaClass(rawVisa);
    const normalizedStatus = normalizeInterviewStatus(rawStatus);
    const unknownFields: string[] = [];
    if (!normalizedVisa) unknownFields.push(`Visa Class "${rawVisa}"`);
    if (!normalizedStatus) unknownFields.push(`Interview Status "${rawStatus}"`);

    if (unknownFields.length > 0) {
      rowIssues.push({
        rowNumber: excelRowNum,
        category: 'unknown_category',
        fields: unknownFields,
        message: `Row ${excelRowNum}: Unrecognized category (${unknownFields.join('; ')}). Allowed Visa Class: H-1B, L-1A, L-1B. Allowed Interview Status: Approved, Rejected, 221G.`,
      });
      continue;
    }

    // 3. Date validation
    const parsedDate = parseAppointmentDateCell(dateCell);
    if (!parsedDate) {
      rowIssues.push({
        rowNumber: excelRowNum,
        category: 'invalid_date',
        fields: ['Appointment Date'],
        message: `Row ${excelRowNum}: Invalid or ambiguous Appointment Date ("${dateCell?.w ?? rawDate}"). Use an Excel date cell or unambiguous format like YYYY-MM-DD or DD-MMM-YYYY.`,
      });
      continue;
    }

    validRows.push({
      caseId: rawCaseId.toUpperCase(),
      visaClass: normalizedVisa!,
      appointmentDateISO: parsedDate.iso,
      month: parsedDate.month,
      post: rawPost.replace(/\s+/g, ' '),
      status: normalizedStatus!,
      department: rawDept ? rawDept.replace(/\s+/g, ' ') : 'Unspecified',
      workCity: rawCity ? rawCity.replace(/\s+/g, ' ') : 'Unspecified',
      sourceRow: excelRowNum,
    });
  }

  if (totalDataRowsScanned === 0) {
    throw new WorkbookUploadError('The "Interview Records" worksheet has headers but contains no interview rows.');
  }

  // Group valid rows by Case ID to detect duplicates
  const groupedByCase = new Map<string, ValidatedRecord[]>();
  for (const row of validRows) {
    const existing = groupedByCase.get(row.caseId);
    if (existing) {
      existing.push(row);
    } else {
      groupedByCase.set(row.caseId, [row]);
    }
  }

  const acceptedSingleRecords: ValidatedRecord[] = [];
  const duplicateGroups: DuplicateCaseGroup[] = [];

  for (const [caseId, rows] of groupedByCase.entries()) {
    if (rows.length === 1) {
      acceptedSingleRecords.push(rows[0]);
    } else {
      const first = rows[0];
      const isConflicting = rows.some(
        (r) =>
          r.visaClass !== first.visaClass ||
          r.appointmentDateISO !== first.appointmentDateISO ||
          r.post.toLowerCase() !== first.post.toLowerCase() ||
          r.status !== first.status
      );

      const options: DuplicateRowOption[] = rows.map((r) => ({
        rowNumber: r.sourceRow,
        visaClass: r.visaClass,
        appointmentDateISO: r.appointmentDateISO,
        month: r.month,
        post: r.post,
        status: r.status,
        department: r.department,
        workCity: r.workCity,
      }));

      duplicateGroups.push({
        caseId,
        rows: options,
        isConflicting,
        resolvedChoice: isConflicting ? null : first.sourceRow,
      });
    }
  }

  const summarySheet = parseSummarySheet(workbook);

  const initialMonths = [
    ...acceptedSingleRecords.map((r) => r.month),
    ...duplicateGroups
      .filter((g) => typeof g.resolvedChoice === 'number')
      .map((g) => {
        const chosen = g.rows.find((r) => r.rowNumber === g.resolvedChoice);
        return chosen ? chosen.month : '';
      })
      .filter(Boolean),
  ];

  return {
    fileName,
    isSampleSnapshot: false,
    totalDataRowsScanned,
    acceptedSingleRecords,
    duplicateGroups,
    rowIssues,
    summarySheet,
    reportingPeriodLabel: computeReportingPeriodLabel(initialMonths),
  };
}
