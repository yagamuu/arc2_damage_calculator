import { Page, Locator } from "@playwright/test";
import { expect } from "./fixtures";

// Vue/Vuetify のバージョンに依存しないよう、内部のクラス名ではなく見出しの文言とラベルで
// 攻撃側・防御側の入力欄のまとまりを探す（両方に「ユニット」等の同じラベルがあるため）。
// タブを切り替えても前のタブの中身が非表示のまま DOM に残るため、表示されているものに絞る
export const sideCard = (
  page: Page,
  title: "攻撃側データ" | "防御側データ"
): Locator =>
  page
    .locator("div")
    .filter({ has: page.getByText(title, { exact: true }) })
    .filter({ has: page.getByLabel("ユニット", { exact: true }) })
    .filter({ visible: true })
    .last();

export const field = (card: Locator, label: string): Locator =>
  card.getByLabel(label, { exact: true });

// 文字を入力して候補を絞り込み、一覧から選ぶ入力欄（ユニット・特殊能力）で値を選ぶ
export const chooseOption = async (
  page: Page,
  card: Locator,
  label: string,
  option: string
): Promise<void> => {
  await field(card, label).click();
  await field(card, label).fill(option);
  await page.getByRole("option", { name: option, exact: true }).click();
};

// Vuetify 2 のスイッチは input の上に波紋用の要素が重なっていて input を直接操作できないため、
// 利用者と同じくラベルをクリックして切り替える
export const turnOnSwitch = async (
  card: Locator,
  label: string
): Promise<void> => {
  await card.getByText(label, { exact: true }).click();
  await expect(field(card, label)).toBeChecked();
};
