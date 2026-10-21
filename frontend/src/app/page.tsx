"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import StatusFilters, { FilterValue } from "@/components/StatusFilters";
import TodayFollowUps from "@/components/TodayFollowUps";
import LeadCard from "@/components/LeadCard";
import AddLeadModal from "@/components/AddLeadModal";
import LeadTimelineModal from "@/components/LeadTimelineModal";
import { LeadListItem, LeadStatus } from "@/types/crm";
import { api } from "@/lib/api";
import { isToday } from "@/utils/date";
import { Users, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

export default function LeadFlowHome() {
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  // Status counts for filter chips
  const [countsByStatus, setCountsByStatus] = useState<Record<string, number>>({});
  const [totalCount, setTotalCount] = useState<number>(0);

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch leads from backend
  const fetchLeads = useCallback(
    async (filter: FilterValue, search: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getLeads({
          status: filter === "All" ? undefined : filter,
          search: search.trim() || undefined,
        });
        setLeads(data);

        // When viewing all leads without search, update status counts
        if (filter === "All" && !search.trim()) {
          const counts: Record<string, number> = {};
          for (const l of data) {
            counts[l.status] = (counts[l.status] || 0) + 1;
          }
          setCountsByStatus(counts);
          setTotalCount(data.length);
        }
      } catch (err: any) {
        setError(
          err?.message ||
            "Unable to connect to the LeadFlow server. Please check your backend connection."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Trigger fetch when filter or debounced search changes
  useEffect(() => {
    fetchLeads(activeFilter, debouncedSearch);
  }, [activeFilter, debouncedSearch, fetchLeads]);

  // Refresh callback for child modals
  const handleRefresh = useCallback(() => {
    fetchLeads(activeFilter, debouncedSearch);
    // Also refresh total counts in background if currently filtering
    if (activeFilter !== "All" || debouncedSearch.trim()) {
      api.getLeads().then((allData) => {
        const counts: Record<string, number> = {};
        for (const l of allData) {
          counts[l.status] = (counts[l.status] || 0) + 1;
        }
        setCountsByStatus(counts);
        setTotalCount(allData.length);
      }).catch(() => {
        // Ignore background count refresh errors
      });
    }
  }, [activeFilter, debouncedSearch, fetchLeads]);

  // Today's follow-up reminders
  const todayFollowUps = useMemo(() => {
    return leads.filter((lead) => isToday(lead.next_follow_up_at));
  }, [leads]);

  // Handler: Add new lead via API
  const handleAddLead = async (data: {
    name: string;
    company?: string;
    phone?: string;
  }) => {
    await api.createLead(data);
    handleRefresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* Top Header */}
      <Header onOpenAddLead={() => setIsAddModalOpen(true)} />

      {/* Main Single-Screen Content Column */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Search & Status Filters */}
        <StatusFilters
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          countsByStatus={countsByStatus}
          totalCount={totalCount}
        />

        {/* Loading State */}
        {isLoading && leads.length === 0 && !error && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-700">
              Loading leads from database...
            </p>
          </div>
        )}

        {/* Recoverable Error State */}
        {error && (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center shadow-xs">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Backend Connection Error
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-5 leading-relaxed">
              {error}
            </p>
            <button
              type="button"
              onClick={() => fetchLeads(activeFilter, debouncedSearch)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Live Content (when no fatal error) */}
        {!error && (
          <>
            {/* Dedicated Today's Follow-ups Section */}
            <TodayFollowUps
              leads={todayFollowUps}
              onSelectLead={(lead) => setSelectedLeadId(lead.id)}
            />

            {/* Main Leads List */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                  All Leads ({leads.length})
                </h2>
                {isLoading && (
                  <span className="flex items-center gap-1.5 text-xs text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Updating...</span>
                  </span>
                )}
                {!isLoading && debouncedSearch && (
                  <span className="text-xs text-slate-500">
                    Filtered by &ldquo;{debouncedSearch}&rdquo;
                  </span>
                )}
              </div>

              {leads.length === 0 && !isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-slate-800">
                    {debouncedSearch || activeFilter !== "All"
                      ? "No matching leads found"
                      : "No leads in CRM yet"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {debouncedSearch || activeFilter !== "All"
                      ? "Try adjusting your search query or selecting a different status filter."
                      : "Get started by adding your first prospect using the '+ Add New Lead' button above."}
                  </p>
                  {activeFilter === "All" && !debouncedSearch && (
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                    >
                      + Add First Lead
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {leads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onSelect={(l) => setSelectedLeadId(l.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddLead}
      />

      {/* Lead Timeline Modal */}
      <LeadTimelineModal
        leadId={selectedLeadId}
        isOpen={selectedLeadId !== null}
        onClose={() => setSelectedLeadId(null)}
        onLeadUpdated={handleRefresh}
      />
    </div>
  );
}
