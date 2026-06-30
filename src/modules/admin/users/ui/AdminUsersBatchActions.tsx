import { DeleteOutlined } from "@ant-design/icons";
import { Button, Select, Space } from "antd";
import { adminUserRoleOptions } from "../model/adminUsersOptions";

interface AdminUsersBatchActionsProps {
  disabled: boolean;
  loading?: boolean;
  onDelete(): void;
  onRoleChange(role: string): void;
  onStatusChange(status: string): void;
}

export function AdminUsersBatchActions({
  disabled,
  loading,
  onDelete,
  onRoleChange,
  onStatusChange,
}: AdminUsersBatchActionsProps) {
  return (
    <Space wrap>
      <Button disabled={disabled} loading={loading} onClick={() => onStatusChange("active")}>
        批量启用
      </Button>
      <Button
        danger
        disabled={disabled}
        loading={loading}
        onClick={() => onStatusChange("disabled")}
      >
        批量禁用
      </Button>
      <Select
        disabled={disabled}
        options={[...adminUserRoleOptions]}
        placeholder="批量改角色"
        style={{ width: 140 }}
        onChange={onRoleChange}
      />
      <Button
        danger
        disabled={disabled}
        icon={<DeleteOutlined />}
        loading={loading}
        onClick={onDelete}
      >
        批量删除
      </Button>
    </Space>
  );
}
