---
status: accepted
---

# Vuetify 3 ではなく Vuetify 4 に移行する

#46 は移行先を Vuetify 3 としていたが、これは Issue を書いた時点で Vuetify 3 が最新だったためである。その後 Vuetify 3 は `3.13.0`（2026-07）で新機能の追加を終え、2027-07 までバグ修正だけの LTS になり、開発の中心は Vuetify 4 に移った。Vuetify は 3 から 4 への変更を小さく抑えており、この移行で書き換える対象（`v-list-item-content` の廃止、`v-tab-item` から `v-window-item` へなど）はどれも 2 から 3 で入った変更で、4 にしても書き換えはほとんど増えない。そのため、段階3では Vuetify 4 に移行する。#46 と段階3の Issue にある「Vuetify 3」は Vuetify 4 と読み替える。

## Considered Options

- **Vuetify 4 に移行する（採用）**: 書き換えの量は 3 とほぼ同じで、移行の直後から開発が続いている版に乗れる。
- **Vuetify 3 に移行する（不採用）**: 2027-07 にサポートが終わるため、移行を終えてすぐ 4 への移行がまた必要になる。

## Consequences

Vuetify 4 で名前の変わったタイポグラフィのクラス（`text-h5` から `text-headline-medium` など）も使う必要がある。2 から 3 の変更とあわせ、3 から 4 の変更も `eslint-plugin-vuetify` の `flat/recommended-v4` で検出する。
