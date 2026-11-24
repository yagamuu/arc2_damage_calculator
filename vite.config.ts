import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue2 from "@vitejs/plugin-vue2";

export default defineConfig({
  base: "./",
  plugins: [vue2()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url))
      },
      // コンパイル済みの vuetify（UMD）は require("vue") で CommonJS 版の Vue を読み込み、
      // アプリの import は ESM 版を読むため Vue が2つになり Vuetify が初期化されない。どちらも ESM 版にそろえる
      { find: /^vue$/, replacement: "vue/dist/vue.runtime.esm.js" }
    ]
  },
  build: {
    outDir: "docs"
  }
});
