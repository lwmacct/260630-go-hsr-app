import { Form, Input, Modal } from "antd";
import type { AdminUser } from "../api/adminUsersApi";

interface PasswordFormValues {
  password: string;
}

interface ResetPasswordModalProps {
  loading?: boolean;
  user: AdminUser | null;
  onCancel(): void;
  onSubmit(password: string): Promise<void>;
}

export function ResetPasswordModal({
  loading,
  user,
  onCancel,
  onSubmit,
}: ResetPasswordModalProps) {
  const [form] = Form.useForm<PasswordFormValues>();

  async function submit(values: PasswordFormValues) {
    await onSubmit(values.password);
    form.resetFields();
  }

  return (
    <Modal
      confirmLoading={loading}
      okText="重置"
      open={Boolean(user)}
      title="重置密码"
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      <Form<PasswordFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={submit}
      >
        <Form.Item
          label="新密码"
          name="password"
          rules={[
            { required: true, message: "请输入新密码" },
            { min: 8, message: "密码至少 8 位" },
            { max: 128, message: "密码不能超过 128 位" },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
