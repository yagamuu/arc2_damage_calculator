# arc2_damage_calculator
アークザラッド2のダメージを算出する計算機です。  
アークザラッド２データベースのダメージ計算機を元に、自動パラメーター計算や各種入力補助、データ保存などの機能を追加しています。

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
公開用のビルドを `docs/`（GitHub Pages の公開物）に出力します。
```
npm run build
```

`docs/` を書き換えずにビルドを確かめるときは、git の管理対象外の `.ci-build/` に出力します。
```
npm run build:temp
```

### Lints files
```
npm run lint
```

### Run unit tests
```
npm test
```

### Run E2E tests
Chromium で画面を操作します。初回のみブラウザのインストールが必要です。
```
npx playwright install chromium
npm run test:e2e:build   # .ci-build/ にビルドし、それに対して実行する
npm run test:e2e         # コミット済みの docs/ に対して実行する
```

## Credits
各種データ元: [アークザラッド２データベース(ありのす様)](http://arinosu.ari-jigoku.com/arc2/)