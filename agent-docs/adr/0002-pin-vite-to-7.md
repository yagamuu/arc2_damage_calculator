---
status: accepted
---

# 移行中は Vite を 7 系に固定する

Vue 2.7 を Vite で動かすには `@vitejs/plugin-vue2` が必要だが、このプラグインのリポジトリは 2025-10 にアーカイブされ、最終版 `2.3.4` の `peerDependencies` は `"vite": "^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"` で Vite 8 を含まない。また Vite 8 は TypeScript の変換を esbuild から Oxc に替えており、移行の途中で残るクラス構文のコンポーネントが使うレガシーデコレータ（`experimentalDecorators`）の扱いが Vite 7 と同じである保証がない。そのため、Vue 2.7 で動かしている間（#46 の段階2）は Vite を 7 系に固定する（`package.json` は `^7.x`）。

## Considered Options

- **Vite 7 系に固定する（採用）**: `@vitejs/plugin-vue2` の対応範囲に収まり、esbuild がレガシーデコレータを TypeScript と同じ動作で変換する。
- **Vite 8 に上げる（不採用）**: peer 依存の範囲外で動かすことになり、デコレータの変換が変わった場合にクラス構文のコンポーネントが壊れても、原因の切り分けが難しい。

## Consequences

Vite 8 以降の機能や修正は、段階2の間は取り込まない。Vue 3 に上げて `@vitejs/plugin-vue2` が不要になり、クラス構文もなくなった時点（段階3）で、Vite のメジャーバージョンを上げてよい。
