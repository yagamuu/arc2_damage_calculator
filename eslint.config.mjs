import process from "node:process";
import { globalIgnores } from "eslint/config";
import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import pluginVuetify from "eslint-plugin-vuetify";
import {
  defineConfigWithVueTs,
  vueTsConfigs
} from "@vue/eslint-config-typescript";
import prettierRecommended from "@vue/eslint-config-prettier";

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{js,mjs,ts,mts,vue}"]
  },
  globalIgnores([
    "docs/**",
    ".ci-build/**",
    "dist/**",
    "playwright-report/**",
    "test-results/**"
  ]),
  js.configs.recommended,
  pluginVue.configs["flat/essential"],
  // Vuetify 2・3 から削除や名前変更されたコンポーネント・props・クラスなどを検出する
  pluginVuetify.configs["flat/recommended-v4"],
  vueTsConfigs.recommended,
  prettierRecommended,
  {
    name: "app/rules",
    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
      // ESLint 9 で caughtErrors の既定が "none" から "all" に変わった。移行では挙動を変えないため、
      // 使わない catch の引数（catch (e)）は以前と同じく指摘しない
      "@typescript-eslint/no-unused-vars": ["error", { caughtErrors: "none" }],
      // クラス構文では検査されていなかった既存の1語のコンポーネント名。移行のためにファイル名は変えない
      "vue/multi-word-component-names": [
        "error",
        { ignores: ["Contents", "Description", "Result"] }
      ],
      // 以下は ESLint/typescript-eslint の更新で推奨に加わった、または強まったルール。
      // 直すには計算ロジックや型に手を入れる必要があり移行の範囲外のため、警告に留める（#55 の PR に一覧）
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-useless-assignment": "warn"
    }
  }
);
