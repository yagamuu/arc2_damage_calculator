import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

// docs/index.html は Google Fonts と Material Design Icons(@latest) を外部 CDN から読み込み、
// アプリの JS はそのスタイルシートの読み込みを待ってから実行される。CDN が遅いとページの読み込みが
// 止まってテストがタイムアウトするため、配信元以外への通信は遮断する（E2E は見た目を検証しない）
export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    await page.route(
      url => !url.href.startsWith(`${baseURL}/`),
      route => route.abort()
    );
    await use(page);
  }
});
