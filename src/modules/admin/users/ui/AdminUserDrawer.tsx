import { Button, Drawer, Form, Input, Select } from "antd";
import { useEffect } from "react";
import type { AdminUser, CreateAdminUserInput } from "../api/adminUsersApi";
import { adminUserRoleOptions } from "../model/adminUsersOptions";

export type AdminUserFormValues = CreateAdminUserInput;

interface AdminUserDrawerProps {
  editingUser: AdminUser | null;
  loading?: boolean;
  open: boolean;
  onClose(): void;
  onSubmit(values: AdminUserFormValues): Promise<void>;
}

export function AdminUserDrawer({
  editingUser,
  loading,
  open,
  onClose,
  onSubmit,
}: AdminUserDrawerProps) {
  const [form] = Form.useForm<AdminUserFormValues>();

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingUser) {
      form.setFieldsValue({
        avatarUrl: editingUser.avatarUrl,
        displayName: editingUser.displayName,
        email: editingUser.email,
        role: editingUser.role,
        username: editingUser.username,
      });
      return;
    }

    form.resetFields();
    form.setFieldsValue({ role: "user" });
  }, [editingUser, form, open]);

  async function submit(values: AdminUserFormValues) {
    await onSubmit(values);
    form.resetFields();
  }

  return (
    <Drawer
      destroyOnHidden
      open={open}
      title={editingUser ? "编辑用户" : "新增用户"}
      width={440}
      onClose={onClose}
    >
      <Form<AdminUserFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={submit}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input disabled={Boolean(editingUser)} />
        </Form.Item>
        <Form.Item label="显示名称" name="displayName">
          <Input />
        </Form.Item>
        <Form.Item label="邮箱" name="email">
          <Input />
        </Form.Item>
        <Form.Item label="头像 URL" name="avatarUrl">
          <Input />
        </Form.Item>
        <Form.Item label="角色" name="role">
          <Select options={[...adminUserRoleOptions]} />
        </Form.Item>
        {!editingUser ? (
          <Form.Item label="初始密码" name="password">
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        ) : null}
        <Button htmlType="submit" loading={loading} type="primary">
          保存
        </Button>
      </Form>
    </Drawer>
  );
}
