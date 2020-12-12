<template>
  <v-card :color="toolBarColor">
    <v-card-title class="subheading"
      ><v-icon class="mr-2">{{ titleIcon }}</v-icon
      >{{ title }}</v-card-title
    >
    <v-divider></v-divider>
    <v-list dense>
      <v-list-item>
        <v-list-item-content>ユニット名</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.name
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>クラス名</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.className
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>属性</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.element
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>武器種1</v-list-item-content>
        <v-list-item-content class="align-end">{{
          weaponType(unitData.weaponType1, unitData.weaponSkillLv1)
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>武器種2</v-list-item-content>
        <v-list-item-content class="align-end">{{
          weaponType(unitData.weaponType2, unitData.weaponSkillLv2)
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>武器種3</v-list-item-content>
        <v-list-item-content class="align-end">{{
          weaponType(unitData.weaponType3, unitData.weaponSkillLv3)
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>初期装備1</v-list-item-content>
        <v-list-item-content class="align-end">{{
          defaultEquipment(
            unitData.defaultEquipment1,
            unitData.defaultEquipmentAttack1
          )
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>初期装備2</v-list-item-content>
        <v-list-item-content class="align-end">{{
          defaultEquipment(
            unitData.defaultEquipment2,
            unitData.defaultEquipmentAttack2
          )
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>初期装備3</v-list-item-content>
        <v-list-item-content class="align-end">{{
          defaultEquipment(
            unitData.defaultEquipment3,
            unitData.defaultEquipmentAttack3
          )
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>HP</v-list-item-content>
        <v-list-item-content class="align-end">{{ hp }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>MP</v-list-item-content>
        <v-list-item-content class="align-end">{{ mp }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>攻撃力</v-list-item-content>
        <v-list-item-content class="align-end">{{
          attack
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>防御力</v-list-item-content>
        <v-list-item-content class="align-end">{{
          defense
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>敏捷力</v-list-item-content>
        <v-list-item-content class="align-end">{{
          agility
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>基本移動力</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.basicMove
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>基本魔防御</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.basicMagicDefense
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>基本回避率</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.basicDodge
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>基本防御率</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.basicGuard
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>ステータス異常タイプ</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.conditionType
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>ラヴィッシュ成功率</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.ravishRate
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>盗めるアイテム</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.stealableItem
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>落とすアイテム</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.droppableItem
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>ダメージ補正(正面)</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.frontDamegeScale
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>ダメージ補正(左右)</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.sideDamegeScale
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>ダメージ補正(背後)</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.backDamegeScale
        }}</v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>装備特殊効果追加タイプ</v-list-item-content>
        <v-list-item-content class="align-end">{{
          unitData.equipmentEffectType
        }}</v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import store from "../store";
import * as find from "@/util/find";
import * as calc from "@/util/calc";

@Component({
  components: {}
})
export default class DescriptionUnitData extends Vue {
  @Prop({
    type: String,
    required: true,
    validator(value) {
      return ["attack", "defense"].indexOf(value) !== -1;
    }
  })
  target!: string;

  sharedState = store.state;

  get unitData() {
    return find.unitData(this.sharedState.unitData[this.target].unitName);
  }

  get classData() {
    return find.classData(this.unitData.className);
  }

  get hp() {
    if (this.classData === undefined) {
      return 0;
    }
    return calc.calcParameter(
      this.classData?.baseHitPoint,
      store.state.unitData[this.target].appearanceLv,
      this.classData?.hasAppearanceLvHitPointBonus,
      store.state.unitData[this.target].lv,
      this.classData?.growHitPoint
    );
  }

  get mp() {
    if (this.classData === undefined) {
      return 0;
    }
    return calc.calcParameter(
      this.classData.baseMagicPoint,
      store.state.unitData[this.target].appearanceLv,
      this.classData?.hasAppearanceLvMagicPointBonus,
      store.state.unitData[this.target].lv,
      this.classData?.growMagicPoint
    );
  }

  get attack() {
    return (
      calc.fixValue(
        this.sharedState.unitData[this.target].baseAttack *
          this.unitData.basicAttackModifier,
        1,
        2499
      ) / 5
    );
  }

  get defense() {
    return (
      calc.fixValue(
        this.sharedState.unitData[this.target].baseDefense *
          this.unitData.basicDefenseModifier,
        1,
        2499
      ) / 5
    );
  }

  get agility() {
    if (this.classData === undefined) {
      return 0;
    }
    const baseAgility = calc.calcParameter(
      this.classData.baseAgility,
      store.state.unitData[this.target].appearanceLv,
      false,
      store.state.unitData[this.target].lv,
      this.classData?.growAgility
    );
    return (baseAgility + this.unitData.basicAgilityModifier) / 5;
  }

  get title() {
    return this.target === "attack" ? "攻撃側データ詳細" : "防御側データ詳細";
  }

  get titleIcon() {
    return this.target === "attack" ? "mdi-sword" : "mdi-shield-cross-outline";
  }

  get toolBarColor() {
    return this.target === "attack" ? "red" : "indigo";
  }

  weaponType(type: string | null, skillLv: number | null) {
    return type !== null ? `${type}(初期熟練Lv:${skillLv})` : "なし";
  }

  defaultEquipment(
    defaultEquipment: string | null,
    defaultEquipmentAttack: number | null
  ) {
    return defaultEquipment !== null
      ? `${defaultEquipment}(初期ATT:${defaultEquipmentAttack})`
      : "なし";
  }
}
</script>
