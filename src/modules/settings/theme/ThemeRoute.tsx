import { AppearanceSettings } from "@lwmacct/260627-antd-workbench";
import { Card, Typography } from "antd";
import styles from "@/shared/ui/SectionPage.module.css";

export function ThemeRoute() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <Typography.Title level={2}>主题样式</Typography.Title>
        <Typography.Paragraph type="secondary">
          调整当前浏览器中的界面主题、色彩、密度和圆角。
        </Typography.Paragraph>
      </div>
      <Card className={styles.panel} title="外观">
        <AppearanceSettings />
      </Card>
    </section>
  );
}
