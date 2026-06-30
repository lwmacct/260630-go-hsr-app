import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { Button, Card, Descriptions, Result, Skeleton, Space, Tag, Typography } from "antd";
import { useHealthQuery } from "../model/healthQueries";

export function HealthPanel() {
  const health = useHealthQuery();

  if (health.isPending) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  if (health.isError) {
    return (
      <Card>
        <Result
          status="error"
          icon={<CloseCircleFilled />}
          title="Backend unavailable"
          subTitle={health.error.message}
          extra={
            <Button onClick={() => void health.refetch()} type="primary">
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  if (!health.data) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <CheckCircleFilled style={{ color: "var(--app-success)" }} />
          <span>Backend Health</span>
        </Space>
      }
      extra={
        <Button onClick={() => void health.refetch()} loading={health.isFetching}>
          Refresh
        </Button>
      }
    >
      <Descriptions
        column={1}
        bordered
        size="small"
        items={[
          {
            key: "status",
            label: "Status",
            children: <Tag color="success">{health.data.status}</Tag>,
          },
          {
            key: "timestamp",
            label: "Timestamp",
            children: (
              <Typography.Text code>
                {new Date(health.data.timestamp).toLocaleString()}
              </Typography.Text>
            ),
          },
        ]}
      />
    </Card>
  );
}
