/**
 * Centralized date and time utilities for LeadFlow.
 * Uses the browser's local timezone for display and comparisons.
 */

export function isToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;

  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;

  return d.getTime() < Date.now();
}

export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 45) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;

  const diffHours = Math.floor(diffSec / 3600);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatFollowUpDisplay(dateStr: string | null | undefined): {
  text: string;
  isToday: boolean;
  isOverdue: boolean;
} {
  if (!dateStr) {
    return { text: "None", isToday: false, isOverdue: false };
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return { text: "Invalid date", isToday: false, isOverdue: false };
  }

  const today = isToday(dateStr);
  const overdue = isOverdue(dateStr);

  const timePart = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (today) {
    return {
      text: `Today at ${timePart}`,
      isToday: true,
      isOverdue: overdue,
    };
  }

  const datePart = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return {
    text: `${datePart} at ${timePart}`,
    isToday: false,
    isOverdue: overdue,
  };
}
