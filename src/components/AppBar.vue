<template>
  <v-app-bar absolute>
    <!-- Vuetify 2 では画面上部に固定せず、ページと一緒にスクロールしていたため absolute にする -->
    <v-toolbar-title>アークザラッド2 ダメージ計算機(改)</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-switch
      v-model="isDarkTheme"
      class="flex-grow-0"
      hide-details
      inset
      label="ダークモード"
    ></v-switch>
    <v-btn
      color="primary"
      variant="elevated"
      @click.stop="dialog = true"
      class="ml-3"
    >
      クレジット
    </v-btn>
    <v-dialog v-model="dialog" max-width="640">
      <v-card>
        <v-card-title class="text-headline-medium">クレジット</v-card-title>

        <v-card-text>
          <p>
            各種データ元:
            <a
              href="http://arinosu.ari-jigoku.com/arc2/index.html"
              target="_blank"
              rel="noopener"
              >アークザラッド２データベース</a
            >(ありのす様)
          </p>
          計算機制作:
          <a href="https://twitter.com/yagamuu" target="_blank" rel="noopener"
            >@yagamuu</a
          >
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green-darken-1" variant="text" @click="dialog = false">
            閉じる
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useTheme } from "vuetify";

export default defineComponent({
  components: {},
  // Vuetify 3 以降はテーマを $vuetify から切り替えられず、composable の useTheme() を使う
  setup() {
    return { theme: useTheme() };
  },
  data() {
    return {
      dialog: false
    };
  },
  computed: {
    isDarkTheme: {
      get(): boolean {
        return this.theme.global.name.value === "dark";
      },
      set(value: boolean) {
        this.theme.change(value ? "dark" : "light");
      }
    }
  }
});
</script>
