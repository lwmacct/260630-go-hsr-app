import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminUser,
  deleteAdminUsers,
  getAdminUsers,
  resetAdminUsersPassword,
  setAdminUsersRole,
  setAdminUsersStatus,
  updateAdminUser,
  type AdminUsersFilters,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
} from "../api/adminUsersApi";

export const adminUsersKeys = {
  lists: ["admin-users", "list"] as const,
  list: (filters: AdminUsersFilters) => [...adminUsersKeys.lists, filters] as const,
};

export function useAdminUsersQuery(filters: AdminUsersFilters) {
  return useQuery({
    queryKey: adminUsersKeys.list(filters),
    queryFn: () => getAdminUsers(filters),
  });
}

function useInvalidateAdminUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists });
}

export function useCreateAdminUserMutation() {
  const invalidate = useInvalidateAdminUsers();
  return useMutation({
    mutationFn: (input: CreateAdminUserInput) => createAdminUser(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminUserMutation() {
  const invalidate = useInvalidateAdminUsers();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateAdminUserInput }) =>
      updateAdminUser(id, input),
    onSuccess: invalidate,
  });
}

export function useSetAdminUsersRoleMutation() {
  const invalidate = useInvalidateAdminUsers();
  return useMutation({
    mutationFn: ({ ids, role }: { ids: number[]; role: string }) =>
      setAdminUsersRole(ids, role),
    onSuccess: invalidate,
  });
}

export function useSetAdminUsersStatusMutation() {
  const invalidate = useInvalidateAdminUsers();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: string }) =>
      setAdminUsersStatus(ids, status),
    onSuccess: invalidate,
  });
}

export function useResetAdminUsersPasswordMutation() {
  const invalidate = useInvalidateAdminUsers();
  return useMutation({
    mutationFn: ({ ids, password }: { ids: number[]; password: string }) =>
      resetAdminUsersPassword(ids, password),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminUsersMutation() {
  const invalidate = useInvalidateAdminUsers();
  return useMutation({
    mutationFn: (ids: number[]) => deleteAdminUsers(ids),
    onSuccess: invalidate,
  });
}
