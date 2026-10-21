import { Lead } from "@/types/crm";

/**
 * Generate initial demo leads dynamically relative to runtime.
 * Ensures "Today's follow-ups", "Overdue follow-ups", and all 6 statuses
 * render correctly regardless of when the assessment is evaluated.
 */
export function getInitialDemoLeads(): Lead[] {
  const now = new Date();

  // Helper for today at specific hours
  const todayAt = (hours: number, minutes: number = 0) => {
    const d = new Date(now);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  // Helper for days ago
  const daysAgo = (days: number, hoursAgo: number = 0) => {
    const d = new Date(now.getTime() - days * 86400000 - hoursAgo * 3600000);
    return d.toISOString();
  };

  // Helper for days ahead
  const daysAhead = (days: number, hour: number = 14) => {
    const d = new Date(now.getTime() + days * 86400000);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  const todayFollowUpTime = todayAt(16, 30); // Today at 4:30 PM
  const overdueFollowUpTime = daysAgo(1, 4); // Yesterday at 4 hours ago (Overdue)
  const futureFollowUpTime = daysAhead(4, 11); // 4 days from now

  return [
    {
      id: 1,
      name: "Marcus Vance",
      company: "Apex Logistics",
      phone: "+1 (555) 234-5678",
      status: "Qualified",
      next_follow_up_at: todayFollowUpTime,
      created_at: daysAgo(5),
      updated_at: daysAgo(0, 2),
      discussions: [
        {
          id: 101,
          lead_id: 1,
          note: "Reviewed revised fleet tracking quote. Marcus asked for final SLA confirmation before signing.",
          created_at: daysAgo(0, 2),
          follow_up_at: todayFollowUpTime,
        },
        {
          id: 102,
          lead_id: 1,
          note: "Initial discovery call. Discussed scaling tracking to 45 regional hubs. High interest in real-time ETA alerts.",
          created_at: daysAgo(3),
          follow_up_at: null,
        },
      ],
      last_discussion_note:
        "Reviewed revised fleet tracking quote. Marcus asked for final SLA confirmation before signing.",
      last_discussion_at: daysAgo(0, 2),
    },
    {
      id: 2,
      name: "Elena Rostova",
      company: "CloudScale AI",
      phone: "+1 (555) 876-5432",
      status: "Contacted",
      next_follow_up_at: overdueFollowUpTime,
      created_at: daysAgo(8),
      updated_at: daysAgo(2),
      discussions: [
        {
          id: 201,
          lead_id: 2,
          note: "Sent introductory technical overview and API rate sheet. Follow-up promised for yesterday.",
          created_at: daysAgo(2),
          follow_up_at: overdueFollowUpTime,
        },
      ],
      last_discussion_note:
        "Sent introductory technical overview and API rate sheet. Follow-up promised for yesterday.",
      last_discussion_at: daysAgo(2),
    },
    {
      id: 3,
      name: "Sarah Connor",
      company: "Cyberdyne Systems",
      phone: "+1 (555) 345-6789",
      status: "New",
      next_follow_up_at: null,
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
      discussions: [],
      last_discussion_note: null,
      last_discussion_at: null,
    },
    {
      id: 4,
      name: "David Kim",
      company: "NextGen BioLabs",
      phone: "+1 (555) 456-7890",
      status: "Proposal Sent",
      next_follow_up_at: futureFollowUpTime,
      created_at: daysAgo(12),
      updated_at: daysAgo(1),
      discussions: [
        {
          id: 401,
          lead_id: 4,
          note: "Delivered customized enterprise security proposal. Procurement committee review meeting scheduled.",
          created_at: daysAgo(1),
          follow_up_at: futureFollowUpTime,
        },
        {
          id: 402,
          lead_id: 4,
          note: "Technical deep-dive on HIPAA compliance and VPC deployment models.",
          created_at: daysAgo(6),
          follow_up_at: null,
        },
      ],
      last_discussion_note:
        "Delivered customized enterprise security proposal. Procurement committee review meeting scheduled.",
      last_discussion_at: daysAgo(1),
    },
    {
      id: 5,
      name: "Rachel Green",
      company: "Central Perk Media",
      phone: "+1 (555) 567-8901",
      status: "Won",
      next_follow_up_at: null,
      created_at: daysAgo(20),
      updated_at: daysAgo(3),
      discussions: [
        {
          id: 501,
          lead_id: 5,
          note: "Contract signed! 12-month annual subscription activated. Handed off to Customer Success team.",
          created_at: daysAgo(3),
          follow_up_at: null,
        },
      ],
      last_discussion_note:
        "Contract signed! 12-month annual subscription activated. Handed off to Customer Success team.",
      last_discussion_at: daysAgo(3),
    },
    {
      id: 6,
      name: "Jordan Hayes",
      company: "BluePeak Capital",
      phone: "+1 (555) 678-9012",
      status: "Lost",
      next_follow_up_at: null,
      created_at: daysAgo(15),
      updated_at: daysAgo(7),
      discussions: [
        {
          id: 601,
          lead_id: 6,
          note: "Client postponed CRM migration project until next fiscal year due to internal budget reallocations.",
          created_at: daysAgo(7),
          follow_up_at: null,
        },
      ],
      last_discussion_note:
        "Client postponed CRM migration project until next fiscal year due to internal budget reallocations.",
      last_discussion_at: daysAgo(7),
    },
  ];
}
