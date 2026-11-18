import React from 'react';

interface TopBarProps {
  mode: 'upload' | 'dashboard';
  activeTab: 'overview' | 'data-quality';
  hasWorkbookQualityPanel: boolean;
  unresolvedCount: number;
  onSelectTab: (tab: 'overview' | 'data-quality') => void;
  onGoToUpload: () => void;
  onLoadSampleSnapshot: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  activeTab,
  hasWorkbookQualityPanel,
  unresolvedCount,
  onSelectTab,
  onGoToUpload,
  onLoadSampleSnapshot,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            if (mode === 'dashboard') onSelectTab('overview');
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm"
        >
          U.S. Visa Interview Dashboard
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {mode === 'dashboard' ? (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('overview')}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              <a
                href="#monthly-trends"
                onClick={() => onSelectTab('overview')}
                className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:text-slate-900 transition-colors"
              >
                Monthly Trends
              </a>
              <a
                href="#post-summary"
                onClick={() => onSelectTab('overview')}
                className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:text-slate-900 transition-colors"
              >
                Post Summary
              </a>
              {hasWorkbookQualityPanel && (
                <button
                  type="button"
                  onClick={() => onSelectTab('data-quality')}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'data-quality'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  {unresolvedCount > 0
                    ? `Data Quality (${unresolvedCount} unresolved)`
                    : 'Data Quality'}
                </button>
              )}
            </>
          ) : (
            <>
              <a
                href="#upload-intake"
                className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 transition-colors"
              >
                Workbook Upload
              </a>
              <a
                href="#schema-guide"
                className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 transition-colors"
              >
                Required Schema
              </a>
              <a
                href="#decision-rules"
                className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 transition-colors"
              >
                Reporting Rules
              </a>
            </>
          )}
        </nav>

        <div className="flex items-center shrink-0">
          {mode === 'dashboard' ? (
            <button
              type="button"
              onClick={onGoToUpload}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            >
              Upload Workbook
            </button>
          ) : (
            <button
              type="button"
              onClick={onLoadSampleSnapshot}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            >
              View Fictional Sample
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
