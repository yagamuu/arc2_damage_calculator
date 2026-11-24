import { defineConfig, devices } from "@playwright/test";

// 配信するディレクトリを差し替えられるのは、公開物の docs/ を書き換えずに一時ディレクトリへ
// ビルドした結果を検証できるようにするため（#46 段階2）。既定はコミット済みの docs/
const servedDir = process.env.E2E_SERVED_DIR ?? "docs";
const port = 4173;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  // 静的配信に serve 等を足さず vite preview を使うのは、Vitest のために vite を導入済みで、
  // 段階2で Vite がビルドツールになった後もそのまま使えるため
  webServer: {
    command: `npx vite preview --outDir "${servedDir}" --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
