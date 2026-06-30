import { Navigate, Outlet, createHashRouter } from "react-router-dom";
import { appPaths } from "./navigation";
import { ProtectedBoundary } from "./guards";
import { AppShell } from "../shell/AppShell";
import { adminRoutes } from "@/modules/admin/routes";
import { authRoutes } from "@/modules/auth/routes";
import { consoleRoute } from "@/modules/console/routes";
import { settingsRoutes } from "@/modules/settings/routes";

export const router = createHashRouter([
  {
    path: "/",
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <Navigate to={appPaths.console} replace />,
      },
      authRoutes,
      {
        element: <ProtectedBoundary />,
        children: [
          {
            element: <AppShell />,
            children: [
              consoleRoute,
              settingsRoutes,
              adminRoutes,
            ],
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to={appPaths.console} replace />,
      },
    ],
  },
]);
