import React from "react";
import { TrendingUp, Plus } from "lucide-react";

interface HeaderProps {
  onOpenAddLead: () => void;
}

export default function Header({ onOpenAddLead }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              LeadFlow
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div>
          <button
            type="button"
            onClick={onOpenAddLead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>
    </header>
  );
}
