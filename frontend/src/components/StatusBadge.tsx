import React from "react";
import { LeadStatus } from "@/types/crm";

interface StatusBadgeProps {
  status: LeadStatus;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<
  LeadStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  New: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  Contacted: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  Qualified: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  "Proposal Sent": {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  Won: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Lost: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-300",
    dot: "bg-slate-400",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  };

  const sizeClasses =
    size === "sm"
      ? "text-xs px-2.5 py-0.5 gap-1.5"
      : "text-xs font-semibold px-3 py-1 gap-2";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
