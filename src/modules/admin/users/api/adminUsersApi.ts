import { apiDelete, apiGet, apiPatch, apiPost } from "@/shared/api/client";

export interface AdminUser {
  id: number;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  role: string;
  status: string;
  admin: boolean;
  disabledAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersPage {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUsersFilters {
  keyword?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateAdminUserInput {
  username: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  password?: string;
}

export interface UpdateAdminUserInput {
  displayName: string;
  email?: string;
  avatarUrl?: string;
}

export function getAdminUsers(filters: AdminUsersFilters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return apiGet<AdminUsersPage>(`/api/admin/users${query ? `?${query}` : ""}`);
}

export function createAdminUser(input: CreateAdminUserInput) {
  return apiPost<AdminUser>("/api/admin/users", input);
}

export function updateAdminUser(id: number, input: UpdateAdminUserInput) {
  return apiPatch<AdminUser>(`/api/admin/users/${id}`, input);
}

export function setAdminUsersRole(ids: number[], role: string) {
  return apiPost<{ ok: boolean }>("/api/admin/users/batch-role", { ids, role });
}

export function setAdminUsersStatus(ids: number[], status: string) {
  return apiPost<{ ok: boolean }>("/api/admin/users/batch-status", {
    ids,
    status,
  });
}

export function resetAdminUsersPassword(ids: number[], password: string) {
  return apiPost<{ ok: boolean }>("/api/admin/users/batch-password", {
    ids,
    password,
  });
}

export function deleteAdminUsers(ids: number[]) {
  return apiDelete<{ ok: boolean }>("/api/admin/users", { ids });
}
