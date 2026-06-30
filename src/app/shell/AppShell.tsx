import {
  AppShell as WorkbenchAppShell,
  ThemeToggle,
  UserMenu,
  type AppShellProps,
} from "@lwmacct/260627-antd-workbench";
import { Space } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStateQuery, useLogoutMutation } from "@/modules/auth";
import { APP_NAME, DISPLAY_VERSION } from "@/shared/config/appConfig";
import { appPaths, topNavFromPathname, type TopNavKey } from "../router/navigation";

type AppShellNavItems = AppShellProps["nav"];

function navItems(admin: boolean): AppShellNavItems {
  const items: AppShellNavItems = [
    { key: "console", label: "控制台" },
    { key: "settings", label: "设置" },
  ];

  if (admin) {
    items.push({ key: "admin", label: "管理员" });
  }

  return items;
}

const navTargets: Record<TopNavKey, string> = {
  admin: appPaths.admin,
  console: appPaths.console,
  settings: appPaths.settings,
};

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const authState = useAuthStateQuery();
  const logoutMutation = useLogoutMutation();
  const activeNavKey = topNavFromPathname(location.pathname);
  const isFlushContent =
    activeNavKey === "admin" || activeNavKey === "settings";
  const user = authState.data?.session.user;

  function handleNavigate(key: string) {
    const navKey = key as TopNavKey;
    const target = navTargets[navKey];

    if (!target || target === location.pathname) {
      return;
    }

    navigate(target);
  }

  return (
    <WorkbenchAppShell
      actions={
        <Space>
          <ThemeToggle />
          <UserMenu
            user={{ username: user?.username }}
            onLogout={() => void logoutMutation.mutateAsync()}
            onOpenAccount={() => navigate(appPaths.settings)}
          />
        </Space>
      }
      brand={{ mark: "A", name: APP_NAME, version: DISPLAY_VERSION }}
      flushContent={isFlushContent}
      nav={navItems(Boolean(user?.admin))}
      selectedNavKey={activeNavKey}
      onSelectNav={handleNavigate}
    >
      <Outlet />
    </WorkbenchAppShell>
  );
}
