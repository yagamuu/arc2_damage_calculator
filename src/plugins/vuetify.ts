import Vue from "vue";
// vuetify/lib（必要なコンポーネントだけを取り込む版）は vuetify-loader（webpack 専用）と、
// Vuetify 2 の古い Sass を今の Sass でコンパイルすることを前提にしている。
// Vite ではそれを避け、コンパイル済みの全体版と CSS を読み込む（独自の Sass 変数は使っていない）
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true
  }
});
