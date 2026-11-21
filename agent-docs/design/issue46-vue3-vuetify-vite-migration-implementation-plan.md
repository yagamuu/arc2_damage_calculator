# Issue #46: Vue3・Vuetify・Viteへの移行とテスト導入 実装計画

対象Issue: https://github.com/yagamuu/arc2_damage_calculator/issues/46
スコープ: Issue全体（段階1〜段階3のすべて）

この文書は、本リポジトリの文脈を持たない別のAIコーディングエージェントが、追加の調査や質問なしにそのまま実装に着手できることを目的に書かれている。参照する一次情報のURLと、現在リポジトリにインストールされているバージョンに基づく正しいAPIの書き方を明記した。

## 0. 読む前に: この計画で確定した前提

Issue #46本文とこの計画で異なる判断をした箇所、Issue作成時点から状況が変わった箇所を先に明記する。実装中にIssue本文とこの計画が矛盾しているように見えたら、**この計画を優先すること**（リポジトリ管理者と協議済みの判断のため）。

### 0.1 段階3の移行先はVuetify3ではなくVuetify4にする

Issue本文の「Implementation Decisions」には「Vuetify3」と書かれているが、これはIssue作成時点（Vuetify3が最新だった頃）の記述である。2026年11月現在、Vuetify3は`v3.13.0`(2026-07-27)を最後に新機能追加を終了し2027年7月までのLTS(バグ修正のみ)フェーズに入っており、Vuetify4(`v4.3.4`)が現行の開発対象になっている。Vuetify公式はv3→v4の移行を「intentionally minimal」としており、本計画が書き換える対象（`v-list-item-content`廃止、`v-tab-item`→`v-window-item`等）はすべてv2→v3時点の変更でv3→v4では追加の書き換えがほぼ発生しない。リポジトリ管理者に確認し、v4を対象にする方針で合意済み。**実装後、Issue #46に「Vuetify3ではなくVuetify4を対象にした」ことと上記理由をコメントで残すこと。**

### 0.2 段階2のVite本体は7系に固定する

`@vitejs/plugin-vue2`(Vue2.7をVite上で動かすための必須プラグイン)は2025年10月にリポジトリがアーカイブされ、`peerDependencies`が`"vite": "^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"`でVite 8を含んでいない。Vite 8は内部トランスフォーマがesbuildからOxc(Rust製)に変わり、レガシーTSデコレータ(`experimentalDecorators`)のサポートがまだ安定していない。段階2の期間中はクラス構文のコンポーネントが残っているため、Vite 8の採用はリスクが高い。Vite 7系の最新パッチに固定すること。この判断は`agent-docs/adr/0002-pin-vite-to-7.md`として新規ADRに残すこと（3.5節参照）。

### 0.3 vue-tscは、Vue2のクラスコンポーネントサポートが残っている最後の3.0系に固定する

Vue Language Tools(`vue-tsc`を含む)は`v3.1.0`(2025-09-28)でVue2およびクラスコンポーネントのサポートを完全に廃止した。2026年11月時点の最新は`v3.3.14`だが、これはVue2プロジェクトでは使えない。`npm view vue-tsc versions --json`で確認した結果、Vue2対応が残る3.0系の最終パッチは**`3.0.11`**である（`3.0.12`以降は存在せず、次のバージョンが`3.1.0`になっている）。実装時に同コマンドで変化がないか再確認してから`vue-tsc@3.0.11`に固定すること。段階3でVue3へ上げたタイミングで最新の`vue-tsc`に追従してよい。

### 0.4 ESLintは段階2でFlat Config(eslint.config.js)に移行する

ESLint本体は`v10.0.0`(2026-02)で`.eslintrc.*`形式のサポートを完全に廃止した。現行の`.eslintrc.js`はそのまま残せないため、段階2でのツール更新と同時にFlat Configへ移行する。

### 0.5 本計画のコード例中の注釈について

本計画のコードブロック中に出てくる`/* ... */`や「そのまま methods 内に移す」のような日本語の注釈・省略記号は、**この計画の読み手（実装するエージェント）向けの指示であり、実際にソースコードへコピーしてよいコメントではない**。実装時にコードへ書いてよいコメントは`code-comments` Skillの基準（Why not、あえてやっていないこと等）を満たすものだけであり、本計画中の注釈はそれに当たらない。コード例を転記する際は、このような指示用の注釈を取り除き、実際のロジックだけを書くこと。

### 0.6 段階1の時点で`npm ci`・`npm run lint`・`npm run build`が実際に壊れていることを再現・確認済み

Issue本文Problem Statementの「`npm ci`がpeer依存の衝突で失敗し、`--legacy-peer-deps`を付けても`vuetify-loader`とwebpack5の不整合でビルドできない」という記述を、クリーンな環境(`node_modules`を作らず`npm ci`からやり直す)で実際に再現して確認した。内容は次の2つに分解できる。

1. **`npm ci`自体がERESOLVEエラーで失敗する**: `@vue/cli-plugin-eslint@~5.0.8`が要求する`eslint@>=7.5.0`と、`@typescript-eslint/eslint-plugin@^2.26.0`が要求する`eslint@^5.0.0 || ^6.0.0`が衝突する。**リポジトリルートに`.npmrc`を追加し`legacy-peer-deps=true`を設定することで`npm ci`は成功するようになる**(実機で確認済み)。この設定を段階1で追加する。
2. **`npm run lint`(`vue-cli-service lint`)・`npm run build`(`vue-cli-service build`)は、1の問題を回避してインストールが成功しても、別の理由で動かない**: `vue-cli-service`は起動時にインストール済みの全プラグイン(`vue-cli-plugin-vuetify`経由の`vuetify-loader`を含む)を読み込むが、`vuetify-loader`が`require("webpack/lib/RuleSet")`を呼んでおり、現在インストールされるwebpack5にはこのモジュールが存在せず`Error: Cannot find module 'webpack/lib/RuleSet'`で落ちる(実機で確認済み、`npm run lint`も`npm run build`も同じエラーで落ちる。lintであってもwebpack関連のプラグインを経由して起動するため)。**これは段階2のVite移行で`vue-cli-service`自体を削除するまで直らない。段階1でこれを直そうとしないこと**(Issue本文「段階1では今のビルド環境は直さない」の具体的な中身がこれである)。

この2つ目の制約により、段階1では次のように対応する:
- **lintは`npm run lint`(`vue-cli-service lint`)ではなく、ESLintを直接呼び出す**(`npx eslint`、`vue-cli-service`を経由しないため上記2の問題を回避できる。実機で0エラー・33警告で正常終了することを確認済み)。
- **段階1では`npm run build`を一切実行しない**。`docs/`は既存のビルド結果をそのまま使う(Issue本文Further Notes「`docs/`は現在のソースのビルド結果とみなせる」)。ビルドが現在壊れているため、再ビルドして差分が無いことを確認する、という方法自体が実行できない。

これ以降の章は、上記の確定した前提のもとで書かれている。

## 1. 全体構成

### 1.1 段階とブランチ戦略（Issue本文の決定どおり）

| 段階 | 内容 | 作業ブランチ | マージ先 | 公開物(`docs/`)への影響 |
|---|---|---|---|---|
| 段階1 | テスト(Vitest/Playwright)とCI(GitHub Actions)の導入 | 任意のfeatureブランチ(例: `test/vitest-playwright-ci`) | `master`に直接マージ | 変更なし（`src/`・ビルド設定は一切変更しない） |
| 段階2 | Vue2.7のまま: Vite移行、TS/ESLint等の開発ツール更新、クラス構文→Options API書き換え、`HelloWorld.vue`削除 | `migrate/vue3`（統合ブランチ、ここから作成） | `migrate/vue3`に複数PRをマージ | 変更なし（CI/E2Eは一時ディレクトリにビルドし`docs/`を書き換えない） |
| 段階3 | Vue3・Vuetify4へ同時アップグレード | `migrate/vue3`（継続） | 完了後、公開用ビルドで`docs/`を更新してから**`master`に一度だけマージ** | 移行完了時に1回だけ更新 |

段階2と段階3は同じ`migrate/vue3`ブランチ上で複数PRに分けて進めてよいが、**`docs/`ディレクトリを書き換えるのは段階3完了時の1回だけ**という制約を守ること（Issue本文 User Story 8、Implementation Decisions「段階3」節）。

### 1.2 変更しないもの（Out of Scope、Issue本文より）

- 自前のStore(`src/components/*/store.ts`)とMixin(`src/components/*/Mixin.ts`)の廃止、Composition APIへの書き換え（移行完了後に別途進める。理由は`agent-docs/adr/0001-options-api-as-interim-for-vue3-migration.md`）
- ダメージ計算ロジック(`src/util/calc.ts`)の誤りの修正（見つけても直さずIssueを立てる）
- 計算式の正しさをゲームの実測値と照らし合わせること
- 見た目の改善・デザイン変更
- Chromium以外のブラウザでのE2E
- GitHub Pagesへのデプロイ方法の変更

### 1.3 用語

`GLOSSARY.md`に従う。「通常攻撃」(`NormalAttack`はコード上の名前としてのみ使う)、「特殊能力」(`AbilityAttack`も同様)、「攻撃側」(`attack`も同様)、「防御側」(`defense`も同様)。

---

## 2. 段階1: テストとCIの導入

**ブランチ**: `master`から作成し、完了後`master`に直接マージ。`src/`配下のファイルは一切変更しない。

### 2.1 変更対象ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `package.json` | 変更 | `devDependencies`に`vitest`, `vite`, `@playwright/test`, `serve`を追加。`scripts`に`test:unit`, `test:e2e`を追加（既存の`lint`/`build`/`serve`スクリプトは変更しない。0.6節の理由により段階1ではこれらを使わない） |
| `.npmrc` | 新規 | `legacy-peer-deps=true`（0.6節。現在`npm ci`が失敗する原因のERESOLVEを回避する） |
| `vitest.config.ts` | 新規 | Vitestの設定。`@`エイリアス解決 |
| `tests/unit/calc.spec.ts` | 新規 | `src/util/calc.ts`の上位関数の単体テスト |
| `playwright.config.ts` | 新規 | Playwrightの設定。Chromiumのみ、`docs/`を静的配信するWebサーバー設定 |
| `tests/e2e/normal-attack.spec.ts` | 新規 | E2Eシナリオ1〜3（通常攻撃） |
| `tests/e2e/ability-attack.spec.ts` | 新規 | E2Eシナリオ4（特殊能力） |
| `tests/e2e/save-and-restore.spec.ts` | 新規 | E2Eシナリオ5・6（保存データの保存・復元・互換性） |
| `.nvmrc` | 新規 | `24`（現在インストール済みのNode v24.22.1に合わせる） |
| `.github/workflows/ci.yml` | 新規 | PR・master pushごとにlint・型チェック・単体テスト・E2Eを実行 |
| `.gitignore` | 変更 | `/test-results/`, `/playwright-report/`, `/playwright/.cache/`を追記 |

`tsconfig.json`の`include`には既に`"tests/**/*.ts"`, `"tests/**/*.tsx"`が含まれているため、`tsconfig.json`自体の変更は不要（既存の型チェック対象に自動的に入る）。

### 2.2 ライブラリAPI（現在のバージョンでの正しい書き方）

#### Vitest

最新安定版は`npm view vitest version`で確認すること（調査時点で`5.1.1`）。公式インストールガイド: https://vitest.dev/guide/

**注意（実機で確認した制約）**: `vitest`は内部的に`vite`を読み込むため、アプリ本体がまだVite化されていない段階1でも`vite`自体を`devDependencies`に追加する必要がある。`vite`を入れずに`vitest`だけを入れると、実行時に`Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite'`で起動に失敗する（実機で確認済み）。

```bash
npm install -D vitest vite
```

`vitest.config.ts`（公式推奨: `vitest/config`から`defineConfig`をimportする。既存の`vite.config.ts`は段階1では存在しないため、単独ファイルとして作る）:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  test: {
    environment: "node"
  }
});
```

出典: https://vitest.dev/config/ （`resolve.alias`はトップレベル、`test`プロパティの外側に書く）

各テストファイルでは`import { describe, it, expect } from "vitest"`を明示する方式を採る（`tsconfig.json`の`types`を変更せずに済むため、既存設定への影響が最小）。

```typescript
// tests/unit/calc.spec.ts
import { describe, it, expect } from "vitest";
import * as calc from "@/util/calc";
```

`number[][]`の比較には`toEqual`を使う（出典: https://vitest.dev/api/expect.html 。`toStrictEqual`は型・スパース配列の区別まで厳密にするが、`calc.ts`の戻り値は常に密な配列を`new Array(n).fill(0)`で初期化してから埋めるため、`toEqual`で十分）。

`package.json`の`scripts`に追加:

```json
"test:unit": "vitest run"
```

#### Playwright

最新安定版は`npm view @playwright/test version`で確認すること。公式: https://playwright.dev/docs/intro

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

`playwright.config.ts`（Chromiumのみに絞り、`docs/`を静的配信する）:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:5000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: "npx serve docs -p 5000 -n",
    url: "http://127.0.0.1:5000",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
```

出典: https://playwright.dev/docs/test-configuration 、`webServer`オプション: https://playwright.dev/docs/api/class-testconfig#test-config-web-server

**注意(一次情報で確認した制約)**: Playwright公式には静的ファイルを配信するビルトイン機能は存在しない(`microsoft/playwright` issue #13968)。`webServer.command`にコミュニティの静的サーバーパッケージを指定するのが実質デファクト。本計画では`serve`をインストールして使う(`npm install -D serve`。`npx serve`でも動くが、CI実行ごとにネットワーク越しにダウンロードするのを避けるため`devDependencies`に明示的に加える。`npm view serve version`で現在の最新版を確認してインストールすること)。`serve --help`で確認した現在のオプション: `-p <port>`でポート指定、`-n`(`--no-clipboard`)でローカルURLのクリップボードへのコピーを無効化する(CIのようなクリップボードの無いヘッドレス環境でのエラー防止)。既存のビルド済み`docs/`をそのまま配信し、CIでも**`npm run build`を実行しない**こと(段階1は`src/`もビルド設定も変更しないため、`docs/`は既に正しいビルド結果である。Issue本文Further Notes参照)。

`package.json`の`scripts`に追加:

```json
"test:e2e": "playwright test"
```

#### Playwrightのロケータ戦略（Vuetify2実装を直接確認した結果）

本リポジトリにインストール済みの`vuetify@2.6.10`のソース(`node_modules/vuetify/src/components/VInput/VInput.ts`の`genLabel()`)を確認した結果、`label`propを渡しているすべての入力コンポーネント（`v-text-field`, `v-select`, `v-autocomplete`はすべて`VInput`を継承）は`<label for="input-N">`を生成する。本リポジトリは全箇所で`label`propを使っているため、**`page.getByLabel("ラベル文字列")`がそのまま使える**。

ただし、`InputDataForm.vue`は`target="attack"`と`target="defense"`で**2つ同時にレンダリングされ、ラベル文字列（「ユニット」「Lv」等）が重複する**。`getByLabel`だけでは2要素にマッチしてエラーになるため、親のカード単位でスコープを絞ること。各`InputDataForm`は`v-toolbar-title`に「攻撃側データ」「防御側データ」という一意な文字列を持つ`v-card`としてレンダリングされる（`src/components/NormalAttack/InputData/InputDataForm.vue:4-7`）ので、次のように絞り込む:

```typescript
const attackCard = page.locator(".v-card").filter({ hasText: "攻撃側データ" });
const defenseCard = page.locator(".v-card").filter({ hasText: "防御側データ" });

await attackCard.getByLabel("ユニット").fill("アーク");
```

`v-tab`は`role="tab"`を実装している（`VTab.ts`で確認）ため、タブ切り替えには`page.getByRole("tab", { name: "特殊能力" }).click()`を使う。

#### GitHub Actions

`actions/checkout`・`actions/setup-node`・`actions/upload-artifact`の最新メジャーはいずれも`v7`(2026-11-21、`gh api repos/actions/checkout/releases/latest`・`gh api repos/actions/setup-node/releases/latest`・`gh api repos/actions/upload-artifact/releases/latest`で確認済み。実装時は`gh api repos/actions/<name>/releases/latest --jq .tag_name`で最新を再確認すること)。`actions/setup-node@v7`は`node-version-file`オプションで`.nvmrc`を直接参照できる。

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [master]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: ".nvmrc"
          cache: "npm"
      - run: npm ci
      - run: npx eslint --ext .js,.vue,.ts src tests
      - run: npx tsc --noEmit
      - run: npm run test:unit
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v7
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

`npm ci`は0.6節の`.npmrc`(`legacy-peer-deps=true`)があるため成功する。lintを`npm run lint`(`vue-cli-service lint`)ではなく`npx eslint`で直接実行しているのは0.6節で確認した理由(`vue-cli-service`経由だと`vuetify-loader`のwebpack5非互換で起動自体が失敗するため)による。ビルドのステップが無いのも同じ理由(段階1では`docs/`を再ビルドしない)。

1ジョブにまとめたのは、段階1では`lint`・型チェック・単体テスト・E2Eのいずれも同じ`npm ci`後の状態に依存し、実行時間が数分程度に収まる小規模リポジトリであるため（ジョブを分けると`actions/checkout`・`npm ci`が重複して合計時間が伸びる）。段階2以降でビルド時間が伸びた場合は、`lint`/`型チェック`/`単体テスト`を1ジョブ、`E2E`を別ジョブに分割することを検討してよい。

### 2.3 テスト方針

#### 2.3.1 単体テスト（`tests/unit/calc.spec.ts`）

**対象**: `src/util/calc.ts`の上位関数のみ。補助関数(`fixValue`, `calcParameter`, `calcParameterWithWeekEnemy`, `skillPatternProbability`, `initDamageResult`, `initAbilityDamageResult`)は上位関数を通して間接的に検証し、個別のテストを書かない（Issue本文Implementation Decisionsの指定）。

対象関数と、それぞれが何を検証するかの観点:

| 関数 | シグネチャ | 検証する観点 |
|---|---|---|
| `calcBasicAttack` | `<T extends StateInterface>(state: T, unitData: UnitData, classData: ClassData) => number` | ウィークエネミー・ヘモジー・毒・攻撃力バフ上昇/低下の各分岐 |
| `calcAttack` | `(basicAttack: number, state: T) => number` | 武器非装備フラグの有無での計算分岐 |
| `calcBasicDefense` | `<T extends StateInterface>(state: T, unitData: UnitData, classData: ClassData) => number` | ウィークエネミー・ヘモジー/石化・毒・防御力バフの各分岐 |
| `calcDefense` | `(basicDefense: number, state: T, isNoArmor: boolean) => number` | 防具非装備フラグの有無 |
| `calcBasicMagic` | `(stateUnitData: AbilityAttackStateUnitData, unitData: UnitData, classData: ClassData) => number` | ウィークエネミー・魔力バフの分岐 |
| `calcMagic` | `(basicMagic: number, equipmentMagic: number) => number` | 装備MAGの加算 |
| `calcBasicDamage` | `(attack: number, baseAttack: number) => number[][]` | コンボパターン・乱数部分ごとの基本ダメージ |
| `calcAddDamage` | `(damageList, attack, baseAttack, defense, isDying, isWeekElement) => number[][]` | 瀕死・属性弱点補正の有無 |
| `calcConditionDamage` | `(damageList, isResistElement, directionPow, charge, isSlayer, isGuard, isCounter) => number[][]` | 属性耐性・方向・チャージ・スレイヤー・ガード・反撃の各補正と、`32767`超過時のオーバーフロー処理(`- 65536`) |
| `calcAbilityDamage` | `(power, abilityPower, mp, difference, magicDefense, isSlayer, isGuard, isWeekElement, isResistElement) => number[]` | 能力差補正・各種補正・魔防御の減算 |

**期待値の作り方（重要・必読）**: Issue本文のTesting Decisionsに「期待値は独立した出どころ、つまり公開中のアプリ(`docs/`)の画面表示から取る。コードの計算をなぞって期待値を作らない」とある。この原則を今回の対象関数に適用する際、次の制約があることが調査で判明した。

- `calcBasicAttack`/`calcAttack`/`calcBasicDefense`/`calcDefense`/`calcBasicMagic`/`calcMagic`の戻り値（最終攻撃力・最終防御力・最終魔力）は、UI上のどこにも直接表示されない（`baseAttack`等の入力欄に表示されるのは`calcParameter`の結果であり対象外の別関数）。
- 通常攻撃の最終ダメージ配列(`calcConditionDamage`の戻り値、`number[8][6]`)は、`NormalAttack/Description.vue`の表(`v-simple-table`)に表示されるが、**`isVisibleDamage()`により熟練Lvの確率が0%のコンボパターンの列は表示されない**。どのskillLvでも全8パターンが同時に可視化されることはない。
- 特殊能力の最終ダメージ配列(`calcAbilityDamage`の戻り値、`number[48]`)は、UI上に配列全体が表示される場所はなく、`AbilityAttack/InputData.vue`の`minDamage`/`maxDamage`/`expected`(最小・最大・期待値)としてのみ要約表示される。

これらの制約があるため、本計画では次の方法で「UIの表示から独立して検証する」を実務上成立させる:

1. 対象の各関数を**実際の呼び出し元(`Mixin.ts`の`updateDamageResult()`)と同じ順序でチェーンした1つのテストケース**として書く（個々の関数を単独で呼ぶのではなく、`calcBasicAttack → calcAttack → calcBasicDefense → calcDefense → calcBasicDamage → calcAddDamage → calcConditionDamage`、または特殊能力側のチェーンを再現する）。これにより、UIで観測できる最終ダメージと直接比較可能な形になる。
2. 入力フィクスチャは、`docs/`をローカルで配信してブラウザで実際に選択・入力した値（ユニット名・Lv・各種補正の有無）を使う。固定ユニットとして**「アーク」(攻撃側・防御側とも)** を使うことを推奨する(`src/assets/unitData.json`・`src/assets/classData.json`に実データがあり、store.tsの初期値もアークが既定値であるため、UI操作の手数が最小で済む)。
3. 通常攻撃は、`weaponSkillLv`を複数パターン（例: `1`と`8`）に変えて2つ以上のテストケースを作り、それぞれで**UIの表で可視化されている列だけをUIの表示値と突き合わせて正しさを確認**し、その後、同じ入力で関数を呼んだ全48値（可視・不可視の列すべて）をテストの期待値としてハードコードする。これは「可視化されている部分の正しさをUIで裏付けたうえで、現在の実装が返す値そのものを以後の回帰検知の基準にする」という意味であり、計算式を手でなぞって期待値を作ることとは異なる。
4. 特殊能力は、UIの`minDamage`/`maxDamage`/`expected`の3値を読み取り、同じ入力で関数を直接呼んだ結果の`Math.min(...)`/`Math.max(...)`/`Math.floor(sum/48)`が一致することを確認した上で、その48要素の配列全体をテストの期待値としてハードコードする。
5. ウィークエネミー・毒・ヘモジー・各バフ・反撃等の分岐は、デフォルト(アーク対アーク)の状態からチェックボックス・セレクトを1つずつ変更し、UIの表示が変化することを確認して期待値を更新する。

**配置場所**: `tests/unit/calc.spec.ts`に1ファイルにまとめる（対象関数が少ないため分割不要）。

#### 2.3.2 E2Eテスト（`tests/e2e/*.spec.ts`）

**対象**: ビルド済み`docs/`を`npx serve`で配信したページ。Chromiumのみ。

**シナリオと配置ファイル**（Issue本文Implementation Decisionsの6本をそのまま採用）:

| # | ファイル | シナリオ | 操作と観測点 |
|---|---|---|---|
| 1 | `tests/e2e/normal-attack.spec.ts` | 通常攻撃: ユニット選択で自動入力・ダメージ表示 | 「攻撃側データ」カードの「ユニット」で任意のユニット(例: アーク)を選択 → 「Lv」「基本攻撃力内部値」が自動入力されることを確認 → ダメージ(ヒット)の範囲表示が`0〜0`から変化することを確認 |
| 1 | 同上 | 防御側も同様 | 「防御側データ」カードで別ユニットを選択 → 同様に自動入力を確認 |
| 2 | 同上 | Lv変更・チェックボックス切替でダメージが変わる | Lvの数値を変更 → ダメージ表示が変わることを確認。「クリティカル」スイッチをON → ダメージ表示が変わることを確認 |
| 3 | 同上 | 入れ替え・初期化 | 入れ替えアイコンボタンをクリック → 攻撃側・防御側のユニット名が入れ替わることを確認。「入力項目のリセット」ボタンをクリック → ユニット名が初期値に戻ることを確認 |
| 4 | `tests/e2e/ability-attack.spec.ts` | 特殊能力: ユニットと特殊能力選択でダメージ表示 | 「特殊能力」タブに切り替え → ユニット選択 → 特殊能力を選択 → ダメージ(期待値)が表示されることを確認 |
| 5 | `tests/e2e/save-and-restore.spec.ts` | 保存と復元 | 「データ名」に任意の名前を入力して「保存」 → ページをリロード → 「保存したデータ」の一覧に同じ名前が残っていることを確認 → 「読込」ボタンでユニット名等が復元されることを確認。通常攻撃・特殊能力の両方で実施 |
| 6 | 同上 | 保存データの互換性 | `page.addInitScript()`または`page.evaluate()`で、移行前の形式のJSON文字列を`localStorage.setItem("normalAttack", ...)` / `localStorage.setItem("abilityAttack", ...)`に事前投入してからページを開く → 「保存したデータ」一覧に投入したデータ名が表示され、「読込」で正しく復元されることを確認 |

**シナリオ6の互換性データ**: `src/components/NormalAttack/InputData.vue`の`saveData()`/`loadData()`実装（112-206行目）を見ると、`localStorage`に保存される形式は`{ storeData: [{ ...NormalAttackStateInterface, dataName: string }, ...] }`というJSON文字列である。実装時に、現在の`docs/`を実際にブラウザで操作して「保存」した後の`localStorage.getItem("normalAttack")`の実際の値を1件取得し、それをテストコードの初期投入データとしてそのまま使うこと（型を手で組み立てるのではなく、実物のシリアライズ結果を使うことで「移行前の形式」を正確に再現できる）。

**E2Eの期待値の取得方法**: Playwrightのコードを書く前に、`npx serve docs -p 5000`でローカル配信し、実際にブラウザ（またはPlaywright Codegen: `npx playwright codegen http://127.0.0.1:5000`）で操作し、画面に表示された数値をそのままテストコードにリテラルで書く。コードを書いてから動かして値を確認するのではなく、**先に画面を操作して値を確定させてからテストを書く**こと。

### 2.4 品質管理の実行手順

ルートの`CLAUDE.md`に「品質管理の実行手順」の節がある場合はそれに従う。本リポジトリの`CLAUDE.md`には現時点でその節が存在しないため、本計画では以下を品質管理手順として定義する（段階1固有）:

```bash
npx eslint --ext .js,.vue,.ts src tests   # vue-cli-service lint経由だと0.6節の理由で起動自体が失敗するため、直接呼ぶ
npx tsc --noEmit                          # 既存tsconfig.jsonでの型チェック（tests/**/*.tsが既にincludeされている）
npm run test:unit                         # Vitest
npm run test:e2e                          # Playwright（既存のビルド済みdocs/に対して実行。再ビルドはしない）
```

`npm run build`は0.6節で確認した理由(`vuetify-loader`のwebpack5非互換)により現在失敗するため、**段階1では実行しない**。`docs/`はリポジトリに既存のものをそのまま使い、再ビルドして差分の有無を確認する、という方法自体が取れない。

### 2.5 ブラウザでの動作確認手順

段階1は`src/`を一切変更しないため、動作確認の主目的は「テスト基盤の追加がアプリの挙動に影響していないこと」の確認である。

1. `npx serve docs -p 5000`でビルド済み`docs/`を配信する。
2. ブラウザで`http://127.0.0.1:5000`を開く。
3. 「通常攻撃」タブで、攻撃側に「アーク」、防御側に「ガーランド」等任意のユニットを選択する。期待結果: Lv・基本攻撃力内部値が自動入力され、右側の「計算結果」カードにダメージ範囲・期待値・ヒット率が表示される。
4. 「特殊能力」タブに切り替え、ユニットと特殊能力を選択する。期待結果: ダメージ範囲・期待値が表示される。
5. データ保存欄に任意の名前を入力して「保存」をクリックし、ページをリロードする。期待結果: 「保存したデータ」のドロップダウンに保存した名前が残っている。
6. ここまでの挙動が、段階1の変更前(`git stash`等で`.github/`・`tests/`・設定ファイルを一時的に外した状態)と完全に一致することを確認する（差異があれば、テスト基盤の追加がアプリに影響している=何か誤って`src/`やビルド設定を変更してしまっている可能性が高い）。
7. `npx playwright test`をローカルで実行し、2.3.2節の6シナリオがすべてPASSすることを確認する。

---

## 3. 段階2: Vue2.7のまま土台を整える（Vite移行・Options API化）

**ブランチ**: `migrate/vue3`を`master`から新規作成。

### 3.1 変更対象ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `package.json` | 変更 | Vue2.7へ上げる。`vue-cli-service`系・`vuetify-loader`・古いESLint/TS関連を削除。`vite`, `@vitejs/plugin-vue2`, 新しい`typescript`, 新しい`eslint`系, `vue-tsc`(3.0系固定)を追加。`scripts`を`"dev": "vite"`, `"build": "vite build"`, `"lint": "eslint ."`に書き換える（`serve`スクリプトは`vite`の開発サーバーに統合されるため削除してよい） |
| `vue.config.js` | 削除 | Vite移行により不要 |
| `babel.config.js` | 該当なし(元から存在しない) | - |
| `index.html`(リポジトリルート) | 新規 | Viteのエントリーポイント。`public/index.html`の内容を移植 |
| `public/index.html` | 削除 | `index.html`に統合 |
| `vite.config.ts` | 新規 | `@vitejs/plugin-vue2`、`@`エイリアス、`base: "./"`、`build.outDir: "docs"` |
| `tsconfig.json` | 変更 | `target`を上げる、`isolatedModules: true`追加、`vueCompilerOptions.target`は`2`のまま |
| `.eslintrc.js` | 削除 | Flat Configに移行 |
| `eslint.config.js` | 新規 | Flat Config |
| `.nvmrc` | 既存（段階1で作成済み） | 変更なし |
| `src/main.ts` | 変更 | 変更なし（`new Vue({ vuetify, render: h => h(App) }).$mount("#app")`はVue2.7でも有効。Vue3化は段階3） |
| `src/components/HelloWorld.vue` | 削除 | 未使用（`grep -r "HelloWorld" src/`でimport元が無いことを確認済み） |
| `src/components/**/*.vue`のうち`<script lang="ts">`がクラス構文のもの全て | 変更 | `defineComponent`によるOptions APIへ書き換え（3.4節のリストを参照） |
| `src/components/NormalAttack/Mixin.ts`, `src/components/AbilityAttack/Mixin.ts` | 変更 | クラス構文Mixin→Options APIオブジェクト形式のMixinへ書き換え |
| `agent-docs/adr/0002-pin-vite-to-7.md` | 新規 | 0.2節の判断を記録 |
| `.github/workflows/ci.yml` | 変更 | ビルドコマンドを一時ディレクトリ出力に変更し、`docs/`を書き換えないことを保証する手順を追加（3.6節） |
| `.gitignore` | 変更 | `/.ci-build`を追記（CI・ローカルでのビルド確認用の一時出力先。`docs/`を汚さないための退避先） |

クラス構文を使っているコンポーネント一覧（`grep -rl "extends Vue\|extends Mixins" src/components src/App.vue`で確認したファイル）:

```
src/App.vue
src/components/AppBar.vue
src/components/Contents.vue
src/components/NormalAttack.vue
src/components/AbilityAttack.vue
src/components/NormalAttack/InputData.vue
src/components/NormalAttack/InputData/InputDataForm.vue
src/components/NormalAttack/Description.vue
src/components/NormalAttack/Description/DescriptionUnitData.vue
src/components/NormalAttack/Result.vue
src/components/AbilityAttack/InputData.vue
src/components/AbilityAttack/InputData/InputDataForm.vue
src/components/AbilityAttack/Description.vue
src/components/AbilityAttack/Description/DescriptionUnitData.vue
src/components/Common/InputDataFormTextField.vue
src/components/NormalAttack/Mixin.ts
src/components/AbilityAttack/Mixin.ts
```

(`src/components/HelloWorld.vue`も同様のクラス構文だが、本計画で削除するため書き換え対象には含めない。)

### 3.2 ライブラリAPI（現在のバージョンでの正しい書き方）

#### Vue 2.7への更新

npm上の2.7系最終版は`2.7.16`(2023-12-24、"Swan Song"としてVue2本体最後のリリース)。出典: https://github.com/vuejs/vue/releases 、移行ガイド: https://v2.vuejs.org/v2/guide/migration-vue-2-7.html

```bash
npm install vue@2.7.16
npm uninstall vue-template-compiler vuetify-loader vue-class-component vue-property-decorator @vue/cli-service @vue/cli-plugin-eslint @vue/cli-plugin-typescript vue-cli-plugin-vuetify
```

Vue2.7は`defineComponent()`を組み込みで提供し、クラス構文の`Vue.extend()`より`this`の型推論が改善される（Options API化の効果を最大化するための前提条件）。

#### Vite + @vitejs/plugin-vue2

Vite本体は**7系の最新パッチに固定**（0.2節の判断、理由は3.5節のADR参照）。`npm view vite versions --json`で確認した2026年11月時点の7系最終パッチは`7.3.8`（`8.x`系は`@vitejs/plugin-vue2`が未対応のため使わない。0.2節参照）。実装時に同コマンドで新しいパッチが出ていないか再確認すること。

```bash
npm install -D vite@7.3.8 @vitejs/plugin-vue2@2.3.4
```

`@vitejs/plugin-vue2`の`peerDependencies`は`"vite": "^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"`、`"vue": "^2.7.0-0"`（出典: https://github.com/vitejs/vite-plugin-vue2 のpackage.json、2026年11月時点でリポジトリはアーカイブ済み・最新は`v2.3.4`）。Vue2.7への更新が前提条件になる。

`vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import vue2 from "@vitejs/plugin-vue2";
import path from "path";

export default defineConfig({
  base: "./",
  plugins: [vue2()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    outDir: "docs"
  }
});
```

出典: https://github.com/vitejs/vite-plugin-vue2 （基本設定例）

**レガシーTSデコレータについて**: 移行の途中、クラス構文のコンポーネントとOptions APIのコンポーネントが一時的に混在する期間がある。Vite 7系（esbuildベース）は`tsconfig.json`の`experimentalDecorators: true`を有効にしている限り、レガシーデコレータ構文をそのまま変換できる（出典: https://esbuild.github.io/content-types/ 、「If `experimentalDecorators` is enabled, esbuild will transform decorators using the legacy decorator behavior that TypeScript itself follows」）。`emitDecoratorMetadata`は未対応だが、本リポジトリの`tsconfig.json`はこのオプションを使っていないため問題にならない。したがって**クラス構文の書き換えとVite移行は、どちらを先にやってもビルドは通る**が、本計画では後述の3.4節の順序（Mixinを先に書き換え、各コンポーネントは1つずつ）を推奨する。

#### index.html（Vue CLIからの移植）

Viteではプロジェクトルート直下の`index.html`が起点になる（出典: https://vite.dev/guide/ 、「index.html is front-and-central instead of being tucked away inside public」）。現在の`public/index.html`の内容を次のように書き換えてルートに配置する:

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="icon" href="%BASE_URL%favicon.ico" />
    <title>アークザラッド2 ダメージ計算機(改)</title>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@mdi/font@7.x/css/materialdesignicons.min.css"
    />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`<%= BASE_URL %>`は`%BASE_URL%`に対応する（出典: https://vite.dev/guide/env-and-mode 、HTML定数置換機能）。`@mdi/font@latest`は`@mdi/font@7.x`のようにバージョンを固定する（CDNで`@latest`を使わないことが望ましいという一般的なプラクティス。段階3でVuetify4に上げる際に再度確認する）。`<noscript>`ブロックは任意だが、元の内容(`public/index.html`)をそのまま残してよい。

`favicon.ico`は`public/favicon.ico`から`public/favicon.ico`のまま維持してよい（Viteは`public/`ディレクトリの内容をそのままルートにコピーする仕様のため、`public/index.html`だけ削除し`public/favicon.ico`等は残す）。

#### Vuetify2 + Vite

Vuetify2公式ドキュメントにはViteでの構成方法の記載がない（出典: https://v2.vuetifyjs.com/en/getting-started/installation/ を確認したが、Vite関連の記載なし。ページ冒頭に「Vuetify 2 has reached EOL」と明記）。`vuetify-loader`はwebpack専用のため不要になる。CSSとアイコンフォントは直接importで対応する:

```typescript
// src/plugins/vuetify.ts
import Vue from "vue";
import Vuetify from "vuetify/lib";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true
  }
});
```

既存の`src/plugins/vuetify.ts`からの変更点は、`vuetify-loader`が自動で処理していたCSSの読み込みを明示的な`import`に変える点のみ。Options API化・Vite化を先に動かしてから、挙動がおかしい場合はVuetifyコンポーネントの自動importが働いていないことが原因である可能性が高いので、`vuetify/lib`からのフルインポート(`import Vuetify from "vuetify/lib"`は既にフルインポート)で問題ないか確認すること。

#### クラス構文 → Options API(`defineComponent`)の書き換え対応表

Vue2公式ドキュメント（https://v2.vuejs.org/v2/guide/typescript.html 、https://v2.vuejs.org/v2/guide/mixins.html ）に基づく対応:

| クラス構文(`vue-class-component`/`vue-property-decorator`) | Options API(`defineComponent`) |
|---|---|
| `@Component({ components: {...} }) export default class X extends Vue {}` | `export default defineComponent({ components: {...}, ... })` |
| `prop = value`（フィールド初期化） | `data() { return { prop: value }; }` |
| `method() {...}` | `methods: { method() {...} }` |
| `get prop() {...}` | `computed: { prop() {...} }` |
| `get prop() {...} / set prop(v) {...}`（getter/setter対） | `computed: { prop: { get() {...}, set(v) {...} } }` |
| `@Prop({ type: String, required: true, validator(v) {...} }) target!: string;` | `props: { target: { type: String, required: true, validator(v: string) {...} } }` |
| `@Watch("path", { deep: true, immediate: true }) onChange() {...}` | `watch: { path: { handler: "onChange", deep: true, immediate: true } }, methods: { onChange() {...} }` |
| `export class Mixin extends Vue { ... }` + 利用側`class X extends Mixins(Mixin) {}` | `export default { data() {...}, methods: {...}, watch: {...} }` + 利用側`defineComponent({ mixins: [Mixin], ... })` |

Mixinのマージ戦略（Vue2、出典: https://v2.vuejs.org/v2/guide/mixins.html ）: `data`は再帰的にマージされコンポーネント側が優先、ライフサイクルフックは配列化されMixin側が先に呼ばれる、メソッド等はコンポーネント側が優先。

**書き換え例（`src/components/NormalAttack/Mixin.ts`、実際の該当箇所: `src/components/NormalAttack/Mixin.ts:1-21`と`366-370`）**:

書き換え前（現状）:

```typescript
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import store from "./store";
// ...
@Component
export class Mixin extends Vue {
  privateState = {};
  sharedState = store.state;
  // ...
  updateDamageResult() { /* ... */ }

  @Watch("sharedState.unitData", { deep: true, immediate: true })
  onChangeUnitData() {
    this.updateDamageResult();
  }
}
```

書き換え後:

```typescript
import { defineComponent } from "vue";
import store from "./store";
// ...
export const Mixin = defineComponent({
  data() {
    return {
      privateState: {},
      sharedState: store.state,
      unitDataList,
      classDataList,
      unitNameList: [...unitDataList].map(value => value.name),
      initUnitLvList
    };
  },
  watch: {
    "sharedState.unitData": {
      handler: "onChangeUnitData",
      deep: true,
      immediate: true
    }
  },
  methods: {
    // initUnitData, swapUnitData, setXxx系メソッド群はそのまま methods 内に移す
    updateDamageResult() { /* 本体は変更しない */ },
    onChangeUnitData() {
      this.updateDamageResult();
    }
  }
});
```

利用側（例: `src/components/NormalAttack/InputData.vue`）:

```typescript
// 書き換え前
import { Component, Mixins } from "vue-property-decorator";
import { Mixin } from "./Mixin";

@Component({ components: { InputDataForm } })
export default class InputData extends Mixins(Mixin) { /* ... */ }
```

```typescript
// 書き換え後
import { defineComponent } from "vue";
import { Mixin } from "./Mixin";

export default defineComponent({
  mixins: [Mixin],
  components: { InputDataForm },
  data() { /* normalAttack, selectedData, dataName, snackbarText, snackbar, damage */ },
  methods: { /* saveData, loadData, deleteData */ },
  computed: { /* skillPattern, possibilityDamage, minDamage, maxDamage, expected, guard, guardActual, dodge, hit, damageProbabilityMessage */ }
});
```

`AbilityAttack/Mixin.ts`も同じ対応表に従って書き換える（`abilityList`は`get`付きcomputedなので`computed: { abilityList() {...} }`に対応）。

**`InputDataForm.vue`の`@Prop`書き換え例**（実際の該当箇所: `src/components/NormalAttack/InputData/InputDataForm.vue:390-397`）:

```typescript
// 書き換え前
@Prop({
  type: String,
  required: true,
  validator(value) {
    return ["attack", "defense"].indexOf(value) !== -1;
  }
})
target!: string;
```

```typescript
// 書き換え後
props: {
  target: {
    type: String,
    required: true,
    validator(value: string) {
      return ["attack", "defense"].indexOf(value) !== -1;
    }
  }
}
```

### 3.3 TypeScript / ESLint設定

#### tsconfig.json

Viteは`tsconfig.json`の`target`を無視し、構文ターゲットは`build.target`(Vite側)で管理する（出典: https://vite.dev/guide/features.html#typescript ）。`isolatedModules: true`を追加することが公式に強く推奨されている（Oxc/esbuildベースのトランスフォーマは型情報を使わない変換のみ行うため）。

```jsonc
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "importHelpers": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,
    "sourceMap": true,
    "baseUrl": ".",
    "types": ["vite/client", "vuetify"],
    "paths": {
      "@/*": ["src/*"]
    },
    "lib": ["esnext", "dom", "dom.iterable"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "tests/**/*.ts", "tests/**/*.tsx"],
  "exclude": ["node_modules"],
  "vueCompilerOptions": {
    "target": 2
  }
}
```

`experimentalDecorators`は、全コンポーネントのOptions API化が完了した時点で削除する（削除し忘れても害はないが、削除してビルド・型チェックが通ることを移行完了の確認項目の1つにする）。`moduleResolution: "bundler"`はVite公式テンプレート(`create-vite`のVue-TSテンプレート)で広く使われている値だが、本調査ではVite公式ドキュメント本文での明示を確認できなかった。実装時に`vue-tsc --noEmit`でエラーが出る場合は`"node"` / `"node16"`との違いを個別に確認すること。

`vue-tsc`は、0.3節の判断により**`3.0.11`に固定**してインストールする（Vue2サポートが残る3.0系の最終パッチ。実装時に`npm view vue-tsc versions --json`で変化がないか再確認すること）。

#### eslint.config.js（Flat Config）

ESLint本体は`v10.0.0`(2026-02)で`.eslintrc.*`形式を完全に廃止した（出典: https://eslint.org/docs/latest/use/migrate-to-10.0.0 ）。`@vue/eslint-config-typescript`公式ドキュメントの`defineConfigWithVueTs`ヘルパーを使う:

```javascript
// eslint.config.js
import { globalIgnores } from "eslint/config";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"]
  },
  globalIgnores(["**/docs/**", "**/dist/**", "**/coverage/**"]),
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  skipFormatting
);
```

各パッケージを`npm view <package> version`で確認し最新化すること（調査時点: `eslint-plugin-vue@10.x`, `@typescript-eslint/eslint-plugin@8.x`, `@typescript-eslint/parser@8.x`, `@vue/eslint-config-typescript@14.x`, `@vue/eslint-config-prettier@10.x`）。出典: https://eslint.vuejs.org/user-guide/

`package.json`の`"lint"`スクリプトは`vue-cli-service lint`から`eslint .`に変更する（3.1節参照。`vue-cli-service`自体を削除するため。自動修正したい場合はローカルで`eslint . --fix`を個別に実行する。CI上の`lint`は検出のみで自動修正はしない）。

### 3.4 Options API化の進め方

Issue本文User Story 17「移行の途中（段階2）でも、クラス構文からOptions APIへの書き換えを1コンポーネントずつE2Eが通る状態で進められるようにしたい」に従い、次の順序で進める（依存関係の下流から上流へ、Mixinを先に書き換える）:

1. `src/components/NormalAttack/Mixin.ts`, `src/components/AbilityAttack/Mixin.ts`（他の全コンポーネントが依存するため最初）
2. `src/components/Common/InputDataFormTextField.vue`（末端の子コンポーネント）
3. `src/components/NormalAttack/InputData/InputDataForm.vue`, `src/components/AbilityAttack/InputData/InputDataForm.vue`
4. `src/components/NormalAttack/Description/DescriptionUnitData.vue`, `src/components/AbilityAttack/Description/DescriptionUnitData.vue`
5. `src/components/NormalAttack/InputData.vue`, `src/components/NormalAttack/Description.vue`, `src/components/NormalAttack/Result.vue`, `src/components/AbilityAttack/InputData.vue`, `src/components/AbilityAttack/Description.vue`
6. `src/components/NormalAttack.vue`, `src/components/AbilityAttack.vue`
7. `src/components/AppBar.vue`, `src/components/Contents.vue`
8. `src/App.vue`

各ステップ後に`npm run test:e2e`（段階1で作成済みのPlaywrightテスト）を実行し、全シナリオがPASSすることを確認してから次のコンポーネントに進む。1コンポーネントごとに小さいPRに分けてもよいし、`migrate/vue3`ブランチへの直接コミットの積み重ねでもよい（Issueは「統合ブランチで進める」とのみ指定しており、PR単位は指定していない）。

### 3.5 ADRの追加

`agent-docs/adr/0002-pin-vite-to-7.md`を新規作成し、ADR-0001と同じフォーマット（`status: accepted`のフロントマター、タイトル、本文、Considered Options、Consequences）で、0.2節の内容（`@vitejs/plugin-vue2`のpeerDependencies制約とOxcのデコレータサポート未確定を理由にVite7系へ固定する）を記録すること。

### 3.6 CI/E2Eが`docs/`を書き換えないための設定

Issue本文User Story 18「移行中のCIとE2Eが`docs/`を書き換えないでほしい」に対応する。`.github/workflows/ci.yml`のビルドステップを次のように、一時ディレクトリへ出力してから検証する形に変更する:

```yaml
- name: Build (migration branch, does not touch docs/)
  run: npm run build -- --outDir .ci-build
- name: Serve temporary build for E2E
  run: npx serve .ci-build -p 5000 -n &
```

もしくは`playwright.config.ts`の`webServer.command`を`"npm run build -- --outDir .ci-build && npx serve .ci-build -p 5000 -n"`のように変更し、ビルド出力先を固定の`docs/`から外す。段階2・段階3の作業中は、リポジトリの`docs/`配下は常にmasterの最新ビルド（段階1の時点のもの）のままにしておき、`git status`で`docs/`に差分が出ないことをCIで確認するステップ（例: `git diff --exit-code docs/`）を追加することを推奨する。

### 3.7 テスト方針

段階1で作成したVitest/Playwrightのテストコード自体は**変更しない**（Issue本文Testing Decisions「移行でコンポーネントの書き方が全部変わっても、テストは書き換えずに通り続けなければならない」）。段階2の完了条件は、3.1節の全変更を終えた状態で、段階1のテストが一切の修正なしに全てPASSすることである。

`tests/unit/calc.spec.ts`は`src/util/calc.ts`自体を変更しないため無修正でPASSするはず。`tests/e2e/*.spec.ts`は、Vite移行・Options API化・ビルドツール変更の影響でUIの挙動が変わっていないかを検証する主な安全網になる。

### 3.8 品質管理の実行手順

```bash
npx eslint .                          # Flat Config
npx vue-tsc --noEmit                  # 3.0系に固定したバージョンで型チェック
npm run test:unit
npm run build -- --outDir .ci-build   # docs/を汚さないビルド確認
npx serve .ci-build -p 5000 -n &
npm run test:e2e
```

### 3.9 ブラウザでの動作確認手順

1. `npm run build -- --outDir .ci-build`でビルドする。
2. `npx serve .ci-build -p 5000`で配信し、ブラウザで`http://127.0.0.1:5000`を開く。
3. 2.5節の手順1〜5と同じ操作を行い、ダメージ計算・ユニット選択時の自動入力・保存/読込・ダークモード切替・タブ切替・入れ替え/リセットボタンのすべてが段階1時点の挙動と一致することを目視確認する。
4. ブラウザのDevToolsのConsoleタブを開き、エラー・警告が出ていないことを確認する（特に、Options API化の過程で`this`の参照先を誤ると`undefined`系のエラーが出やすい）。
5. `npm run test:e2e`を実行し、全シナリオがPASSすることを確認する。

---

## 4. 段階3: Vue3・Vuetify4への移行

**ブランチ**: `migrate/vue3`（継続）。この段階の完了時にのみ`docs/`を更新し`master`へマージする。

### 4.1 変更対象ファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `package.json` | 変更 | `vue@^3`, `vuetify@^4`, `vite-plugin-vuetify`を追加。`@vitejs/plugin-vue2`を`@vitejs/plugin-vue`に差し替え |
| `vite.config.ts` | 変更 | `@vitejs/plugin-vue2`→`@vitejs/plugin-vue` + `vite-plugin-vuetify` |
| `src/main.ts` | 変更 | `createApp(App).use(vuetify).mount("#app")` |
| `src/plugins/vuetify.ts` | 変更 | `createVuetify()`、テーマ設定を`defaultTheme`形式に |
| `index.html` | 変更 | `@mdi/font`のCDNリンクをバージョン固定、または npm化 |
| `src/App.vue` | 変更 | `v-content` → `v-main` |
| `src/components/Contents.vue` | 変更 | `v-tab-item` → `v-window` + `v-window-item` |
| `src/components/NormalAttack.vue`, `src/components/AbilityAttack.vue` | 変更 | `v-expansion-panel-header` → `v-expansion-panel-title`、`v-expansion-panel-content` → `v-expansion-panel-text` |
| `src/components/NormalAttack/InputData/InputDataForm.vue`, `src/components/AbilityAttack/InputData/InputDataForm.vue` | 変更 | `v-subheader` → `v-list-subheader`、`v-slot:activator="{ on }"` → `{ props }`、`item-text` → `item-title`（`v-select`/`v-autocomplete`、両ファイルに7箇所ずつ、`grep -n "item-text=" <file>`で実測） |
| `src/components/Common/InputDataFormTextField.vue` | 変更 | `v-slot:activator="{ on }"` → `{ props }` |
| `src/components/NormalAttack/Description.vue` | 変更 | `v-simple-table` → `v-table` |
| `src/components/NormalAttack/Description/DescriptionUnitData.vue`, `src/components/AbilityAttack/Description/DescriptionUnitData.vue` | 変更 | `v-list-item-content`廃止に伴うマークアップ変更（212箇所、4.3節参照） |
| `src/components/NormalAttack/InputData.vue`, `src/components/AbilityAttack/InputData.vue` | 変更 | `item-text` → `item-title`（`v-autocomplete`、保存データ選択の1箇所ずつ） |
| `eslint.config.js` | 変更 | `eslint-plugin-vuetify`の`flat/base`を追加（破壊的変更の自動検出） |
| `tsconfig.json` | 変更 | `vueCompilerOptions.target`を`3`に |
| `agent-docs/adr/0003-adopt-vuetify4-instead-of-3.md` | 新規 | 0.1節の判断を記録 |
| GitHub Issue #46 | コメント追加 | Vuetify4を対象にした旨と理由を記録（実装後に実施） |

### 4.2 ライブラリAPI

#### Vue3

最新安定版は`npm view vue version`で確認すること（調査時点`3.5.x`系）。`createApp`の書き方は導入時から変化していない。

```typescript
// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";

createApp(App).use(vuetify).mount("#app");
```

出典: https://vuejs.org/guide/quick-start.html 、https://vuejs.org/guide/essentials/application.html

#### Vuetify4 + Vite

```bash
npm install vuetify@^4 vite-plugin-vuetify@latest @vitejs/plugin-vue@latest
npm uninstall @vitejs/plugin-vue2
```

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import path from "path";

export default defineConfig({
  base: "./",
  plugins: [
    vue({ template: { transformAssetUrls } }),
    vuetify({ autoImport: true })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    outDir: "docs"
  }
});
```

```typescript
// src/plugins/vuetify.ts
import { createVuetify } from "vuetify";

export default createVuetify({
  theme: {
    defaultTheme: "dark"
  },
  icons: {
    defaultSet: "mdi"
  }
});
```

出典: https://github.com/vuetifyjs/vuetify/releases （バージョン確認）、`createVuetify`/`vite-plugin-vuetify`の基本構成はVuetify公式ブログ・インストールガイドのパターンに基づく（Vuetify公式サイトはSPAのためWebFetchで本文取得不可だったが、`npm create vuetify@latest`のスキャフォールド構成として広く確認されている形）。実装時に`npm create vuetify@latest`を**別の空ディレクトリで一度実行し**、生成された`vite.config.ts`・`src/plugins/vuetify.ts`の実際の内容を一次情報として突き合わせることを推奨する。

Vuetify4はv3からの「intentionally minimal」な変更のため、4.3節の対応表は実質的にv2→v3の対応表である（v3→v4で追加の書き換えはほぼ発生しない想定）。実装中にv3→v4特有の破壊的変更に遭遇した場合は、`eslint-plugin-vuetify`の`no-deprecated-*`ルール群（4.4節）で検出し、本計画にない変更として対応すること。

#### テーマのランタイム切り替え

Vuetify2の`$vuetify.theme.dark`への直接バインドはVuetify3/4には存在しない。`useTheme()`composableを使う。Options APIコンポーネントから使うには`setup()`の戻り値経由でアクセスする:

```typescript
// src/components/AppBar.vue (書き換え後、該当箇所: 現状の<v-switch v-model="$vuetify.theme.dark">)
import { defineComponent } from "vue";
import { useTheme } from "vuetify";

export default defineComponent({
  setup() {
    const theme = useTheme();
    return { theme };
  },
  data() {
    return { dialog: false };
  },
  computed: {
    isDarkTheme: {
      get(): boolean {
        return this.theme.global.name.value === "dark";
      },
      set(value: boolean) {
        this.theme.global.name.value = value ? "dark" : "light";
      }
    }
  }
});
```

```html
<!-- v-model="$vuetify.theme.dark" を v-model="isDarkTheme" に変更 -->
<v-switch v-model="isDarkTheme" hide-details inset label="ダークモード"></v-switch>
```

出典: Vuetify公式リポジトリのテーマドキュメント(`packages/docs/src/pages/en/features/theme.md`、`useTheme()`の基本的な使い方)、`<script setup>`形式の公式サンプルが中心のため、上記Options API版の`setup()`経由のラップはVue3公式の「`setup()`の戻り値は`this`経由でアクセス可能」という一般原則(https://vuejs.org/api/options-composition.html#setup )に基づく組み立てである点に注意（Vuetify公式がOptions API向けの完全なサンプルを提供しているわけではない）。

### 4.3 Vuetifyコンポーネントの破壊的変更対応表

Vuetify公式のv2→v3アップグレードガイド（出典: https://github.com/vuetifyjs/vuetify/blob/master/packages/docs/src/pages/en/getting-started/upgrade-guide.md のv2→v3時代の版、コミットSHA`64a52d4f0f51f8b65c4f2014cac2ac74d636e7b0`時点）に基づく。本リポジトリで実際に使われているコンポーネントのみ抜粋:

| Vuetify2 | Vuetify3/4 | 本リポジトリでの出現箇所 |
|---|---|---|
| `v-content` | `v-main`（`v-app`直下に配置） | `src/App.vue` |
| `v-list-item-content` | 廃止。`v-list-item`直下に直接マークアップを置くか、`title`/`subtitle`スロットを使う | `src/components/NormalAttack/Description/DescriptionUnitData.vue`, `src/components/AbilityAttack/Description/DescriptionUnitData.vue`（計212箇所、`grep -ro "v-list-item-content" src/components \| wc -l`で実測） |
| `v-subheader` | `v-list-subheader` | 両`InputDataForm.vue` |
| `v-tab-item` | 廃止。`v-window` + `v-window-item` | `src/components/Contents.vue` |
| `v-expansion-panel-header` | `v-expansion-panel-title` | `src/components/NormalAttack.vue`, `src/components/AbilityAttack.vue` |
| `v-expansion-panel-content` | `v-expansion-panel-text` | 同上 |
| `v-simple-table` | `v-table` | `src/components/NormalAttack/Description.vue` |
| `v-slot:activator="{ on }"` + `v-on="on"` | `v-slot:activator="{ props }"` + `v-bind="props"` | 両`InputDataForm.vue`、`src/components/Common/InputDataFormTextField.vue` |
| `item-text="name"`（`v-autocomplete`/`v-select`） | `item-title="name"` | 両`InputData.vue`、両`InputDataForm.vue` |

出典: https://github.com/vuetifyjs/vuetify/blob/master/packages/docs/src/pages/en/getting-started/upgrade-guide.md （該当コミット時点）

**`v-list-item-content`の書き換え例**（実際の該当箇所: `src/components/NormalAttack/Description/DescriptionUnitData.vue:9-14`）:

書き換え前:

```html
<v-list-item>
  <v-list-item-content>ユニット名</v-list-item-content>
  <v-list-item-content class="align-end">{{ unitData.name }}</v-list-item-content>
</v-list-item>
```

書き換え後:

```html
<v-list-item>
  <div>ユニット名</div>
  <div class="text-right">{{ unitData.name }}</div>
</v-list-item>
```

`v-list-item-content`はCSS Gridによる左右2カラムレイアウトを担っていたため、単純な`<div>`2つへの置換では横並びレイアウトが崩れる可能性がある。実際に置き換えたあとブラウザで必ず見た目を確認し、崩れる場合は`v-list-item`に`class="d-flex justify-space-between"`を付けるなどのCSS調整を加えること（見た目の細かな差はIssue本文で許容されているが、左右の値がラベルと分離できないほど崩れるのは機能面の劣化なので許容しない）。

**`v-tab-item`の書き換え例**（実際の該当箇所: `src/components/Contents.vue`、Exploreエージェントの調査で確認した構造）:

書き換え前:

```html
<v-tabs v-model="tab" class="px-2 py-1">
  <v-tab class="mr-3">通常攻撃</v-tab>
  <v-tab class="mr-3">特殊能力</v-tab>
  <v-tab-item :key="0"><normal-attack /></v-tab-item>
  <v-tab-item :key="1"><ability-attack /></v-tab-item>
</v-tabs>
```

書き換え後:

```html
<v-tabs v-model="tab" class="px-2 py-1">
  <v-tab class="mr-3">通常攻撃</v-tab>
  <v-tab class="mr-3">特殊能力</v-tab>
</v-tabs>
<v-window v-model="tab">
  <v-window-item :key="0"><normal-attack /></v-window-item>
  <v-window-item :key="1"><ability-attack /></v-window-item>
</v-window>
```

### 4.4 自動検出の活用（手作業の見落とし対策）

本計画の4.3節は手作業で一次ドキュメントを突き合わせて作った一覧であり、網羅性を機械的に保証できていない。実装時は`eslint-plugin-vuetify`を導入し、`no-deprecated-components`, `no-deprecated-props`, `no-deprecated-events`, `no-deprecated-slots`, `no-deprecated-classes`, `no-deprecated-imports`ルールで検出漏れがないか確認すること:

```bash
npm install -D eslint-plugin-vuetify@latest
```

```javascript
// eslint.config.js に追加
import vuetify from "eslint-plugin-vuetify";
// ...
export default defineConfigWithVueTs(
  // ...既存の設定...
  ...vuetify.configs["flat/base"]
);
```

多くのルールは`eslint --fix`で自動修正できる（出典: https://github.com/vuetifyjs/eslint-plugin-vuetify ）。4.3節の手作業対応表はこのESLintルールで指摘される問題の大部分を事前に解消しておくためのものであり、**最終的な正しさの判定はこのESLintルール + `vue-tsc`の型チェック + E2Eテストの3つで行う**こと。

### 4.5 Mixinの挙動変化への対応

Vue3公式Migration Guide（https://v3-migration.vuejs.org/breaking-changes/ 、https://v3-migration.vuejs.org/breaking-changes/data-option ）によると、Mixinの`data()`マージ戦略がVue2の「深いマージ」からVue3の「浅いマージ」に変わる。本リポジトリの`Mixin.ts`は`sharedState`, `unitDataList`等のトップレベルプロパティのみを返し、利用側コンポーネントの`data()`と同名のネストしたオブジェクトを返していないため、**この破壊的変更の影響は受けないと判断できる**。ただし実装時にVue3化した直後の`npm run test:e2e`で予期しない`undefined`エラーが出た場合、この変更が原因である可能性を優先して疑うこと。

ライフサイクルフック名も一部変わる（`destroyed`→`unmounted`、`beforeDestroy`→`beforeUnmount`）。本リポジトリのコンポーネント・Mixinは`mounted`のみ使用しており(`InputData.vue`の`mounted() {...}`、localStorage読み込み)、`destroyed`/`beforeDestroy`は使っていない（`grep -rn "destroyed\|beforeDestroy" src/`で確認すること）。

### 4.6 TypeScript

`vue-tsc`を最新版に追従してよい（出典: Vue3では`vue-tsc`最新がそのまま使える。調査時点で`v3.3.x`系、TypeScript 5.0以上要求）。`tsconfig.json`の`vueCompilerOptions.target`を`2`から`3`に変更する。

### 4.7 テスト方針

段階2と同様、段階1で作成したVitest/Playwrightのテストコードは**変更しない**。`tests/unit/calc.spec.ts`は`calc.ts`自体を変更しないため無修正でPASSするはず。`tests/e2e/*.spec.ts`は、Vuetify4移行によるDOM構造変化（特に4.3節の各種リネーム）が実際のユーザー操作・表示に影響していないかを検証する最後の安全網になる。段階3の完了条件は、4.1節の全変更後に段階1のE2E・単体テストが無修正で全てPASSすることである。

### 4.8 品質管理の実行手順

```bash
npx eslint .                          # eslint-plugin-vuetifyのno-deprecated-*ルールを含む
npx vue-tsc --noEmit                  # 最新版で型チェック
npm run test:unit
npm run build -- --outDir .ci-build
npx serve .ci-build -p 5000 -n &
npm run test:e2e
```

全てPASSした後、初めて`npm run build`（出力先を`docs/`のまま）を実行し、`docs/`を更新する。

### 4.9 ブラウザでの動作確認手順

1. `npm run build -- --outDir .ci-build`でビルドする。
2. `npx serve .ci-build -p 5000`で配信し、ブラウザで`http://127.0.0.1:5000`を開く。DevToolsのConsoleでエラーが出ていないことを確認する。
3. 「通常攻撃」タブ・「特殊能力」タブの切り替えが`v-window`で正しく動作することを確認する（タブの内容が正しく切り替わり、他方の内容が残っていないこと）。
4. 「データ入力」「データ詳細」の`v-expansion-panels`展開/折りたたみが正しく動作することを確認する。
5. 「データ詳細」タブでユニット情報の表(`v-list-item`群)が、ラベルと値が左右に正しく分かれて表示されていることを目視確認する（4.3節の`v-list-item-content`廃止によるレイアウト崩れがないか）。
6. 「データ詳細」の通常攻撃ダメージ表(`v-table`、旧`v-simple-table`)が正しく表形式で表示されることを確認する。
7. ダークモードスイッチを切り替え、テーマがリアクティブに切り替わることを確認する(4.2節の`useTheme()`対応)。
8. ツールチップ(スレイヤー装備・ガード装備・クリティカル等の`v-tooltip`)がホバー時に正しく表示されることを確認する(`{ on }` → `{ props }`変更箇所)。
9. 2.5節・3.9節と同じ一連の操作（ユニット選択→自動入力→ダメージ表示、保存/読込、入れ替え/リセット）を行い、段階1時点の挙動と一致することを確認する。
10. `npm run test:e2e`を実行し、全シナリオがPASSすることを確認する。
11. 全て確認できたら`npm run build`を`docs/`出力で実行し、`git diff docs/`で意図した差分のみであることを確認してコミットする。`migrate/vue3`を`master`にマージする（Issue本文: 公開はこの1回だけ）。

---

## 5. 全段階共通: 完了条件チェックリスト

実装を終える前に、各段階ごとに以下を確認すること。

### 段階1完了条件
- [ ] `.npmrc`追加後、`npm ci`がクリーンな環境で成功する
- [ ] `npx eslint --ext .js,.vue,.ts src tests`, `npx tsc --noEmit`, `npm run test:unit`, `npm run test:e2e`が全てPASSする
- [ ] `src/`・`vue.config.js`・`public/index.html`等ビルド設定に変更がない（`git diff master -- src/ vue.config.js public/`が空）
- [ ] `.github/workflows/ci.yml`がPRとmaster pushの両方でトリガーされ、全ジョブが成功する
- [ ] `master`へマージ済み

### 段階2完了条件
- [ ] クラス構文(`vue-class-component`/`vue-property-decorator`)への依存が`package.json`から削除されている
- [ ] 3.1節の全コンポーネント・Mixinが`defineComponent`によるOptions APIに書き換わっている
- [ ] `HelloWorld.vue`が削除されている
- [ ] `npm run dev`（Viteの開発サーバー）でローカル動作確認ができる
- [ ] `npm ci`と`npm run build`が警告回避フラグなしで通る（`vue-cli-service`関連の依存が無くなり、0.6節の問題が解消していることを含む）
- [ ] `.npmrc`の`legacy-peer-deps=true`が不要になっていないか確認する（古い`@typescript-eslint`系パッケージを削除した後は、素の`npm ci`が通るか試す。通るなら`.npmrc`を削除する。通らないなら残す理由を明記する）
- [ ] 段階1のテスト(`tests/unit`, `tests/e2e`)が無修正で全てPASSする
- [ ] `agent-docs/adr/0002-pin-vite-to-7.md`が作成されている
- [ ] CI上のビルド・E2Eが`docs/`を書き換えていない

### 段階3完了条件
- [ ] `vue`が3系、`vuetify`が4系になっている
- [ ] 4.3節の全破壊的変更が解消され、`eslint-plugin-vuetify`の`no-deprecated-*`ルールで指摘がゼロになっている
- [ ] 段階1のテスト(`tests/unit`, `tests/e2e`)が無修正で全てPASSする
- [ ] `docs/`が段階3完了時点のビルド結果で1回だけ更新されている
- [ ] `agent-docs/adr/0003-adopt-vuetify4-instead-of-3.md`が作成されている
- [ ] GitHub Issue #46に、Vuetify4を対象にした旨のコメントが追加されている
- [ ] `migrate/vue3`が`master`に一度だけマージされている

## 6. 未確認事項（実装時に再確認すること）

一次情報調査で確証を取れなかった事項を列挙する。実装前に実際のコマンド実行で確認すること。

1. Vite 7系がNode24系を公式に明示サポートしているか（本調査ではVite公式ドキュメントに明言を確認できなかった。動作上は問題ないと見込まれる）。
2. Vite 8のOxcトランスフォーマでのレガシーTSデコレータの正確な設定キー名（段階2でVite7系に固定するため、本計画では直接の影響はない。将来Vite8へ上げる際に再調査すること）。
3. `moduleResolution: "bundler"`がVite公式ドキュメント上で明示的に推奨されているか（`create-vite`のテンプレートでの実例に基づく推測）。
4. Vuetify4のインストール手順の詳細（Vuetify公式サイトがSPAでWebFetch不可だったため、`npm create vuetify@latest`を実際に実行して生成物を確認することを推奨、と4.2節に記載済み）。

（`vue-tsc`のVue2対応最終バージョンは本レビューで`3.0.11`と確認済み。0.3節・3.3節を参照。）
