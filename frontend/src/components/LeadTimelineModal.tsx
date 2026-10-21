import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Phone,
  Building2,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { LeadDetail, LeadStatus, ALL_STATUSES } from "@/types/crm";
import { api } from "@/lib/api";
import {
  formatDateTime,
  formatRelativeTime,
  formatFollowUpDisplay,
  isOverdue,
} from "@/utils/date";

interface LeadTimelineModalProps {
  leadId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export default function LeadTimelineModal({
  leadId,
  isOpen,
  onClose,
  onLeadUpdated,
}: LeadTimelineModalProps) {
  const [leadDetail, setLeadDetail] = useState<LeadDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Discussion Form State
  const [note, setNote] = useState("");
  const [hasFollowUp, setHasFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("10:00");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Fetch lead detail from API
  const fetchLeadDetail = useCallback(async (id: number) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.getLead(id);
      // Ensure reverse-chronological order defensively
      const sortedDiscussions = [...data.discussions].sort((a, b) => {
        const timeDiff =
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (timeDiff !== 0) return timeDiff;
        return b.id - a.id;
      });
      setLeadDetail({ ...data, discussions: sortedDiscussions });
    } catch (err: any) {
      setLoadError(
        err?.message || "Failed to load lead details. The lead may not exist."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && leadId !== null) {
      fetchLeadDetail(leadId);
      setNote("");
      setHasFollowUp(false);
      setFollowUpDate("");
      setFollowUpTime("10:00");
      setFormError(null);
      setStatusError(null);
    } else {
      setLeadDetail(null);
    }
  }, [isOpen, leadId, fetchLeadDetail]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSavingNote) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSavingNote, onClose]);

  if (!isOpen || leadId === null) return null;

  // Handle status update
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as LeadStatus;
    if (!leadDetail || leadDetail.status === newStatus) return;

    const previousStatus = leadDetail.status;
    // Optimistic local update
    setLeadDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
    setIsUpdatingStatus(true);
    setStatusError(null);

    try {
      await api.updateLeadStatus(leadDetail.id, newStatus);
      onLeadUpdated();
    } catch (err: any) {
      // Rollback on failure
      setLeadDetail((prev) =>
        prev ? { ...prev, status: previousStatus } : null
      );
      setStatusError(
        err?.message || "Failed to update lead status. Reverted change."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle saving new discussion note
  const handleSaveDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNote = note.trim();

    if (!trimmedNote) {
      setFormError("Discussion note cannot be empty.");
      return;
    }

    let followUpIso: string | null = null;
    if (hasFollowUp) {
      if (!followUpDate || !followUpTime) {
        setFormError("Please select both a date and time for the follow-up.");
        return;
      }

      // Convert local date and time to ISO 8601 with correct local timezone offset
      const [year, month, day] = followUpDate.split("-").map(Number);
      const [hours, minutes] = followUpTime.split(":").map(Number);
      const localDate = new Date(year, month - 1, day, hours, minutes, 0);

      if (isNaN(localDate.getTime())) {
        setFormError("Invalid date or time selected.");
        return;
      }
      followUpIso = localDate.toISOString();
    }

    try {
      setIsSavingNote(true);
      setFormError(null);

      const createdDiscussion = await api.addDiscussion(leadDetail!.id, {
        note: trimmedNote,
        follow_up_at: followUpIso,
      });

      // Update local state immediately
      setLeadDetail((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          discussions: [createdDiscussion, ...prev.discussions],
          next_follow_up_at:
            followUpIso !== null ? followUpIso : prev.next_follow_up_at,
          updated_at: new Date().toISOString(),
        };
      });

      // Reset form
      setNote("");
      setHasFollowUp(false);
      setFollowUpDate("");

      // Notify parent to refresh lead list
      onLeadUpdated();
    } catch (err: any) {
      setFormError(
        err?.message || "Failed to save discussion note. Please try again."
      );
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity overflow-y-auto"
      onClick={() => !isSavingNote && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-700">
              Loading lead timeline...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && loadError && (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">{loadError}</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => fetchLeadDetail(leadId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {!isLoading && leadDetail && (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-white">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    id="timeline-title"
                    className="text-lg font-bold text-slate-900 truncate"
                  >
                    {leadDetail.name}
                  </h2>
                  {leadDetail.company && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-normal">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{leadDetail.company}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 flex-wrap">
                  {leadDetail.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <a
                        href={`tel:${leadDetail.phone}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {leadDetail.phone}
                      </a>
                    </span>
                  )}

                  {leadDetail.next_follow_up_at && (
                    <span className="flex items-center gap-1 text-blue-700 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Scheduled:{" "}
                        {formatFollowUpDisplay(leadDetail.next_follow_up_at).text}
                      </span>
                    </span>
                  )}
                </div>

                {statusError && (
                  <p className="text-xs text-red-600 mt-1">{statusError}</p>
                )}
              </div>

              {/* Status selector & Close button */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="relative">
                  <label htmlFor="lead-status-select" className="sr-only">
                    Change Lead Status
                  </label>
                  <select
                    id="lead-status-select"
                    disabled={isUpdatingStatus}
                    value={leadDetail.status}
                    onChange={handleStatusChange}
                    className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    {ALL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition-colors"
                  aria-label="Close timeline"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Discussion History List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                  Discussion Timeline ({leadDetail.discussions.length})
                </h3>
                <span className="text-[11px] text-slate-400">Newest first</span>
              </div>

              {leadDetail.discussions.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-200 p-6">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">
                    No discussions logged yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Add the first discussion note using the form below.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {leadDetail.discussions.map((disc) => {
                    const followUpInfo = formatFollowUpDisplay(
                      disc.follow_up_at
                    );
                    const overdue = isOverdue(disc.follow_up_at);

                    return (
                      <div key={disc.id} className="relative group">
                        {/* Timeline bullet dot */}
                        <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-1 ring-blue-200" />

                        {/* Discussion Card */}
                        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:border-slate-300 transition-all">
                          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-slate-500">
                            <span className="font-medium text-slate-800">
                              {formatDateTime(disc.created_at)}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(disc.created_at)}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {disc.note}
                          </p>

                          {disc.follow_up_at && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                                  overdue
                                    ? "bg-red-50 text-red-700 border-red-200 font-semibold"
                                    : followUpInfo.isToday
                                    ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Follow-up: {followUpInfo.text}</span>
                                {overdue && (
                                  <span className="text-[9px] uppercase font-bold text-red-600 ml-0.5">
                                    (Overdue)
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Discussion Form (Bottom) */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <form onSubmit={handleSaveDiscussion} className="space-y-3">
                <div>
                  <label
                    htmlFor="new-note"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Log Discussion Note
                  </label>
                  <textarea
                    id="new-note"
                    rows={2}
                    disabled={isSavingNote}
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Log notes from client call, email, or meeting..."
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-50"
                  />
                </div>

                {/* Set Follow-up Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      disabled={isSavingNote}
                      checked={hasFollowUp}
                      onChange={(e) => {
                        setHasFollowUp(e.target.checked);
                        if (e.target.checked && !followUpDate) {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          setFollowUpDate(tomorrow.toISOString().split("T")[0]);
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Schedule Follow-up
                    </span>
                  </label>

                  {hasFollowUp && (
                    <div className="flex items-center gap-2 flex-wrap animate-in fade-in duration-100">
                      <input
                        type="date"
                        disabled={isSavingNote}
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <input
                        type="time"
                        disabled={isSavingNote}
                        value={followUpTime}
                        onChange={(e) => setFollowUpTime(e.target.value)}
                        className="text-xs px-2 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSavingNote}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors shrink-0 ml-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingNote ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isSavingNote ? "Saving..." : "Save Note"}</span>
                  </button>
                </div>

                {formError && (
                  <p className="text-xs text-red-600 font-medium">{formError}</p>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
