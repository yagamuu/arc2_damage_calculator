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
      <v-col cols="12" lg="5"><input-data-form target="attack"/></v-col>
      <v-col cols="12" lg="5"><input-data-form target="defense"/></v-col>
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
                ダメージ：{{ minDamage }}～{{ maxDamage }}<br />
                ダメージ期待値：{{ expected }}
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
            <v-card-text>
              <v-text-field
                label="データ名"
                v-model="dataName"
                dense
              ></v-text-field>
              <v-autocomplete
                label="保存したデータ"
                item-text="dataName"
                :items="abilityAttack.storeData"
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
import { AbilityAttackStateInterface } from "@/types/AbilityAttack/State";
import clone from "clone";

interface LocalStorageAbilityAttack extends AbilityAttackStateInterface {
  dataName: string;
}

interface AbilityAttackInterface {
  storeData: Array<LocalStorageAbilityAttack>;
}

@Component({
  components: { InputDataForm }
})
export default class InputData extends Mixins(Mixin) {
  abilityAttack: AbilityAttackInterface = {
    storeData: []
  };
  selectedData = null;
  dataName = "";
  snackbarText = "";
  snackbar = false;

  mounted() {
    if (localStorage.getItem("abilityAttack")) {
      try {
        const data = localStorage.getItem("abilityAttack");
        this.abilityAttack =
          data !== null ? JSON.parse(data) : this.abilityAttack;
      } catch (e) {
        localStorage.removeItem("abilityAttack");
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
      index = this.abilityAttack.storeData.findIndex(
        data => data?.dataName === this.dataName
      );
    } else {
      state["dataName"] = this.selectedData;
      index = this.abilityAttack.storeData.findIndex(
        data => data?.dataName === this.selectedData
      );
    }
    if (index !== -1) {
      this.abilityAttack.storeData[index] = state;
    } else {
      this.abilityAttack.storeData.push(state);
    }
    const parsed = JSON.stringify(this.abilityAttack);
    localStorage.setItem("abilityAttack", parsed);

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
    const index = this.abilityAttack.storeData.findIndex(
      data => data?.dataName === this.selectedData
    );

    const store = clone(this.abilityAttack.storeData[index]);
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
    const index = this.abilityAttack.storeData.findIndex(
      data => data?.dataName === this.selectedData
    );
    this.abilityAttack.storeData.splice(index, 1);
    this.selectedData = null;

    const parsed = JSON.stringify(this.abilityAttack);
    localStorage.setItem("abilityAttack", parsed);

    this.snackbarText = `データ名${dataName}を削除しました。`;
    this.snackbar = true;
  }

  get minDamage() {
    return this.sharedState.damageResult.reduce((a, b) => Math.min(a, b));
  }

  get maxDamage() {
    return this.sharedState.damageResult.reduce((a, b) => Math.max(a, b));
  }

  get expected() {
    return Math.floor(
      this.sharedState.damageResult.reduce((a, b) => a + b) / 48
    );
  }
}
</script>
