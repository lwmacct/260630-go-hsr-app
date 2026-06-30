import { BgColorsOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { SectionLayout } from "@lwmacct/260627-antd-workbench";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

type SettingsSectionKey = "password" | "profile" | "theme";

const sectionItems = [
  { key: "profile", label: "账号概览", icon: <UserOutlined /> },
  { key: "password", label: "修改密码", icon: <LockOutlined /> },
  { key: "theme", label: "主题样式", icon: <BgColorsOutlined /> },
] as const;

const sectionKeys = new Set<SettingsSectionKey>(
  sectionItems.map((item) => item.key),
);

function activeSection(pathname: string): SettingsSectionKey {
  const key = pathname.split("/")[2];

  if (sectionKeys.has(key as SettingsSectionKey)) {
    return key as SettingsSectionKey;
  }

  return "profile";
}

export function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SectionLayout
      selectedKey={activeSection(location.pathname)}
      nav={[
        {
          type: "group",
          key: "personal-settings",
          label: "个人设置",
          children: [...sectionItems],
        },
      ]}
      onSelect={(key) => navigate(`/settings/${key}`)}
    >
      <Outlet />
    </SectionLayout>
  );
}
