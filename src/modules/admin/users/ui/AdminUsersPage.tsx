import { Alert, Modal, Space, Typography, type TablePaginationConfig } from "antd";
import { useState } from "react";
import type { AdminUser, AdminUsersFilters } from "../api/adminUsersApi";
import {
  useAdminUsersQuery,
  useCreateAdminUserMutation,
  useDeleteAdminUsersMutation,
  useResetAdminUsersPasswordMutation,
  useSetAdminUsersRoleMutation,
  useSetAdminUsersStatusMutation,
  useUpdateAdminUserMutation,
} from "../model/adminUsersQueries";
import styles from "@/shared/ui/SectionPage.module.css";
import { AdminUserDrawer, type AdminUserFormValues } from "./AdminUserDrawer";
import { AdminUsersBatchActions } from "./AdminUsersBatchActions";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminUsersToolbar } from "./AdminUsersToolbar";
import { ResetPasswordModal } from "./ResetPasswordModal";

export function AdminUsersPage() {
  const [filters, setFilters] = useState<AdminUsersFilters>({
    page: 1,
    pageSize: 20,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);

  const users = useAdminUsersQuery(filters);
  const createUser = useCreateAdminUserMutation();
  const updateUser = useUpdateAdminUserMutation();
  const setRole = useSetAdminUsersRoleMutation();
  const setStatus = useSetAdminUsersStatusMutation();
  const resetPassword = useResetAdminUsersPasswordMutation();
  const deleteUsers = useDeleteAdminUsersMutation();

  const selectedIds = selectedRowKeys.map((key) => Number(key));
  const actionLoading =
    setRole.isPending ||
    setStatus.isPending ||
    resetPassword.isPending ||
    deleteUsers.isPending;

  function updateFilters(nextFilters: Partial<AdminUsersFilters>) {
    setFilters((current) => ({ ...current, ...nextFilters }));
  }

  function openCreate() {
    setEditingUser(null);
    setDrawerOpen(true);
  }

  function openEdit(user: AdminUser) {
    setEditingUser(user);
    setDrawerOpen(true);
  }

  async function submitUser(values: AdminUserFormValues) {
    if (editingUser) {
      await updateUser.mutateAsync({
        id: editingUser.id,
        input: {
          avatarUrl: values.avatarUrl,
          displayName: values.displayName || editingUser.username,
          email: values.email,
        },
      });

      if (values.role && values.role !== editingUser.role) {
        await setRole.mutateAsync({ ids: [editingUser.id], role: values.role });
      }
    } else {
      await createUser.mutateAsync(values);
    }

    setDrawerOpen(false);
  }

  async function submitPassword(password: string) {
    if (!passwordUser) {
      return;
    }

    await resetPassword.mutateAsync({
      ids: [passwordUser.id],
      password,
    });
    setPasswordUser(null);
  }

  function confirmStatus(ids: number[], status: string) {
    Modal.confirm({
      title: status === "disabled" ? "禁用用户" : "启用用户",
      content:
        status === "disabled"
          ? "禁用后用户会立即失效，无法继续登录。"
          : "启用后用户可重新登录。",
      okButtonProps: { danger: status === "disabled" },
      okText: status === "disabled" ? "禁用" : "启用",
      onOk: async () => {
        await setStatus.mutateAsync({ ids, status });
        setSelectedRowKeys([]);
      },
    });
  }

  function confirmDelete(ids: number[]) {
    Modal.confirm({
      title: "删除用户",
      content: "删除会移除用户、密码、第三方身份和会话数据。",
      okButtonProps: { danger: true },
      okText: "删除",
      onOk: async () => {
        await deleteUsers.mutateAsync(ids);
        setSelectedRowKeys([]);
      },
    });
  }

  async function changeSelectedRole(role: string) {
    await setRole.mutateAsync({ ids: selectedIds, role });
    setSelectedRowKeys([]);
  }

  function changeTable(pagination: TablePaginationConfig) {
    updateFilters({
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 20,
    });
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <Typography.Title level={2}>用户管理</Typography.Title>
        <Typography.Paragraph type="secondary">
          管理用户资料、角色、状态和本地登录密码。
        </Typography.Paragraph>
      </div>

      {users.isError ? <Alert showIcon type="error" title={users.error.message} /> : null}

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <AdminUsersToolbar
          loading={users.isFetching}
          onCreate={openCreate}
          onFiltersChange={updateFilters}
          onRefresh={() => void users.refetch()}
        />
        <AdminUsersBatchActions
          disabled={!selectedIds.length}
          loading={actionLoading}
          onDelete={() => confirmDelete(selectedIds)}
          onRoleChange={(role) => void changeSelectedRole(role)}
          onStatusChange={(status) => confirmStatus(selectedIds, status)}
        />
        <AdminUsersTable
          data={users.data?.items ?? []}
          deleteLoading={deleteUsers.isPending}
          loading={users.isPending}
          page={users.data?.page ?? filters.page}
          pageSize={users.data?.pageSize ?? filters.pageSize}
          selectedRowKeys={selectedRowKeys}
          setStatusLoading={setStatus.isPending}
          total={users.data?.total ?? 0}
          onChange={changeTable}
          onDelete={(user) => confirmDelete([user.id])}
          onEdit={openEdit}
          onPassword={setPasswordUser}
          onSelectedRowKeysChange={setSelectedRowKeys}
          onStatusChange={(user, status) => confirmStatus([user.id], status)}
        />
      </Space>

      <AdminUserDrawer
        editingUser={editingUser}
        loading={createUser.isPending || updateUser.isPending || setRole.isPending}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={submitUser}
      />
      <ResetPasswordModal
        loading={resetPassword.isPending}
        user={passwordUser}
        onCancel={() => setPasswordUser(null)}
        onSubmit={submitPassword}
      />
    </section>
  );
}
