import { apiGet } from "@/shared/api/client";

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export function getHealth() {
  return apiGet<HealthResponse>("/api/health");
}
