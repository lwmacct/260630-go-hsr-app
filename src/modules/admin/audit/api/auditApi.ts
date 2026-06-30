import { apiGet } from "@/shared/api/client";

export interface AuditEvent {
  id: number;
  actorUserId?: number;
  actorUsername?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditEventsPage {
  items: AuditEvent[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditEventsFilters {
  actorUsername?: string;
  action?: string;
  resourceType?: string;
  page?: number;
  pageSize?: number;
}

export function getAuditEvents(filters: AuditEventsFilters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return apiGet<AuditEventsPage>(
    `/api/admin/audit/events${query ? `?${query}` : ""}`,
  );
}
