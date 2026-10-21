"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import StatusFilters, { FilterValue } from "@/components/StatusFilters";
import TodayFollowUps from "@/components/TodayFollowUps";
import LeadCard from "@/components/LeadCard";
import AddLeadModal from "@/components/AddLeadModal";
import LeadTimelineModal from "@/components/LeadTimelineModal";
import { Lead, LeadStatus, Discussion } from "@/types/crm";
import { getInitialDemoLeads } from "@/data/demoLeads";
import { isToday } from "@/utils/date";
import { Users } from "lucide-react";

export default function LeadFlowHome() {
  const [leads, setLeads] = useState<Lead[]>(() => getInitialDemoLeads());
  const [activeFilter, setActiveFilter] = useState<FilterValue>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  // Status counts for chips
  const countsByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lead of leads) {
      counts[lead.status] = (counts[lead.status] || 0) + 1;
    }
    return counts;
  }, [leads]);

  // Today's follow-up reminders
  const todayFollowUps = useMemo(() => {
    return leads.filter((lead) => isToday(lead.next_follow_up_at));
  }, [leads]);

  // Filtered leads based on search and active status chip
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus =
        activeFilter === "All" || lead.status === activeFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        lead.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [leads, activeFilter, searchQuery]);

  // Selected lead for timeline modal
  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Handler: Add new lead
  const handleAddLead = (data: {
    name: string;
    company?: string;
    phone?: string;
  }) => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      id: Date.now(),
      name: data.name,
      company: data.company || null,
      phone: data.phone || null,
      status: "New",
      next_follow_up_at: null,
      created_at: now,
      updated_at: now,
      discussions: [],
      last_discussion_note: null,
      last_discussion_at: null,
    };

    setLeads((prev) => [newLead, ...prev]);
  };

  // Handler: Update lead status
  const handleUpdateStatus = (leadId: number, newStatus: LeadStatus) => {
    const now = new Date().toISOString();
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status: newStatus,
              updated_at: now,
            }
          : lead
      )
    );
  };

  // Handler: Add discussion note
  const handleAddDiscussion = (
    leadId: number,
    note: string,
    followUpAt: string | null
  ) => {
    const now = new Date().toISOString();
    const newDiscussion: Discussion = {
      id: Date.now(),
      lead_id: leadId,
      note,
      created_at: now,
      follow_up_at: followUpAt,
    };

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;

        const updatedDiscussions = [newDiscussion, ...lead.discussions];
        return {
          ...lead,
          discussions: updatedDiscussions,
          last_discussion_note: note,
          last_discussion_at: now,
          next_follow_up_at:
            followUpAt !== null ? followUpAt : lead.next_follow_up_at,
          updated_at: now,
        };
      })
    );
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
          totalCount={leads.length}
        />

        {/* Dedicated Today's Follow-ups Section */}
        <TodayFollowUps
          leads={todayFollowUps}
          onSelectLead={(lead) => setSelectedLeadId(lead.id)}
        />

        {/* Main Leads List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              All Leads ({filteredLeads.length})
            </h2>
            {searchQuery && (
              <span className="text-xs text-slate-500">
                Filtered by &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          {filteredLeads.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">
                No matching leads found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your search query or filter selection.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onSelect={(l) => setSelectedLeadId(l.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddLead}
      />

      <LeadTimelineModal
        lead={selectedLead}
        isOpen={selectedLead !== null}
        onClose={() => setSelectedLeadId(null)}
        onUpdateStatus={handleUpdateStatus}
        onAddDiscussion={handleAddDiscussion}
      />
    </div>
  );
}
