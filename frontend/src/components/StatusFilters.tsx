import React from "react";
import { Search, X } from "lucide-react";
import { LeadStatus, ALL_STATUSES } from "@/types/crm";

export type FilterValue = "All" | LeadStatus;

interface StatusFiltersProps {
  activeFilter: FilterValue;
  onSelectFilter: (filter: FilterValue) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  countsByStatus: Record<string, number>;
  totalCount: number;
}

export default function StatusFilters({
  activeFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  countsByStatus,
  totalCount,
}: StatusFiltersProps) {
  const filterOptions: FilterValue[] = ["All", ...ALL_STATUSES];

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search leads by name..."
          className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter;
          const count = filter === "All" ? totalCount : countsByStatus[filter] || 0;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => onSelectFilter(filter)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{filter}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
