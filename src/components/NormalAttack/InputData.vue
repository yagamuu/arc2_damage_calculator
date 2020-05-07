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
                ダメージ(ヒット)：{{ minDamage }}～{{ maxDamage }}<br />
                ダメージ(防御)：{{ Math.ceil(minDamage * 0.1) }}～{{
                  Math.ceil(maxDamage * 0.1)
                }}<br />
                ダメージ(ヒット)期待値：{{ expected }}<br />
                ヒット率：{{ hit.toFixed(2) }}％<br />
                防御率：{{ guard }}％<br />
                回避率：{{ dodge }}％
              </p>
              <v-text-field
                type="number"
                min="0"
                max="32767"
                style="max-width:350px;"
                label="入力値以上のダメージが発生する確率"
                value="0"
                disabled
                messages="未実装"
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
import * as find from "@/util/find";
import * as calc from "@/util/calc";

@Component({
  components: { InputDataForm }
})
export default class InputData extends Mixins(Mixin) {
  get possibilityDamage() {
    const skillLv = this.sharedState.unitData.attack.isNoWeapon
      ? 0
      : this.sharedState.unitData.attack.weaponSkillLv;
    return this.sharedState.damageResult.reduce((pre, current, index) => {
      if (
        (this.sharedState.unitData.attack.isCritical && index === 7) ||
        calc.skillPattern[skillLv][index] !== 0
      ) {
        pre.push(...current);
      }
      return pre;
    }, []);
  }

  get minDamage() {
    return this.possibilityDamage.reduce((a, b) => Math.min(a, b));
  }

  get maxDamage() {
    return this.possibilityDamage.reduce((a, b) => Math.max(a, b));
  }

  get expected() {
    const skillLv = this.sharedState.unitData.attack.isNoWeapon
      ? 0
      : this.sharedState.unitData.attack.weaponSkillLv;
    const isCritical = this.sharedState.unitData.attack.isCritical;
    let result = 0;
    this.sharedState.damageResult.forEach((value, index) => {
      result +=
        ((value.reduce((pre, current) => pre + current) / 6) *
          calc.skillPatternProbability(skillLv, index, isCritical)) /
        100;
    });
    return Math.floor(result);
  }

  get guard() {
    const defenseUnitData = find.unitData(
      this.sharedState.unitData.defense.unitName
    );
    const basicGuard = defenseUnitData.basicGuard;
    const guard =
      Math.floor((basicGuard * 100) / 16) +
      Math.trunc(
        (this.sharedState.unitData.defense.lv -
          this.sharedState.unitData.attack.lv) /
          2
      );

    if (guard > 100) return 100;
    if (guard < 0) return 0;
    return guard;
  }

  get dodge() {
    if (this.sharedState.unitData.attack.charge > 0) {
      return 0;
    }

    const defenseUnitData = find.unitData(
      this.sharedState.unitData.defense.unitName
    );
    const basicDodge = defenseUnitData.basicDodge;
    const dodge =
      Math.floor((basicDodge * 100) / 16) +
      Math.trunc(
        (this.sharedState.unitData.defense.lv -
          this.sharedState.unitData.attack.lv) /
          2
      );
    if (dodge > 100) return 100;
    if (dodge < 0) return 0;
    return dodge;
  }

  get hit() {
    return 100 * ((100 - this.dodge) / 100) * ((100 - this.guard) / 100);
  }
}
</script>
