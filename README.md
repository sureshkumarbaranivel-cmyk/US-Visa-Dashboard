# U.S. Visa Interview Status Dashboard

A browser-based, offline-capable **U.S. Visa Interview Status Dashboard** built for Global Mobility, HR Operations, and senior leadership.

All Excel parsing, validation, deduplication, and aggregation run strictly in browser memory using locally bundled **SheetJS (`xlsx`)** and **Chart.js**—with zero network uploads, zero analytics, and zero persistent browser storage.

---

## 1. Local Launch

### Prerequisites
- Node.js 18+ and npm

### Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 2. Static Hosting & Deployment

Build the production static bundle (all dependencies, SheetJS, Chart.js, and fonts are pinned and bundled locally with no external runtime CDN requests):

```bash
npm run build
```

The static site is output to `dist/` (`dist/index.html` and local `dist/assets/*`). Host `dist/` on any static file server, internal intranet, S3 bucket, GitHub Pages, or Nginx without backend dependencies.

> **Important:** Do **not** commit or bundle any raw Excel workbook containing employee records into the repository or `dist/` deployment package. If opening the dashboard without uploading a workbook, use the built-in **Fictional sample data** aggregate-only snapshot.

---

## 3. Workbook Upload Requirements

- **Supported Formats:** `.xlsx`, `.xls`, `.xlsm`, `.xlsb`, `.ods`, `.csv`
- **Source Worksheet:** `Interview Records`
- **Reconciliation Worksheet (Optional):** `Summary` (compared automatically against validated Interview Records; if totals differ, a reconciliation warning is shown and dashboard calculations use the validated records)
- **Column Headers Read:**
  - **Required:** `Case ID`, `Visa Class`, `Appointment Date`, `Interview Post in India`, `Interview Status`
  - **Optional Filter Dimensions:** `Department`, `India Work City` (kept separate from `Interview Post in India`)
  - **Recognized & Omitted from Published View / CSV Export:** `Employee ID`, `Employee Name`, `Designation`, `Sample Follow-up`
- **Normalized Categories:**
  - `Visa Class`: `H-1B`, `L-1A`, `L-1B`
  - `Interview Status`: `Approved`, `Rejected`, `221G` (displayed as `221(g)`)

---

## 4. Test Checklist

Use this checklist to verify dashboard correctness before publishing or distributing:

1. **Sample Snapshot Totals (No Filters)**
   - Open **Open Sample Snapshot** (labeled *Fictional sample data*).
   - Verify **Total Interviews = 200**, **Approved = 162**, **Rejected = 11**, **221(g) = 27**, and **Approval Rate = 81.0%**.
   - Verify Interview Post Summary totals: **Hyderabad = 108** and **Chennai = 92**.
2. **Filter Updates Across All Views**
   - Change each of the 6 filters (`Appointment Month`, `Visa Class`, `Outcome`, `Interview Post`, `Department`, `India Work City`).
   - Confirm all 5 KPI cards, both Chart.js charts, the Interview Post Summary table, and the Active Filters summary update simultaneously.
   - Confirm clicking a row in the Interview Post Summary table filters by that post, and clicking **Reset Filters** restores all records.
3. **Invalid Uploads & Row Validation**
   - Upload a workbook missing the `Interview Records` worksheet -> verify clear error message.
   - Upload a workbook missing one or more required columns -> verify error names the exact missing column(s).
   - Include rows with missing required values, invalid/ambiguous dates, or unknown Visa Class / Interview Status values -> verify they are excluded and flagged with exact Excel row numbers under **Data Quality**.
4. **Duplicate Case IDs & Summary Reconciliation**
   - Include identical duplicate Case IDs -> verify 1 interview is counted per unique Case ID and extra rows are counted in Excluded Rows.
   - Include conflicting duplicate Case IDs (differing Visa Class, Appointment Date, Post, or Status) -> verify they are held out as unresolved until resolved in **Data Quality**, and resolving them immediately updates dashboard totals.
   - Include a `Summary` worksheet whose numbers differ from validated `Interview Records` -> verify the Reconciliation Warning banner displays side-by-side totals and dashboard metrics use the validated records.
5. **Empty Filter Results**
   - Apply a filter combination with zero matching interviews (e.g., `Outcome: Rejected` + a month/city with no rejections).
   - Verify KPIs display `0` and **Approval Rate** displays `—`, and a clear empty-results message with **Reset Filters** appears.
6. **Aggregate-Only CSV Export & Print View**
   - Click **Download Summary CSV** -> verify the downloaded CSV contains active filters, reporting period, KPI totals, Post summary, Visa Class comparison, and Monthly breakdown, with **zero** `Employee Name`, `Employee ID`, `Case ID`, or `Sample Follow-up` values.
   - Trigger **Print View** -> verify controls/upload chrome are hidden while active filters, reporting period, KPIs, charts, and post table format cleanly.
