import React from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { Lead } from "@/types/crm";
import StatusBadge from "./StatusBadge";
import { formatRelativeTime, formatFollowUpDisplay, isOverdue } from "@/utils/date";

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
}

export default function LeadCard({ lead, onSelect }: LeadCardProps) {
  const followUpInfo = formatFollowUpDisplay(lead.next_follow_up_at);
  const overdue = isOverdue(lead.next_follow_up_at);

  return (
    <div
      onClick={() => onSelect(lead)}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Lead Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {lead.name}
            </h3>
            {lead.company && (
              <span className="text-xs text-slate-500 font-normal">
                • {lead.company}
              </span>
            )}
          </div>

          {/* Discussion Preview */}
          {lead.last_discussion_note ? (
            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
              &ldquo;{lead.last_discussion_note}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-1.5 italic">
              No discussions logged yet
            </p>
          )}

          {/* Meta footer */}
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 flex-wrap">
            {lead.last_discussion_at ? (
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last updated {formatRelativeTime(lead.last_discussion_at)}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                <span>Added {formatRelativeTime(lead.created_at)}</span>
              </span>
            )}

            {lead.next_follow_up_at && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                  overdue
                    ? "bg-red-50 text-red-700 border-red-200 font-semibold"
                    : followUpInfo.isToday
                    ? "bg-blue-50 text-blue-700 border-blue-200 font-medium"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {overdue ? (
                  <AlertCircle className="w-3 h-3 text-red-600" />
                ) : (
                  <Calendar className="w-3 h-3 text-slate-500" />
                )}
                <span>Follow-up: {followUpInfo.text}</span>
                {overdue && (
                  <span className="text-[10px] text-red-600 font-bold uppercase ml-0.5">
                    (Overdue)
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          <StatusBadge status={lead.status} />
        </div>
      </div>
    </div>
  );
}
