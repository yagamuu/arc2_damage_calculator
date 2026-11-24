import { test, expect, Page, Locator } from "@playwright/test";

// Vue/Vuetify のバージョンに依存しないよう、内部のクラス名ではなく見出しの文言とラベルで
// 攻撃側・防御側の入力欄のまとまりを探す（両方に「ユニット」等の同じラベルがあるため）
const sideCard = (
  page: Page,
  title: "攻撃側データ" | "防御側データ"
): Locator =>
  page
    .locator("div")
    .filter({ has: page.getByText(title, { exact: true }) })
    .filter({ has: page.getByLabel("ユニット", { exact: true }) })
    .last();

const selectUnit = async (
  page: Page,
  card: Locator,
  unitName: string
): Promise<void> => {
  const field = card.getByLabel("ユニット", { exact: true });
  await field.click();
  await field.fill(unitName);
  await page.getByRole("option", { name: unitName, exact: true }).click();
};

test.describe("通常攻撃", () => {
  test("攻撃側と防御側のユニットを選ぶと、パラメータが自動で入り、ダメージが表示される", async ({
    page
  }) => {
    await page.goto("/");
    const attackSide = sideCard(page, "攻撃側データ");
    const defenseSide = sideCard(page, "防御側データ");
    const result = page.getByText(/ダメージ\(ヒット\)：/);
    await expect(result).toContainText("ダメージ(ヒット)：16～28");

    await selectUnit(page, attackSide, "トッシュ");

    await expect(attackSide.getByLabel("Lv", { exact: true })).toHaveValue(
      "46"
    );
    await expect(attackSide.getByLabel("登場Lv", { exact: true })).toHaveValue(
      "46"
    );
    await expect(
      attackSide.getByLabel("基本攻撃力内部値", { exact: true })
    ).toHaveValue("170");
    await expect(result).toContainText("ダメージ(ヒット)：35～52");

    await selectUnit(page, defenseSide, "イーガ");

    await expect(defenseSide.getByLabel("Lv", { exact: true })).toHaveValue(
      "44"
    );
    await expect(defenseSide.getByLabel("登場Lv", { exact: true })).toHaveValue(
      "44"
    );
    await expect(
      defenseSide.getByLabel("基本防御力内部値", { exact: true })
    ).toHaveValue("58");
    await expect(result).toContainText("ダメージ(ヒット)：51～68");
    await expect(result).toContainText("ダメージ(ヒット)期待値：55");
  });
});
