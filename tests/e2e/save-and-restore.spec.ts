import { Page, Locator } from "@playwright/test";
import { test, expect } from "./fixtures";
import { sideCard, field, chooseOption, turnOnSwitch } from "./helpers";
import normalAttackSample from "./saved-data/normalAttack.json";
import abilityAttackSample from "./saved-data/abilityAttack.json";

type StorageKey = "normalAttack" | "abilityAttack";

// 保存データの見本は、docs/ を操作して「保存」したときに localStorage に入った文字列をそのまま置いている。
// 移行後もこの形式を読めることを確かめるため、手で組み立てたり整形したりしない。
// アプリは JSON.stringify で保存しているので、読み込んだ見本を JSON.stringify し直すと保存時の文字列に戻る
const savedDataSamples: Record<StorageKey, string> = {
  normalAttack: JSON.stringify(normalAttackSample),
  abilityAttack: JSON.stringify(abilityAttackSample)
};

const putIntoLocalStorage = async (
  page: Page,
  key: StorageKey,
  value: string
): Promise<void> => {
  await page.addInitScript(([k, v]) => window.localStorage.setItem(k, v), [
    key,
    value
  ]);
};

// 入力内容の保存・読込の欄。通常攻撃と特殊能力のタブそれぞれにあるため、表示されているものに絞る
const saveCard = (page: Page): Locator =>
  page
    .locator("div")
    .filter({ has: page.getByText("データ保存", { exact: true }) })
    .filter({ has: page.getByLabel("保存したデータ", { exact: true }) })
    .filter({ visible: true })
    .last();

const saveAs = async (page: Page, dataName: string): Promise<void> => {
  await field(saveCard(page), "データ名").fill(dataName);
  await saveCard(page)
    .getByRole("button", { name: "保存", exact: true })
    .click();
  await expect(
    page.getByText(`データ名${dataName}を保存しました。`)
  ).toBeVisible();
};

const load = async (page: Page, dataName: string): Promise<void> => {
  await chooseOption(page, saveCard(page), "保存したデータ", dataName);
  await saveCard(page)
    .getByRole("button", { name: "読込", exact: true })
    .click();
};

// 基本攻撃力内部値などの横にあるラベルのないチェック欄。オンにすると自動計算をやめて手入力できる。
// Vuetify 2 のチェック欄は input の上に波紋用の要素が重なり、ラベルもないため force でクリックする
const manualInputCheckbox = (card: Locator, label: string): Locator =>
  card
    .locator("div")
    .filter({ has: card.page().getByLabel(label, { exact: true }) })
    .filter({ has: card.page().getByRole("checkbox") })
    .last()
    .getByRole("checkbox");

const enterManually = async (
  card: Locator,
  label: string,
  value: string
): Promise<void> => {
  await manualInputCheckbox(card, label).check({ force: true });
  await field(card, label).fill(value);
};

const openAbilityAttackTab = async (page: Page): Promise<void> => {
  await page.getByRole("tab", { name: "特殊能力" }).click();
};

// 見本の保存データは、この入力をした状態で「保存」して作った
const enterNormalAttackSample = async (page: Page): Promise<void> => {
  const attackSide = sideCard(page, "攻撃側データ");
  const defenseSide = sideCard(page, "防御側データ");
  await chooseOption(page, attackSide, "ユニット", "トッシュ");
  await chooseOption(page, defenseSide, "ユニット", "イーガ");
  await field(attackSide, "Lv").fill("50");
  await field(attackSide, "武器ATT").fill("20");
  await turnOnSwitch(attackSide, "クリティカル");
  await turnOnSwitch(defenseSide, "瀕死");
  await enterManually(attackSide, "基本攻撃力内部値", "200");
};

const expectNormalAttackSampleShown = async (page: Page): Promise<void> => {
  const attackSide = sideCard(page, "攻撃側データ");
  const defenseSide = sideCard(page, "防御側データ");
  await expect(field(attackSide, "ユニット")).toHaveValue("トッシュ");
  await expect(field(attackSide, "Lv")).toHaveValue("50");
  await expect(field(attackSide, "登場Lv")).toHaveValue("46");
  await expect(field(attackSide, "基本攻撃力内部値")).toHaveValue("200");
  await expect(field(attackSide, "基本攻撃力内部値")).toBeEnabled();
  await expect(field(attackSide, "武器ATT")).toHaveValue("20");
  await expect(field(attackSide, "クリティカル")).toBeChecked();
  await expect(field(defenseSide, "ユニット")).toHaveValue("イーガ");
  await expect(field(defenseSide, "Lv")).toHaveValue("44");
  await expect(field(defenseSide, "基本防御力内部値")).toHaveValue("58");
  await expect(field(defenseSide, "瀕死")).toBeChecked();
  const result = page.getByText(/ダメージ\(ヒット\)：/);
  await expect(result).toContainText("ダメージ(ヒット)：99～192");
  await expect(result).toContainText("ダメージ(ヒット)期待値：119");
};

// 見本の保存データは、この入力をした状態で「保存」して作った
const enterAbilityAttackSample = async (page: Page): Promise<void> => {
  const attackSide = sideCard(page, "攻撃側データ");
  const defenseSide = sideCard(page, "防御側データ");
  await chooseOption(page, attackSide, "ユニット", "トッシュ");
  await chooseOption(page, defenseSide, "ユニット", "イーガ");
  await chooseOption(page, attackSide, "特殊能力", "振り下ろし");
  await field(attackSide, "Lv").fill("50");
  await field(attackSide, "装備MAG").fill("10");
  await enterManually(attackSide, "基本魔力内部値", "90");
};

const expectAbilityAttackSampleShown = async (page: Page): Promise<void> => {
  const attackSide = sideCard(page, "攻撃側データ");
  const defenseSide = sideCard(page, "防御側データ");
  await expect(field(attackSide, "ユニット")).toHaveValue("トッシュ");
  await expect(field(attackSide, "Lv")).toHaveValue("50");
  await expect(field(attackSide, "特殊能力")).toHaveValue("振り下ろし");
  await expect(field(attackSide, "基本魔力内部値")).toHaveValue("90");
  await expect(field(attackSide, "基本魔力内部値")).toBeEnabled();
  await expect(field(attackSide, "装備MAG")).toHaveValue("10");
  await expect(field(defenseSide, "ユニット")).toHaveValue("イーガ");
  await expect(field(defenseSide, "基本防御力内部値")).toHaveValue("58");
  const result = page.getByText(/ダメージ：/);
  await expect(result).toContainText("ダメージ：61～74");
  await expect(result).toContainText("ダメージ期待値：67");
};

test.describe("保存と復元", () => {
  test("通常攻撃の入力内容を保存すると、再読み込みしても保存したデータから復元できる", async ({
    page
  }) => {
    await page.goto("/");
    await enterNormalAttackSample(page);
    await saveAs(page, "保存テスト");

    await page.reload();
    await expect(field(sideCard(page, "攻撃側データ"), "ユニット")).toHaveValue(
      "アーク"
    );
    await load(page, "保存テスト");

    await expectNormalAttackSampleShown(page);
  });

  test("特殊能力の入力内容を保存すると、再読み込みしても保存したデータから復元できる", async ({
    page
  }) => {
    await page.goto("/");
    await openAbilityAttackTab(page);
    await enterAbilityAttackSample(page);
    await saveAs(page, "保存テスト");

    await page.reload();
    await openAbilityAttackTab(page);
    await expect(field(sideCard(page, "攻撃側データ"), "ユニット")).toHaveValue(
      "アーク"
    );
    await load(page, "保存テスト");

    await expectAbilityAttackSampleShown(page);
  });
});

test.describe("保存データの互換性", () => {
  test("移行前のアプリが normalAttack に保存したデータを読み込める", async ({
    page
  }) => {
    await putIntoLocalStorage(
      page,
      "normalAttack",
      savedDataSamples.normalAttack
    );
    await page.goto("/");

    await load(page, "見本の通常攻撃");

    await expectNormalAttackSampleShown(page);
  });

  test("移行前のアプリが abilityAttack に保存したデータを読み込める", async ({
    page
  }) => {
    await putIntoLocalStorage(
      page,
      "abilityAttack",
      savedDataSamples.abilityAttack
    );
    await page.goto("/");
    await openAbilityAttackTab(page);

    await load(page, "見本の特殊能力");

    await expectAbilityAttackSampleShown(page);
  });
});
