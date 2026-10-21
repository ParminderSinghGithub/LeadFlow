import React from "react";

const STATUS_PREVIEWS = [
  { label: "New", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Contacted", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Qualified", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { label: "Proposal Sent", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { label: "Won", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "Lost", color: "bg-slate-100 text-slate-600 border-slate-300" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              L
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">LeadFlow</h1>
              <p className="text-xs text-slate-500">Single-Screen Lead Management CRM</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Commit 1: Foundation
          </span>
        </div>
      </header>

      {/* Main Centered Content Column */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Leads</h2>
            <p className="text-sm text-slate-500 mt-1">
              Track customer prospects, log discussions, and schedule timely follow-ups.
            </p>
          </div>
          <div>
            <button
              type="button"
              disabled
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 opacity-60 cursor-not-allowed"
            >
              + Add Lead
            </button>
          </div>
        </div>

        {/* Foundation Placeholder Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center max-w-2xl mx-auto">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            LeadFlow Foundation Ready
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            The application foundation, FastAPI backend, PostgreSQL models, and Next.js shell are initialized. Lead lists, discussion logs, search filters, and modals will be activated in upcoming commits.
          </p>

          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Configured Lead Status Pipeline
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {STATUS_PREVIEWS.map((status) => (
                <span
                  key={status.label}
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${status.color}`}
                >
                  {status.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
