import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config([
  { ignores: ["dist"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
      ...reactRefresh.configs.vite.rules,
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/pages/*"],
              message: "业务代码已收敛到 src/modules，不要再引用旧 pages/features 层。",
            },
            {
              group: ["@/modules/*/api/*", "@/modules/*/model/*", "@/modules/*/ui/*"],
              message: "跨模块引用请走模块 public API 或 route 入口，不要深导入模块内部文件。",
            },
          ],
        },
      ],
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
