import { type RouteObject } from "react-router-dom";
import { ConsoleRoute } from "./ConsoleRoute";

export const consoleRoute: RouteObject = {
  path: "console",
  element: <ConsoleRoute />,
};
