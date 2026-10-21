export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Proposal Sent"
  | "Won"
  | "Lost";

export const ALL_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

export interface Discussion {
  id: number;
  lead_id: number;
  note: string;
  created_at: string; // ISO 8601 string
  follow_up_at: string | null; // ISO 8601 string
}

export interface LeadListItem {
  id: number;
  name: string;
  company: string | null;
  phone: string | null;
  status: LeadStatus;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
  last_discussion_note?: string | null;
  last_discussion_at?: string | null;
  discussions?: Discussion[];
}

export interface LeadDetail {
  id: number;
  name: string;
  company: string | null;
  phone: string | null;
  status: LeadStatus;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
  discussions: Discussion[];
}

export type Lead = LeadListItem;

export interface CreateLeadPayload {
  name: string;
  company?: string;
  phone?: string;
}

export interface CreateDiscussionPayload {
  note: string;
  follow_up_at?: string | null;
}
