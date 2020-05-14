<template>
  <v-container>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-center">最終ダメージ</th>
            <th class="text-center" v-for="(item, i) in 8" :key="i">
              パターン{{ i + 1 }}<br />
              ({{ skillPatternProbability(i).toFixed(2) }}%)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in 6" :key="i">
            <td class="text-center">{{ i }}</td>
            <td class="text-center" v-for="(item2, j) in 8" :key="j">
              <template v-if="isVisibleDamage(j)">{{
                sharedState.damageResult[j][i]
              }}</template>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <v-row>
      <v-col cols="12" lg="6">
        <description-unit-data target="attack" />
      </v-col>
      <v-col cols="12" lg="6">
        <description-unit-data target="defense" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import DescriptionUnitData from "./Description/DescriptionUnitData.vue";
import store from "./store";
import * as calc from "@/util/calc";

@Component({
  components: { DescriptionUnitData }
})
export default class Description extends Vue {
  sharedState = store.state;
  skillPattern = calc.skillPattern;

  get skillLv() {
    return this.sharedState.unitData.attack.isNoWeapon
      ? 0
      : this.sharedState.unitData.attack.weaponSkillLv;
  }

  get isCritical() {
    return (
      this.sharedState.unitData.attack.isCritical &&
      !this.sharedState.unitData.attack.isNoWeapon
    );
  }

  isVisibleDamage(index: number) {
    if (this.isCritical && index === 7) {
      return true;
    }
    return this.skillPattern[this.skillLv][index] > 0 ? true : false;
  }

  skillPatternProbability(index: number) {
    return calc.skillPatternProbability(this.skillLv, index, this.isCritical);
  }
}
</script>
