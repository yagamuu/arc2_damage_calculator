<template>
  <v-app-bar>
    <v-toolbar-title>アークザラッド2 RTA用ダメージ計算機</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-switch
      v-model="$vuetify.theme.dark"
      hide-details
      inset
      label="ダークモード"
    ></v-switch>
    <v-btn color="primary" @click.stop="dialog = true" class="ml-3">
      クレジット
    </v-btn>
    <v-dialog v-model="dialog" max-width="640">
      <v-card>
        <v-card-title class="headline">クレジット</v-card-title>

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

          <v-btn color="green darken-1" text @click="dialog = false">
            閉じる
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {}
})
export default class AppBar extends Vue {
  dialog = false;
}
</script>
