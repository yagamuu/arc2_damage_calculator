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
                防御率：{{ guardActual.toFixed(2) }}％({{ guard }}％)<br />
                回避率：{{ dodge }}％
              </p>
              <v-text-field
                type="number"
                min="0"
                max="32767"
                style="max-width:350px;"
                label="入力値以上のダメージが発生する確率"
                v-model="damage"
                :messages="damageProbabilityMessage"
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
            <v-card-text>
              <v-text-field
                label="データ名"
                v-model="dataName"
                dense
              ></v-text-field>
              <v-autocomplete
                label="保存したデータ"
                item-text="dataName"
                :items="normalAttack.storeData"
                v-model="selectedData"
                dense
              ></v-autocomplete>
              <v-card-actions>
                <v-btn color="red" @click="saveData">保存</v-btn>
                <v-btn color="info" @click="loadData">読込</v-btn>
                <v-btn color="grey" @click="deleteData">削除</v-btn>
              </v-card-actions>
            </v-card-text>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar">
      {{ snackbarText }}
      <v-btn color="pink" text @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import InputDataForm from "./InputData/InputDataForm.vue";
import { Mixin } from "./Mixin";
import * as find from "@/util/find";
import * as calc from "@/util/calc";
import { NormalAttackStateInterface } from "@/types/NormalAttack/State";
import clone from "clone";

interface LocalStorageNormalAttack extends NormalAttackStateInterface {
  dataName: string;
}

interface NormalAttackInterface {
  storeData: Array<LocalStorageNormalAttack>;
}

@Component({
  components: { InputDataForm }
})
export default class InputData extends Mixins(Mixin) {
  normalAttack: NormalAttackInterface = {
    storeData: []
  };
  selectedData = null;
  dataName = "";
  snackbarText = "";
  snackbar = false;
  damage = 0;

  mounted() {
    if (localStorage.getItem("normalAttack")) {
      try {
        const data = localStorage.getItem("normalAttack");
        this.normalAttack =
          data !== null ? JSON.parse(data) : this.normalAttack;
      } catch (e) {
        localStorage.removeItem("normalAttack");
      }
    }
  }

  saveData() {
    if (this.dataName === "" && !this.selectedData) {
      this.snackbarText = "データ名の入力、またはデータの選択をして下さい。";
      this.snackbar = true;
      return;
    }

    const state = JSON.parse(JSON.stringify(this.sharedState));
    let index = -1;
    if (this.dataName !== "") {
      state["dataName"] = this.dataName;
      index = this.normalAttack.storeData.findIndex(
        data => data?.dataName === this.dataName
      );
    } else {
      state["dataName"] = this.selectedData;
      index = this.normalAttack.storeData.findIndex(
        data => data?.dataName === this.selectedData
      );
    }
    if (index !== -1) {
      this.normalAttack.storeData[index] = state;
    } else {
      this.normalAttack.storeData.push(state);
    }
    const parsed = JSON.stringify(this.normalAttack);
    localStorage.setItem("normalAttack", parsed);

    this.dataName = "";
    this.snackbarText = `データ名${state["dataName"]}を保存しました。`;
    this.snackbar = true;
  }

  loadData() {
    if (!this.selectedData) {
      this.snackbarText = "データ名を選択して下さい。";
      this.snackbar = true;
      return;
    }
    const dataName = this.selectedData;
    const index = this.normalAttack.storeData.findIndex(
      data => data?.dataName === this.selectedData
    );

    const store = clone(this.normalAttack.storeData[index]);
    this.setUnitDataAll(store.unitData.attack, store.unitData.defense);
    this.setCheckboxAll(store.checkbox.attack, store.checkbox.defense);
    this.setDamageResult(store.damageResult);

    this.snackbarText = `データ名${dataName}を読み込みました。`;
    this.snackbar = true;
  }

  deleteData() {
    if (!this.selectedData) {
      this.snackbarText = "データ名を選択して下さい。";
      this.snackbar = true;
      return;
    }

    const dataName = this.selectedData;
    const index = this.normalAttack.storeData.findIndex(
      data => data?.dataName === this.selectedData
    );
    this.normalAttack.storeData.splice(index, 1);
    this.selectedData = null;

    const parsed = JSON.stringify(this.normalAttack);
    localStorage.setItem("normalAttack", parsed);

    this.snackbarText = `データ名${dataName}を削除しました。`;
    this.snackbar = true;
  }

  get skillPattern() {
    const skillPattern = calc.skillPattern;
    const counterSkillPattern = calc.counterSkillPattern;

    if (this.sharedState.unitData.attack.isCounter) {
      return counterSkillPattern[this.sharedState.unitData.attack.counterLv];
    }

    return skillPattern;
  }

  get possibilityDamage() {
    const skillLv = this.sharedState.unitData.attack.isNoWeapon
      ? 0
      : this.sharedState.unitData.attack.weaponSkillLv;
    return this.sharedState.damageResult.reduce((pre, current, index) => {
      if (
        (this.sharedState.unitData.attack.isCritical &&
          skillLv != 0 &&
          !this.sharedState.unitData.attack.isCounter &&
          index === 7) ||
        this.skillPattern[skillLv][index] !== 0
      ) {
        pre.push(...current);
      }
      return pre;
    }, []);
  }

  get minDamage() {
    if (this.possibilityDamage.length === 0) {
      return 0;
    }
    return this.possibilityDamage.reduce((a, b) => Math.min(a, b));
  }

  get maxDamage() {
    return this.possibilityDamage.reduce((a, b) => Math.max(a, b), 0);
  }

  get expected() {
    const skillLv = this.sharedState.unitData.attack.isNoWeapon
      ? 0
      : this.sharedState.unitData.attack.weaponSkillLv;
    const isCritical =
      this.sharedState.unitData.attack.isCritical &&
      !this.sharedState.unitData.attack.isNoWeapon;
    const isCounter = this.sharedState.unitData.attack.isCounter;
    const counterLv = this.sharedState.unitData.attack.counterLv;

    let result = 0;
    this.sharedState.damageResult.forEach((value, index) => {
      result +=
        ((value.reduce((pre, current) => pre + current) / 6) *
          calc.skillPatternProbability(
            skillLv,
            index,
            isCritical,
            isCounter,
            counterLv
          )) /
        100;
    });
    return Math.floor(result);
  }

  get guard() {
    const defenseUnitData = find.unitData(
      this.sharedState.unitData.defense.unitName
    );
    const basicGuard = defenseUnitData.basicGuard;
    if (basicGuard === 0) {
      return 0;
    }
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

  get guardActual() {
    return 100 * ((100 - this.dodge) / 100) * (this.guard / 100);
  }

  get dodge() {
    if (
      this.sharedState.unitData.attack.charge > 0 &&
      !this.sharedState.unitData.attack.isCounter
    ) {
      return 0;
    }

    const defenseUnitData = find.unitData(
      this.sharedState.unitData.defense.unitName
    );
    const basicDodge = defenseUnitData.basicDodge;
    if (basicDodge === 0) {
      return 0;
    }
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

  get damageProbabilityMessage() {
    const skillLv = this.sharedState.unitData.attack.isNoWeapon
      ? 0
      : this.sharedState.unitData.attack.weaponSkillLv;
    const isCritical =
      this.sharedState.unitData.attack.isCritical &&
      !this.sharedState.unitData.attack.isNoWeapon;
    const isCounter = this.sharedState.unitData.attack.isCounter;
    const counterLv = this.sharedState.unitData.attack.counterLv;

    const hit = this.hit / 100;
    const guard = this.guardActual / 100;

    let result = 0;
    this.sharedState.damageResult.forEach((damageArray, index) => {
      const skillPatternProbability =
        calc.skillPatternProbability(
          skillLv,
          index,
          isCritical,
          isCounter,
          counterLv
        ) / 100;
      damageArray.forEach(damage => {
        result +=
          this.damage <= damage ? (skillPatternProbability / 6) * hit : 0;
        result +=
          this.damage <= Math.ceil(damage * 0.1)
            ? (skillPatternProbability / 6) * guard
            : 0;
      });
    });

    return (result * 100).toFixed(2) + "％";
  }
}
</script>
