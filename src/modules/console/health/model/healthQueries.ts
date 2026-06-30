import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../api/healthApi";

export const healthKeys = {
  status: ["health", "status"] as const,
};

export function useHealthQuery() {
  return useQuery({
    queryKey: healthKeys.status,
    queryFn: getHealth,
  });
}
