import { Card, Descriptions, Typography } from "antd";
import { useAuthStateQuery } from "@/modules/auth";
import styles from "@/shared/ui/SectionPage.module.css";

export function ProfileRoute() {
  const authState = useAuthStateQuery();
  const user = authState.data?.session.user;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <Typography.Title level={2}>账号概览</Typography.Title>
        <Typography.Paragraph type="secondary">
          查看当前登录账号的基础身份信息。
        </Typography.Paragraph>
      </div>
      <Card className={styles.panel} title="账号信息">
        <Descriptions
          bordered
          column={1}
          size="small"
          items={[
            {
              key: "id",
              label: "用户 ID",
              children: user?.id ?? "-",
            },
            {
              key: "username",
              label: "用户名",
              children: user?.username ?? "-",
            },
            {
              key: "displayName",
              label: "显示名称",
              children: user?.displayName ?? "-",
            },
            {
              key: "email",
              label: "邮箱",
              children: user?.email ?? "-",
            },
            {
              key: "admin",
              label: "管理员",
              children: user?.admin ? "是" : "否",
            },
            {
              key: "role",
              label: "角色",
              children: user?.role ?? "-",
            },
          ]}
        />
      </Card>
    </section>
  );
}
