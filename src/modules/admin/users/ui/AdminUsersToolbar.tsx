import { PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";
import type { AdminUsersFilters } from "../api/adminUsersApi";
import { adminUserRoleOptions, adminUserStatusOptions } from "../model/adminUsersOptions";

interface AdminUsersToolbarProps {
  loading?: boolean;
  onCreate(): void;
  onRefresh(): void;
  onFiltersChange(filters: Partial<AdminUsersFilters>): void;
}

export function AdminUsersToolbar({
  loading,
  onCreate,
  onRefresh,
  onFiltersChange,
}: AdminUsersToolbarProps) {
  return (
    <Space wrap>
      <Input.Search
        allowClear
        enterButton={<SearchOutlined />}
        placeholder="搜索用户名、显示名称、邮箱"
        style={{ width: 280 }}
        onSearch={(keyword) => onFiltersChange({ keyword, page: 1 })}
      />
      <Select
        allowClear
        options={[...adminUserRoleOptions]}
        placeholder="角色"
        style={{ width: 140 }}
        onChange={(role?: string) => onFiltersChange({ role, page: 1 })}
      />
      <Select
        allowClear
        options={[...adminUserStatusOptions]}
        placeholder="状态"
        style={{ width: 140 }}
        onChange={(status?: string) => onFiltersChange({ status, page: 1 })}
      />
      <Button icon={<ReloadOutlined />} loading={loading} onClick={onRefresh}>
        刷新
      </Button>
      <Button icon={<PlusOutlined />} type="primary" onClick={onCreate}>
        新增用户
      </Button>
    </Space>
  );
}
