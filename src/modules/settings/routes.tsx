import { Navigate, type RouteObject } from "react-router-dom";
import { SettingsLayout } from "./layout/SettingsLayout";
import { PasswordRoute } from "./password/PasswordRoute";
import { ProfileRoute } from "./profile/ProfileRoute";
import { ThemeRoute } from "./theme/ThemeRoute";

export const settingsRoutes: RouteObject = {
  path: "settings",
  element: <SettingsLayout />,
  children: [
    { index: true, element: <Navigate to="profile" replace /> },
    { path: "profile", element: <ProfileRoute /> },
    { path: "password", element: <PasswordRoute /> },
    { path: "theme", element: <ThemeRoute /> },
  ],
};
