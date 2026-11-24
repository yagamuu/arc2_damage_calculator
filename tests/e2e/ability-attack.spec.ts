import { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { sideCard, field, chooseOption } from "./helpers";

const openAbilityAttack = async (page: Page) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "特殊能力" }).click();
  return {
    attackSide: sideCard(page, "攻撃側データ"),
    defenseSide: sideCard(page, "防御側データ"),
    result: page.getByText(/ダメージ：/)
  };
};

test.describe("特殊能力", () => {
  test("攻撃側と防御側のユニットと特殊能力を選ぶと、ダメージが表示される", async ({
    page
  }) => {
    const { attackSide, defenseSide, result } = await openAbilityAttack(page);
    await expect(result).toContainText("ダメージ：25～31");

    await chooseOption(page, attackSide, "ユニット", "トッシュ");

    await expect(field(attackSide, "Lv")).toHaveValue("46");
    await expect(field(attackSide, "基本攻撃力内部値")).toHaveValue("170");
    await expect(field(attackSide, "基本魔力内部値")).toHaveValue("69");
    await expect(field(attackSide, "特殊能力")).toHaveValue("桜花雷爆斬");
    await expect(result).toContainText("ダメージ：32～39");

    await chooseOption(page, defenseSide, "ユニット", "イーガ");

    await expect(field(defenseSide, "Lv")).toHaveValue("44");
    await expect(field(defenseSide, "基本防御力内部値")).toHaveValue("58");
    await expect(result).toContainText("ダメージ：42～51");

    await chooseOption(page, attackSide, "特殊能力", "振り下ろし");

    await expect(result).toContainText("ダメージ：44～53");
    await expect(result).toContainText("ダメージ期待値：48");

    await chooseOption(page, attackSide, "特殊能力", "ファイヤーストーム");

    await expect(result).toContainText("ダメージ：14～17");
    await expect(result).toContainText("ダメージ期待値：15");
  });
});
