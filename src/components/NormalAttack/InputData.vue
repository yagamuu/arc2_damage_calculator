<template>
  <v-container>
    <v-card-actions>
      <v-btn color="info" disabled
        ><v-icon left>mdi-magnify</v-icon
        >マップデータからユニットを選択(未実装)</v-btn
      >
      <v-btn color="info" @click="initUnitData"
        ><v-icon left>mdi-autorenew</v-icon>入力項目のリセット</v-btn
      >
    </v-card-actions>
    <v-row>
      <v-col cols="12" lg="5">
        <input-data-form target="attack" />
      </v-col>
      <v-col cols="12" lg="5">
        <input-data-form target="defense" />
      </v-col>
      <v-col cols="12" lg="2">
        <v-card outlined tile class="mb-4">
          <v-toolbar dense color="teal">
            <v-toolbar-title
              ><v-icon class="mr-2">mdi-calculator</v-icon
              >計算結果</v-toolbar-title
            >
          </v-toolbar>
          <v-sheet tile>
            <v-card-text
              ><p>
                ダメージ(ヒット)：00000～32767<br />
                ダメージ(防御)：00000～32767<br />
                ダメージ期待値：32767<br />
                命中率：100.00％<br />
                防御率：99.99％<br />
                回避率：99.99％
              </p>
              <v-text-field
                type="number"
                min="0"
                max="32767"
                style="max-width:350px;"
                label="入力値以上のダメージが発生する確率"
                value="0"
                messages="99.99%"
                dense
              ></v-text-field
            ></v-card-text>
          </v-sheet>
        </v-card>
        <v-card outlined tile>
          <v-toolbar dense>
            <v-toolbar-title
              ><v-icon class="mr-2">mdi-content-save</v-icon
              >データ保存</v-toolbar-title
            >
          </v-toolbar>
          <v-sheet tile>
            <v-card-text>未実装</v-card-text>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import InputDataForm from "./InputData/InputDataForm.vue";
import { Mixin } from "./Mixin";

@Component({
  components: { InputDataForm }
})
export default class InputData extends Mixins(Mixin) {}
</script>
