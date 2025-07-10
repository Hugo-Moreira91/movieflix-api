import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,ts,mjs,cjs,mts,cts}"],
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser, // Inclui suporte ao browser também (opcional)
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
    ...prettierRecommended,
  },
  tseslint.configs.recommended,
]);
