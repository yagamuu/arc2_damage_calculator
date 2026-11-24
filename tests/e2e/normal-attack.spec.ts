import { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { sideCard, field, chooseOption, turnOnSwitch } from "./helpers";

const openNormalAttack = async (page: Page) => {
  await page.goto("/");
  return {
    attackSide: sideCard(page, "攻撃側データ"),
    defenseSide: sideCard(page, "防御側データ"),
    result: page.getByText(/ダメージ\(ヒット\)：/)
  };
};

test.describe("通常攻撃", () => {
  test("攻撃側と防御側のユニットを選ぶと、パラメータが自動で入り、ダメージが表示される", async ({
    page
  }) => {
    const { attackSide, defenseSide, result } = await openNormalAttack(page);
    await expect(result).toContainText("ダメージ(ヒット)：16～28");

    await chooseOption(page, attackSide, "ユニット", "トッシュ");

    await expect(field(attackSide, "Lv")).toHaveValue("46");
    await expect(field(attackSide, "登場Lv")).toHaveValue("46");
    await expect(field(attackSide, "基本攻撃力内部値")).toHaveValue("170");
    await expect(result).toContainText("ダメージ(ヒット)：35～52");

    await chooseOption(page, defenseSide, "ユニット", "イーガ");

    await expect(field(defenseSide, "Lv")).toHaveValue("44");
    await expect(field(defenseSide, "登場Lv")).toHaveValue("44");
    await expect(field(defenseSide, "基本防御力内部値")).toHaveValue("58");
    await expect(result).toContainText("ダメージ(ヒット)：51～68");
    await expect(result).toContainText("ダメージ(ヒット)期待値：55");
  });

  test("Lvを変えたり、クリティカル・瀕死を切り替えたりすると、ダメージが変わる", async ({
    page
  }) => {
    const { attackSide, defenseSide, result } = await openNormalAttack(page);
    await expect(result).toContainText("ダメージ(ヒット)：16～28");

    await field(attackSide, "Lv").fill("60");

    await expect(field(attackSide, "基本攻撃力内部値")).toHaveValue("149");
    await expect(result).toContainText("ダメージ(ヒット)：26～42");

    await turnOnSwitch(attackSide, "クリティカル");

    await expect(result).toContainText("ダメージ(ヒット)：26～92");
    await expect(result).toContainText("ダメージ(ヒット)期待値：39");

    await turnOnSwitch(defenseSide, "瀕死");

    await expect(result).toContainText("ダメージ(ヒット)：17～83");
    await expect(result).toContainText("ダメージ(ヒット)期待値：30");
  });

  test("入れ替えボタンで攻撃側と防御側の入力が入れ替わり、リセットボタンで初期状態に戻る", async ({
    page
  }) => {
    const { attackSide, defenseSide, result } = await openNormalAttack(page);
    await chooseOption(page, attackSide, "ユニット", "トッシュ");
    await chooseOption(page, defenseSide, "ユニット", "イーガ");
    await expect(result).toContainText("ダメージ(ヒット)：51～68");

    // 入れ替えボタンはアイコンだけで名前を持たないため、アプリのテンプレートが指定しているアイコン名で探す
    await attackSide
      .getByRole("button")
      .filter({ has: page.locator(".mdi-swap-vertical") })
      .click();

    await expect(field(attackSide, "ユニット")).toHaveValue("イーガ");
    await expect(field(attackSide, "Lv")).toHaveValue("44");
    await expect(field(attackSide, "基本攻撃力内部値")).toHaveValue("162");
    await expect(field(defenseSide, "ユニット")).toHaveValue("トッシュ");
    await expect(field(defenseSide, "Lv")).toHaveValue("46");
    await expect(field(defenseSide, "基本防御力内部値")).toHaveValue("105");
    await expect(result).toContainText("ダメージ(ヒット)：17～26");

    await page.getByRole("button", { name: "入力項目のリセット" }).click();

    for (const side of [attackSide, defenseSide]) {
      await expect(field(side, "ユニット")).toHaveValue("アーク");
      await expect(field(side, "Lv")).toHaveValue("47");
    }
    await expect(field(attackSide, "基本攻撃力内部値")).toHaveValue("123");
    await expect(field(defenseSide, "基本防御力内部値")).toHaveValue("112");
    await expect(result).toContainText("ダメージ(ヒット)：16～28");
  });
});
