# arc2_damage_calculator
アークザラッド2のダメージを算出する計算機です。  
アークザラッド２データベースのダメージ計算機を元に、自動パラメーター計算や各種入力補助、データ保存などの機能を追加しています。

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Run unit tests
```
npm test
```

### Run E2E tests
ビルド済みの `docs/` を配信し、Chromium で操作します。初回のみブラウザのインストールが必要です。
```
npx playwright install chromium
npm run test:e2e
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Credits
各種データ元: [アークザラッド２データベース(ありのす様)](http://arinosu.ari-jigoku.com/arc2/)