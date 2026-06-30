import { useQuery } from "@tanstack/react-query";
import {
  getAuditEvents,
  type AuditEventsFilters,
} from "../api/auditApi";

export const auditKeys = {
  lists: ["audit-events", "list"] as const,
  list: (filters: AuditEventsFilters) => [...auditKeys.lists, filters] as const,
};

export function useAuditEventsQuery(filters: AuditEventsFilters) {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: () => getAuditEvents(filters),
  });
}
