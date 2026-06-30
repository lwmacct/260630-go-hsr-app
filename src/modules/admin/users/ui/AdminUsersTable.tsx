import { DeleteOutlined, EditOutlined, LockOutlined } from "@ant-design/icons";
import {
  Button,
  Space,
  Table,
  Tag,
  Typography,
  type TableColumnsType,
  type TablePaginationConfig,
} from "antd";
import type { AdminUser } from "../api/adminUsersApi";

interface AdminUsersTableProps {
  data: AdminUser[];
  deleteLoading?: boolean;
  loading?: boolean;
  page?: number;
  pageSize?: number;
  selectedRowKeys: React.Key[];
  setStatusLoading?: boolean;
  total?: number;
  onChange(pagination: TablePaginationConfig): void;
  onDelete(user: AdminUser): void;
  onEdit(user: AdminUser): void;
  onPassword(user: AdminUser): void;
  onSelectedRowKeysChange(keys: React.Key[]): void;
  onStatusChange(user: AdminUser, status: string): void;
}

export function AdminUsersTable({
  data,
  deleteLoading,
  loading,
  page,
  pageSize,
  selectedRowKeys,
  setStatusLoading,
  total,
  onChange,
  onDelete,
  onEdit,
  onPassword,
  onSelectedRowKeysChange,
  onStatusChange,
}: AdminUsersTableProps) {
  const columns: TableColumnsType<AdminUser> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "用户",
      key: "user",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.username}</Typography.Text>
          <Typography.Text type="secondary">{record.displayName}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      render: (value?: string) => value || "-",
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role: string, record) =>
        record.admin ? <Tag color="blue">admin</Tag> : <Tag>{role}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) =>
        status === "disabled" ? (
          <Tag color="red">禁用</Tag>
        ) : (
          <Tag color="green">启用</Tag>
        ),
    },
    {
      title: "最近登录",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      width: 190,
      render: (value?: string) => (value ? new Date(value).toLocaleString() : "-"),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 190,
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: "操作",
      key: "actions",
      fixed: "right",
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Button icon={<LockOutlined />} size="small" onClick={() => onPassword(record)}>
            密码
          </Button>
          <Button
            danger={record.status !== "disabled"}
            loading={setStatusLoading}
            size="small"
            onClick={() =>
              onStatusChange(
                record,
                record.status === "disabled" ? "active" : "disabled",
              )
            }
          >
            {record.status === "disabled" ? "启用" : "禁用"}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deleteLoading}
            size="small"
            onClick={() => onDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table<AdminUser>
      columns={columns}
      dataSource={data}
      loading={loading}
      onChange={onChange}
      pagination={{
        current: page,
        pageSize,
        showSizeChanger: true,
        total,
      }}
      rowKey="id"
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectedRowKeysChange,
      }}
      scroll={{ x: 1120 }}
      size="small"
    />
  );
}
