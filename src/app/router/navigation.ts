export const appPaths = {
  admin: "/admin/users",
  console: "/console",
  login: "/login",
  register: "/register",
  settings: "/settings/profile",
} as const;

export type TopNavKey = "admin" | "console" | "settings";

export function topNavFromPathname(pathname: string): TopNavKey {
  if (pathname.startsWith("/admin")) {
    return "admin";
  }
  if (pathname.startsWith("/settings")) {
    return "settings";
  }
  return "console";
}
