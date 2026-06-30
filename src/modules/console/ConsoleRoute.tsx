import { ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Typography } from "antd";
import { HealthPanel } from "./health/ui/HealthPanel";
import styles from "./ConsoleRoute.module.css";

export function ConsoleRoute() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <Typography.Title level={2}>控制台</Typography.Title>
          <Typography.Paragraph type="secondary">
            服务状态、运行指标和近期事件的入口骨架。
          </Typography.Paragraph>
        </div>
        <Button href="/api/health" icon={<ReloadOutlined />} target="_blank">
          Open API
        </Button>
      </div>
      <Alert
        showIcon
        type="info"
        title="Development proxy"
        description="Vite proxies /api requests to the Go server. Production serves this UI from the Go web root."
      />
      <HealthPanel />
    </section>
  );
}
