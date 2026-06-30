import { Alert, Result, Spin } from "antd";
import { CenterState } from "@lwmacct/260627-antd-workbench";
import { Navigate, Outlet } from "react-router-dom";
import { appPaths } from "./navigation";
import { useAuthStateQuery } from "@/modules/auth";

function RoutePending() {
  return (
    <CenterState>
      <Spin />
    </CenterState>
  );
}

function RouteError({ message }: { message: string }) {
  return (
    <CenterState>
      <Alert
        showIcon
        title="应用初始化失败"
        description={message}
        type="error"
      />
    </CenterState>
  );
}

export function GuestOnlyBoundary() {
  const authState = useAuthStateQuery();

  if (authState.isPending) {
    return <RoutePending />;
  }

  if (authState.isError) {
    return <RouteError message={authState.error.message} />;
  }

  if (authState.data.session.authenticated) {
    return <Navigate to={appPaths.console} replace />;
  }

  return <Outlet />;
}

export function ProtectedBoundary() {
  const authState = useAuthStateQuery();

  if (authState.isPending) {
    return <RoutePending />;
  }

  if (authState.isError) {
    return <RouteError message={authState.error.message} />;
  }

  if (!authState.data.session.authenticated) {
    return <Navigate to={appPaths.login} replace />;
  }

  return <Outlet />;
}

export function AdminBoundary() {
  const authState = useAuthStateQuery();

  if (authState.isPending) {
    return <RoutePending />;
  }

  if (authState.isError) {
    return <RouteError message={authState.error.message} />;
  }

  if (!authState.data.session.user?.admin) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="当前账号没有管理员权限。"
        extra={<Navigate to={appPaths.console} replace />}
      />
    );
  }

  return <Outlet />;
}
