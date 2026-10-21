import React, { useState, useEffect } from "react";
import { X, Phone, Building2, Calendar, Clock, MessageSquare, Send } from "lucide-react";
import { Lead, LeadStatus, ALL_STATUSES } from "@/types/crm";
import { formatDateTime, formatRelativeTime, formatFollowUpDisplay, isOverdue } from "@/utils/date";

interface LeadTimelineModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (leadId: number, newStatus: LeadStatus) => void;
  onAddDiscussion: (
    leadId: number,
    note: string,
    followUpAt: string | null
  ) => void;
}

export default function LeadTimelineModal({
  lead,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddDiscussion,
}: LeadTimelineModalProps) {
  const [note, setNote] = useState("");
  const [hasFollowUp, setHasFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("10:00");
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset inputs when modal opens or lead changes
  useEffect(() => {
    if (isOpen) {
      setNote("");
      setHasFollowUp(false);
      setFollowUpDate("");
      setFollowUpTime("10:00");
      setError(null);
    }
  }, [isOpen, lead?.id]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as LeadStatus;
    onUpdateStatus(lead.id, newStatus);
  };

  const handleSaveDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNote = note.trim();

    if (!trimmedNote) {
      setError("Discussion note cannot be empty.");
      return;
    }

    let followUpIso: string | null = null;
    if (hasFollowUp) {
      if (!followUpDate || !followUpTime) {
        setError("Please select both a date and time for the follow-up.");
        return;
      }
      const combined = new Date(`${followUpDate}T${followUpTime}`);
      if (isNaN(combined.getTime())) {
        setError("Invalid date or time selected.");
        return;
      }
      followUpIso = combined.toISOString();
    }

    onAddDiscussion(lead.id, trimmedNote, followUpIso);
    setNote("");
    setHasFollowUp(false);
    setFollowUpDate("");
    setError(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-white">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                id="timeline-title"
                className="text-lg font-bold text-slate-900 truncate"
              >
                {lead.name}
              </h2>
              {lead.company && (
                <span className="flex items-center gap-1 text-xs text-slate-500 font-normal">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.company}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 flex-wrap">
              {lead.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <a
                    href={`tel:${lead.phone}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {lead.phone}
                  </a>
                </span>
              )}

              {lead.next_follow_up_at && (
                <span className="flex items-center gap-1 text-blue-700 font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>Scheduled: {formatFollowUpDisplay(lead.next_follow_up_at).text}</span>
                </span>
              )}
            </div>
          </div>

          {/* Status selector & Close button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div>
              <label htmlFor="lead-status-select" className="sr-only">
                Change Lead Status
              </label>
              <select
                id="lead-status-select"
                value={lead.status}
                onChange={handleStatusChange}
                className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
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
              Discussion Timeline ({lead.discussions.length})
            </h3>
            <span className="text-[11px] text-slate-400">Newest first</span>
          </div>

          {lead.discussions.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-200 p-6">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No discussions logged yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Add the first discussion note using the form below.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {lead.discussions.map((disc, index) => {
                const followUpInfo = formatFollowUpDisplay(disc.follow_up_at);
                const overdue = isOverdue(disc.follow_up_at);

                return (
                  <div key={disc.id || index} className="relative group">
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
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Log notes from client call, email, or meeting..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Set Follow-up Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasFollowUp}
                  onChange={(e) => {
                    setHasFollowUp(e.target.checked);
                    if (e.target.checked && !followUpDate) {
                      // Default to tomorrow's date
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
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="text-xs px-2 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors shrink-0 ml-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
