import React from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { Lead } from "@/types/crm";
import StatusBadge from "./StatusBadge";
import { formatRelativeTime, formatFollowUpDisplay, isOverdue } from "@/utils/date";

interface TodayFollowUpsProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

export default function TodayFollowUps({
  leads,
  onSelectLead,
}: TodayFollowUpsProps) {
  if (leads.length === 0) {
    return null;
  }

  return (
    <section className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-700" />
          <h2 className="text-xs font-bold tracking-wider text-blue-900 uppercase">
            Today&apos;s Follow-ups ({leads.length})
          </h2>
        </div>
        <span className="text-xs text-blue-700 font-medium hidden sm:inline">
          Scheduled for today
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {leads.map((lead) => {
          const followUpInfo = formatFollowUpDisplay(lead.next_follow_up_at);
          const overdue = isOverdue(lead.next_follow_up_at);

          return (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="bg-white rounded-lg border border-blue-200/80 p-3.5 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {lead.name}
                    </h3>
                    {lead.company && (
                      <span className="text-xs text-slate-500 font-normal truncate">
                        • {lead.company}
                      </span>
                    )}
                  </div>

                  {lead.last_discussion_note ? (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                      &ldquo;{lead.last_discussion_note}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1 italic">
                      No discussions logged yet
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                    {lead.last_discussion_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Discussed {formatRelativeTime(lead.last_discussion_at)}</span>
                      </span>
                    )}

                    {lead.next_follow_up_at && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                          overdue
                            ? "bg-red-50 text-red-700 border-red-200 font-semibold"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {overdue ? (
                          <AlertCircle className="w-3 h-3 text-red-600" />
                        ) : (
                          <Calendar className="w-3 h-3 text-blue-600" />
                        )}
                        <span>{followUpInfo.text}</span>
                        {overdue && <span className="uppercase text-[10px] ml-0.5 font-bold">(Overdue)</span>}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <StatusBadge status={lead.status} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
