import {
  LeadListItem,
  LeadDetail,
  LeadStatus,
  Discussion,
  CreateLeadPayload,
  CreateDiscussionPayload,
} from "@/types/crm";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function extractErrorMessage(data: any, status: number): string {
  if (!data) return `Request failed with HTTP status ${status}`;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((err: any) => err.msg || JSON.stringify(err))
      .join(", ");
  }
  if (data.message && typeof data.message === "string") return data.message;
  return `Request failed with HTTP status ${status}`;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(
      "Unable to connect to the backend server. Please ensure the backend is running at " +
        API_BASE_URL,
      0
    );
  }

  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // Body not JSON
    }
    const message = extractErrorMessage(errorData, response.status);
    throw new ApiError(message, response.status, errorData);
  }

  return response.json();
}

export const api = {
  /**
   * List all leads with optional status filter and name search query.
   */
  async getLeads(params?: {
    status?: string | null;
    search?: string | null;
  }): Promise<LeadListItem[]> {
    const searchParams = new URLSearchParams();

    if (params?.status && params.status !== "All") {
      searchParams.append("status", params.status);
    }
    if (params?.search && params.search.trim()) {
      searchParams.append("search", params.search.trim());
    }

    const qs = searchParams.toString();
    const endpoint = `/api/leads${qs ? `?${qs}` : ""}`;
    return request<LeadListItem[]>(endpoint);
  },

  /**
   * Retrieve a single lead and its complete discussion timeline.
   */
  async getLead(id: number): Promise<LeadDetail> {
    return request<LeadDetail>(`/api/leads/${id}`);
  },

  /**
   * Create a new lead (defaults to status 'New').
   */
  async createLead(payload: CreateLeadPayload): Promise<LeadListItem> {
    return request<LeadListItem>("/api/leads", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update a lead's status.
   */
  async updateLeadStatus(
    id: number,
    status: LeadStatus
  ): Promise<LeadListItem> {
    return request<LeadListItem>(`/api/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Add a discussion note to a lead with optional follow-up datetime.
   */
  async addDiscussion(
    leadId: number,
    payload: CreateDiscussionPayload
  ): Promise<Discussion> {
    return request<Discussion>(`/api/leads/${leadId}/discussions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Health check endpoint.
   */
  async checkHealth(): Promise<{ status: string }> {
    return request<{ status: string }>("/health");
  },
};
