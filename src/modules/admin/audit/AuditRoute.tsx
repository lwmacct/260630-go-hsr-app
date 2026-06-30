import {
  Alert,
  Button,
  Space,
  Table,
  Tag,
  Typography,
  type TableColumnsType,
  type TablePaginationConfig,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { AuditEvent, AuditEventsFilters } from "./api/auditApi";
import { useAuditEventsQuery } from "./model/auditQueries";
import styles from "@/shared/ui/SectionPage.module.css";

export function AuditRoute() {
  const [filters, setFilters] = useState<AuditEventsFilters>({
    page: 1,
    pageSize: 20,
  });
  const events = useAuditEventsQuery(filters);

  function changeTable(pagination: TablePaginationConfig) {
    setFilters((current) => ({
      ...current,
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 20,
    }));
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <Typography.Title level={2}>安全审计</Typography.Title>
        <Typography.Paragraph type="secondary">
          查看认证、管理操作和系统事件记录。
        </Typography.Paragraph>
      </div>

      {events.isError ? (
        <Alert showIcon type="error" title={events.error.message} />
      ) : null}

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Button
            icon={<ReloadOutlined />}
            loading={events.isFetching}
            onClick={() => void events.refetch()}
          >
            刷新
          </Button>
        </div>
        <Table<AuditEvent>
          rowKey="id"
          columns={auditColumns}
          dataSource={events.data?.items ?? []}
          loading={events.isPending}
          pagination={{
            current: events.data?.page ?? filters.page,
            pageSize: events.data?.pageSize ?? filters.pageSize,
            total: events.data?.total ?? 0,
            showSizeChanger: true,
          }}
          size="small"
          onChange={changeTable}
        />
      </Space>
    </section>
  );
}

const auditColumns: TableColumnsType<AuditEvent> = [
  {
    title: "时间",
    dataIndex: "createdAt",
    width: 180,
    render: (value: string) => new Date(value).toLocaleString(),
  },
  {
    title: "操作者",
    dataIndex: "actorUsername",
    width: 160,
    render: (value?: string) => value || "system",
  },
  {
    title: "动作",
    dataIndex: "action",
    width: 180,
    render: (value: string) => <Tag color="blue">{value}</Tag>,
  },
  {
    title: "资源",
    key: "resource",
    width: 180,
    render: (_, item) =>
      [item.resourceType, item.resourceId].filter(Boolean).join(" / ") || "-",
  },
  {
    title: "IP",
    dataIndex: "ip",
    width: 140,
    render: (value?: string) => value || "-",
  },
  {
    title: "元数据",
    dataIndex: "metadata",
    ellipsis: true,
    render: (value?: Record<string, unknown>) =>
      value ? (
        <Typography.Text code>{JSON.stringify(value)}</Typography.Text>
      ) : (
        "-"
      ),
  },
];
