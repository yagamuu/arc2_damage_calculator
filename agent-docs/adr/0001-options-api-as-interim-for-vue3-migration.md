---
status: accepted
---

# Vue 3 移行ではいったん Options API にし、Mixin と Store を残す

Vue 2（`vue-class-component` / `vue-property-decorator` のクラス構文）から Vue 3 へ移行するとき、コンポーネントは Composition API（`<script setup>`）ではなく Options API（`defineComponent`）に書き換え、Mixin（`NormalAttack/Mixin.ts`、`AbilityAttack/Mixin.ts`）と自前の Store はそのまま残す。`<script setup>` では Mixin が使えないため、一度で最終形にすると移行と Mixin・Store の作り直しが同時に起き、動作を変えていないことをテストで確かめながら進められなくなる。移行の範囲を「動作を変えない書き換え」に限り、Composition API への書き換えは、のちに Mixin と Store を廃止するときに行う。

## Considered Options

- **Options API に書き換え、Mixin と Store を残す（採用）**: クラス構文からほぼ機械的に移せる。コンポーネントを2回書き換えることになるが、1回あたりの変更は小さい。
- **`<script setup>` で一度に最終形にする（不採用）**: 書き換えは1回で済むが、Mixin を composable に作り直す作業が移行に含まれ、変更が一度に大きくなる。

## Consequences

移行直後のコードには、Vue 3 ではあまり使われない Mixin が残る。これは意図したものなので、「Vue 3 らしくない」という理由だけで移行中に Composition API へ書き換えないこと。
