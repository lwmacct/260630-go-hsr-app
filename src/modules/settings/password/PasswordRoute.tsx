import { LockOutlined, SaveOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import { useChangePasswordMutation } from "@/modules/auth";
import styles from "@/shared/ui/SectionPage.module.css";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function PasswordRoute() {
  const [form] = Form.useForm<PasswordFormValues>();
  const passwordMutation = useChangePasswordMutation();
  const [success, setSuccess] = useState("");

  async function submit(values: PasswordFormValues) {
    setSuccess("");
    try {
      await passwordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.resetFields();
      setSuccess("密码已更新，下次登录请使用新密码。");
    } catch {
      form.setFieldsValue({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }

  function validateNewPassword(_: unknown, value?: string) {
    if (!value) {
      return Promise.reject(new Error("请输入新密码"));
    }
    if (value.length < 8) {
      return Promise.reject(new Error("密码至少 8 位"));
    }
    if (value.length > 128) {
      return Promise.reject(new Error("密码不能超过 128 位"));
    }
    if (!value.trim()) {
      return Promise.reject(new Error("密码不能只包含空白字符"));
    }
    if (value === form.getFieldValue("currentPassword")) {
      return Promise.reject(new Error("新密码不能与当前密码相同"));
    }
    return Promise.resolve();
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <Typography.Title level={2}>修改密码</Typography.Title>
        <Typography.Paragraph type="secondary">
          验证当前密码后更新本地登录密码。
        </Typography.Paragraph>
      </div>
      {success ? <Alert showIcon type="success" title={success} /> : null}
      {passwordMutation.isError ? (
        <Alert showIcon type="error" title={passwordMutation.error.message} />
      ) : null}
      <Form<PasswordFormValues>
        form={form}
        layout="vertical"
        className={styles.narrowForm}
        requiredMark={false}
        onFinish={submit}
      >
        <Form.Item
          label="当前密码"
          name="currentPassword"
          rules={[{ required: true, message: "请输入当前密码" }]}
        >
          <Input.Password autoComplete="current-password" prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[{ validator: validateNewPassword }]}
        >
          <Input.Password autoComplete="new-password" prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item
          dependencies={["newPassword"]}
          label="确认新密码"
          name="confirmPassword"
          rules={[
            { required: true, message: "请再次输入新密码" },
            ({ getFieldValue }) => ({
              validator(_, value?: string) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" prefix={<LockOutlined />} />
        </Form.Item>
        <Button
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={passwordMutation.isPending}
          type="primary"
        >
          保存密码
        </Button>
      </Form>
    </section>
  );
}
