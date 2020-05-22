<template>
  <v-card outlined tile>
    <v-toolbar dense :color="toolBarColor">
      <v-toolbar-title
        ><v-icon class="mr-2">{{ titleIcon }}</v-icon
        >{{ title }}</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="swapUnitData">
            <v-icon>mdi-swap-vertical</v-icon>
          </v-btn>
        </template>
        <span>攻撃側と防御側のデータを入れ替えます</span>
      </v-tooltip>
    </v-toolbar>
    <v-sheet tile>
      <v-card-text>
        <v-subheader class="pl-0">基礎パラメーター</v-subheader>
        <v-row dense>
          <v-col cols="12" sm="4" lg="4">
            <v-autocomplete
              :items="unitNameList"
              v-model="unitName"
              label="ユニット"
              dense
            ></v-autocomplete>
          </v-col>
          <v-col cols="6" sm="4" lg="4">
            <input-data-form-text-field
              label="Lv"
              :value.sync="lv"
              :min="1"
              :max="1000"
              tooltip="現在のLvを入力してください"
            />
          </v-col>
          <v-col cols="6" sm="4" lg="4">
            <input-data-form-text-field
              hasCheckbox
              checkboxTooltip="任意の登場Lvを設定したい場合チェックしてください"
              label="登場Lv"
              :min="1"
              :max="1000"
              :value.sync="appearanceLv"
              :checkbox.sync="appearanceLvCheckbox"
              tooltip="ユニットの加入時点のLvを入力してください"
            />
          </v-col>
        </v-row>
        <v-row dense v-if="target === 'attack'" style="margin-bottom:14px;">
          <v-col cols="12" sm="4" lg="4">
            <v-autocomplete
              :items="abilityNameList"
              v-model="abilityName"
              label="特殊能力"
              :messages="abilityNameMessage"
              dense
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="4" lg="4">
            <v-select
              :items="formItems.abilityLv"
              v-model="abilityLv"
              label="特殊能力Lv"
              :messages="abilityLvMessage"
              dense
            ></v-select>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col
            cols="6"
            sm="3"
            lg="3"
            v-if="target === 'attack' && isStrengthAbility"
          >
            <input-data-form-text-field
              hasCheckbox
              checkboxTooltip="任意の基本攻撃力内部値を設定したい場合チェックしてください"
              label="基本攻撃力内部値"
              :value.sync="baseAttack"
              :checkbox.sync="baseAttackCheckbox"
              :min="1"
              :max="2499"
              :messages="baseAttackMessage"
              tooltip="ユニットの基本攻撃力内部値を入力してください<br>※初期値はユニット、Lv、登場Lvから自動算出されます"
            />
          </v-col>
          <v-col
            cols="6"
            sm="3"
            lg="3"
            v-if="target === 'defense' && isStrengthAbility"
          >
            <input-data-form-text-field
              hasCheckbox
              checkboxTooltip="任意の基本防御力内部値を設定したい場合チェックしてください"
              label="基本防御力内部値"
              :value.sync="baseDefense"
              :checkbox.sync="baseDefenseCheckbox"
              :min="1"
              :max="2499"
              :messages="baseDefenseMessage"
              tooltip="ユニットの基本防御力内部値を入力してください<br />※初期値はユニット、Lv、登場Lvから自動算出されます"
            />
          </v-col>
          <v-col
            cols="6"
            sm="3"
            lg="3"
            v-if="target !== 'defense' || isMagicAbility"
          >
            <input-data-form-text-field
              hasCheckbox
              checkboxTooltip="任意の基本魔力内部値を設定したい場合チェックしてください"
              label="基本魔力内部値"
              :value.sync="baseMagic"
              :checkbox.sync="baseMagicCheckbox"
              :min="1"
              :max="2499"
              :messages="baseMagicMessage"
              tooltip="ユニットの基本魔力内部値を入力してください<br>※初期値はユニット、Lv、登場Lvから自動算出されます"
            />
          </v-col>
          <v-col
            cols="12"
            sm="3"
            lg="3"
            v-if="target === 'attack' && isStrengthAbility"
          >
            <v-select
              item-text="name"
              item-value="effect"
              :items="formItems.attackBuff"
              v-model="attackBuff"
              label="攻撃力上昇or低下"
              dense
            ></v-select>
          </v-col>
          <v-col
            cols="12"
            sm="3"
            lg="3"
            v-if="target === 'defense' && isStrengthAbility"
          >
            <v-select
              item-text="name"
              item-value="effect"
              :items="formItems.defenseBuff"
              v-model="defenseBuff"
              label="防御力上昇or低下"
              dense
            ></v-select>
          </v-col>
          <v-col
            cols="12"
            sm="3"
            lg="3"
            v-if="target !== 'defense' || isMagicAbility"
          >
            <v-select
              item-text="name"
              item-value="effect"
              :items="formItems.magicBuff"
              v-model="magicBuff"
              label="魔力上昇or低下"
              dense
            ></v-select>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12" sm="3" lg="3">
            <v-select
              item-text="name"
              item-value="effect"
              :items="formItems.debuff"
              v-model="debuff"
              label="ヘモジーor石化"
              dense
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" lg="4">
            <v-switch
              label="ウィークエネミー"
              v-model="isWeekEnemy"
              inset
              dense
              hide-details
              class="mt-0"
            ></v-switch>
          </v-col>
          <v-col cols="12" sm="4" lg="4">
            <v-switch
              label="毒"
              v-model="isPoison"
              inset
              dense
              hide-details
              class="mt-0"
            ></v-switch>
          </v-col>
        </v-row>
        <v-subheader class="pl-0">装備補正</v-subheader>
        <v-row
          dense
          style="min-height:52px;"
          v-if="target === 'attack' || isEquipableArmor"
        >
          <v-col cols="12" sm="3" lg="3" v-if="target === 'attack'">
            <v-switch
              class="mt-0"
              label="武器非装備or刀破斬"
              v-model="isNoWeapon"
              inset
              dense
              hide-details
            ></v-switch>
          </v-col>
          <v-col
            cols="12"
            sm="3"
            lg="3"
            v-if="target === 'defense' && isEquipableArmor"
          >
            <v-switch
              class="mt-0"
              label="防具非装備"
              v-model="isNoArmor"
              inset
              dense
              hide-details
            ></v-switch>
          </v-col>
        </v-row>
        <v-row dense>
          <template v-if="target === 'attack'">
            <v-col
              cols="12"
              sm="3"
              lg="3"
              v-if="!isNoWeapon && isStrengthAbility"
            >
              <input-data-form-text-field
                label="武器ATT"
                :value.sync="weaponAttack"
                :min="0"
                :max="499.8"
                tooltip="装備武器のATTを入力してください"
              />
            </v-col>
            <v-col cols="12" sm="3" lg="3" v-if="isStrengthAbility">
              <input-data-form-text-field
                label="他装備ATT"
                :value.sync="equipmentAttack"
                :min="0"
                :max="499.8"
                tooltip="装備特殊効果「装備すると攻撃力上昇」を持つアイテムを装備している場合、<br />その上昇値を入力してください"
              />
            </v-col>
            <v-col cols="12" sm="3" lg="3" v-if="!isNoWeapon">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-select
                    item-text="name"
                    item-value="id"
                    :items="formItems.slayerAndGuard"
                    v-model="equipmentSlayer"
                    label="スレイヤー装備"
                    v-on="on"
                    dense
                  ></v-select>
                </template>
                <span
                  >装備特殊効果「特定敵にダメージ増」を持つスレイヤーの装備の名称を選択してください</span
                >
              </v-tooltip>
            </v-col>
          </template>
          <template v-if="target === 'defense'">
            <v-col
              cols="12"
              sm="3"
              lg="3"
              v-if="!isNoArmor && isEquipableArmor && isStrengthAbility"
            >
              <input-data-form-text-field
                label="防具1DEF"
                :value.sync="armorDefense1"
                :min="0"
                :max="499.8"
                tooltip="装備防具のDEFを入力してください(中央)"
              />
            </v-col>
            <v-col
              cols="12"
              sm="3"
              lg="3"
              v-if="!isNoArmor && isEquipableArmor && isStrengthAbility"
            >
              <input-data-form-text-field
                label="防具2DEF"
                :value.sync="armorDefense2"
                :min="0"
                :max="499.8"
                tooltip="装備防具のDEFを入力してください(下段)"
              />
            </v-col>
            <v-col cols="12" sm="3" lg="3" v-if="isStrengthAbility">
              <input-data-form-text-field
                label="他装備DEF"
                :value.sync="equipmentDefense"
                :min="0"
                :max="499.8"
                tooltip="装備特殊効果「装備すると防御力上昇」を持つアイテムを装備している場合、<br />その上昇値を入力してください"
              />
            </v-col>
            <v-col
              cols="12"
              sm="3"
              lg="3"
              v-if="!isNoArmor && isEquipableArmor"
            >
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-select
                    item-text="name"
                    item-value="id"
                    :items="formItems.slayerAndGuard"
                    v-model="equipmentGuard"
                    label="ガード装備"
                    v-on="on"
                    dense
                  ></v-select>
                </template>
                <span
                  >装備特殊効果「特定敵からダメージ減」を持つガードの装備の名称を選択してください</span
                >
              </v-tooltip>
            </v-col>
          </template>
          <v-col cols="12" sm="3" lg="3" v-if="isMagicAbility">
            <input-data-form-text-field
              label="装備MAG"
              :value.sync="equipmentMagic"
              :min="0"
              :max="499.8"
              tooltip="装備特殊効果「装備すると魔力上昇」を持つアイテムを装備している場合、<br />その上昇値を入力してください"
            />
          </v-col>
          <v-col cols="12" sm="3" lg="3" v-if="target === 'defense'">
            <input-data-form-text-field
              label="装備魔防御"
              :value.sync="equipmentMagicDefense"
              :min="0"
              :max="5"
              tooltip="装備特殊効果「装備すると魔防御上昇」を持つアイテムを装備している場合、<br />その上昇値を入力してください"
            />
          </v-col>
        </v-row>
        <v-subheader
          class="pl-0"
          v-if="
            target === 'defense' &&
              isAbleManipWeekElement | isAbleManipResistElement
          "
          >その他</v-subheader
        >
        <v-row dense v-if="target === 'defense'">
          <v-col cols="12" sm="4" lg="4" v-if="isAbleManipWeekElement">
            <v-switch
              :label="attackElement + '属性弱点'"
              inset
              dense
              v-model="isWeekElement"
            ></v-switch>
          </v-col>
          <v-col cols="12" sm="4" lg="4" v-if="isAbleManipResistElement">
            <v-switch
              :label="attackElement + '属性耐性'"
              inset
              dense
              v-model="isResistElement"
            ></v-switch>
          </v-col>
        </v-row>
      </v-card-text>
    </v-sheet>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from "vue-property-decorator";
import InputDataFormTextField from "@/components/Common/InputDataFormTextField.vue";
import * as formItems from "@/assets/formItems";
import * as calc from "@/util/calc";
import * as find from "@/util/find";
import { Mixin } from "../Mixin";

@Component({
  components: { InputDataFormTextField }
})
export default class InputDataForm extends Mixins(Mixin) {
  @Prop({
    type: String,
    required: true,
    validator(value) {
      return ["attack", "defense"].indexOf(value) !== -1;
    }
  })
  target!: string;

  get title() {
    return this.target === "attack" ? "攻撃側データ" : "防御側データ";
  }

  get titleIcon() {
    return this.target === "attack" ? "mdi-sword" : "mdi-shield-cross-outline";
  }

  get toolBarColor() {
    return this.target === "attack" ? "red" : "indigo";
  }

  get formItems() {
    return formItems;
  }

  get abilityNameMessage() {
    const abilityData = find.abilityData(
      this.sharedState.unitData[this.target].abilityName
    );

    if (!abilityData?.power || !abilityData?.type) {
      return "";
    }

    return `威力:${abilityData.power} タイプ:${abilityData.type}`;
  }

  get abilityLvMessage() {
    const abilityData = find.abilityData(
      this.sharedState.unitData[this.target].abilityName
    );

    if (this.sharedState.unitData.attack.abilityLv === 1) {
      return `消費MP:${abilityData.mp1}`;
    }

    if (this.sharedState.unitData.attack.abilityLv === 2) {
      return `消費MP:${abilityData.mp2}`;
    }

    return `消費MP:${abilityData.mp3}`;
  }

  get baseAttackMessage() {
    const unitData = find.unitData(
      this.sharedState.unitData[this.target].unitName
    );

    if (!unitData?.basicAttackModifier) {
      return "修正値x？";
    }

    return "修正値x" + unitData?.basicAttackModifier;
  }

  get baseDefenseMessage() {
    const unitData = find.unitData(
      this.sharedState.unitData[this.target].unitName
    );

    if (!unitData?.basicDefenseModifier) {
      return "修正値x？";
    }

    return "修正値x" + unitData?.basicDefenseModifier;
  }

  get baseMagicMessage() {
    const unitData = find.unitData(
      this.sharedState.unitData[this.target].unitName
    );

    if (!unitData?.basicMagicModifier) {
      return "修正値x？";
    }

    return "修正値x" + unitData?.basicMagicModifier;
  }

  get isStrengthAbility() {
    const abilityData = find.abilityData(
      this.sharedState.unitData.attack.abilityName
    );

    return abilityData?.type === "攻撃力";
  }

  get isMagicAbility() {
    const abilityData = find.abilityData(
      this.sharedState.unitData.attack.abilityName
    );

    return abilityData?.type === "魔力";
  }

  get isEquipableArmor() {
    const unitData = find.unitData(
      this.sharedState.unitData[this.target].unitName
    );

    if (!unitData?.isEquipableArmor) {
      return false;
    }

    return true;
  }

  get isAbleManipWeekElement() {
    return this.attackElement !== null;
  }

  get isAbleManipResistElement() {
    const unitData = find.unitData(this.sharedState.unitData.defense.unitName);
    return (
      this.attackElement !== null && this.attackElement !== unitData?.element
    );
  }

  get attackElement() {
    const abilityData = find.abilityData(
      this.sharedState.unitData.attack.abilityName
    );
    return abilityData.element;
  }

  get unitName() {
    return this.sharedState.unitData[this.target].unitName;
  }

  set unitName(unitName: string) {
    this.setUnitName(unitName, this.target);
  }

  get abilityName() {
    return this.sharedState.unitData[this.target].abilityName;
  }

  set abilityName(abilityName: string) {
    this.setAbilityName(abilityName, this.target);
  }

  get abilityLv() {
    return this.sharedState.unitData[this.target].abilityLv;
  }

  set abilityLv(abilityLv: number) {
    this.setAbilityLv(abilityLv, this.target);
  }

  get lv() {
    return this.sharedState.unitData[this.target].lv;
  }

  set lv(lv: number) {
    lv = calc.fixValue(lv, 1, 1000);
    this.setLv(lv, this.target);
  }

  get appearanceLv() {
    return this.sharedState.unitData[this.target].appearanceLv;
  }

  set appearanceLv(appearanceLv: number) {
    appearanceLv = calc.fixValue(appearanceLv, 1, 1000);
    this.setAppearanceLv(appearanceLv, this.target);
  }

  get appearanceLvCheckbox() {
    return this.sharedState.checkbox[this.target].appearanceLv;
  }

  set appearanceLvCheckbox(appearanceLv: boolean) {
    this.setAppearanceLvCheckbox(appearanceLv, this.target);
  }

  get baseAttack() {
    return this.sharedState.unitData[this.target].baseAttack;
  }

  set baseAttack(baseAttack: number) {
    baseAttack = calc.fixValue(baseAttack, 1, 2499);
    this.setBaseAttack(baseAttack, this.target);
  }

  get baseAttackCheckbox() {
    return this.sharedState.checkbox[this.target].baseAttack;
  }

  set baseAttackCheckbox(baseAttack: boolean) {
    this.setBaseAttackCheckbox(baseAttack, this.target);
  }

  get baseDefense() {
    return this.sharedState.unitData[this.target].baseDefense;
  }

  set baseDefense(baseDefense: number) {
    baseDefense = calc.fixValue(baseDefense, 1, 2499);
    this.setBaseDefense(baseDefense, this.target);
  }

  get baseDefenseCheckbox() {
    return this.sharedState.checkbox[this.target].baseDefense;
  }

  set baseDefenseCheckbox(baseDefense: boolean) {
    this.setBaseDefenseCheckbox(baseDefense, this.target);
  }

  get baseMagic() {
    return this.sharedState.unitData[this.target].baseMagic;
  }

  set baseMagic(baseMagic: number) {
    baseMagic = calc.fixValue(baseMagic, 1, 2499);
    this.setBaseMagic(baseMagic, this.target);
  }

  get baseMagicCheckbox() {
    return this.sharedState.checkbox[this.target].baseMagic;
  }

  set baseMagicCheckbox(baseMagic: boolean) {
    this.setBaseMagicCheckbox(baseMagic, this.target);
  }

  get debuff() {
    return this.sharedState.unitData[this.target].debuff;
  }

  set debuff(debuff: number) {
    this.setDebuff(debuff, this.target);
  }

  get attackBuff() {
    return this.sharedState.unitData[this.target].attackBuff;
  }

  set attackBuff(attackBuff: number) {
    this.setAttackBuff(attackBuff, this.target);
  }

  get defenseBuff() {
    return this.sharedState.unitData[this.target].defenseBuff;
  }

  set defenseBuff(defenseBuff: number) {
    this.setDefenseBuff(defenseBuff, this.target);
  }

  get magicBuff() {
    return this.sharedState.unitData[this.target].magicBuff;
  }

  set magicBuff(magicBuff: number) {
    this.setMagicBuff(magicBuff, this.target);
  }

  get isWeekEnemy() {
    return this.sharedState.unitData[this.target].isWeekEnemy;
  }

  set isWeekEnemy(isWeekEnemy: boolean) {
    this.setIsWeekEnemy(isWeekEnemy, this.target);
  }

  get isPoison() {
    return this.sharedState.unitData[this.target].isPoison;
  }

  set isPoison(isPoison: boolean) {
    this.setIsPoison(isPoison, this.target);
  }

  get isNoWeapon() {
    return this.sharedState.unitData[this.target].isNoWeapon;
  }

  set isNoWeapon(isNoWeapon: boolean) {
    this.setIsNoWeapon(isNoWeapon, this.target);
  }

  get isNoArmor() {
    return this.sharedState.unitData[this.target].isNoArmor;
  }

  set isNoArmor(isNoArmor: boolean) {
    this.setIsNoArmor(isNoArmor, this.target);
  }

  get weaponAttack() {
    return this.sharedState.unitData[this.target].weaponAttack;
  }

  set weaponAttack(weaponAttack: number) {
    weaponAttack = calc.fixValue(weaponAttack * 5, 0, 2499) / 5;
    this.setWeaponAttack(weaponAttack, this.target);
  }

  get equipmentAttack() {
    return this.sharedState.unitData[this.target].equipmentAttack;
  }

  set equipmentAttack(equipmentAttack: number) {
    equipmentAttack = calc.fixValue(equipmentAttack * 5, 0, 2499) / 5;
    this.setEquipmentAttack(equipmentAttack, this.target);
  }

  get equipmentSlayer() {
    return this.sharedState.unitData[this.target].equipmentSlayer;
  }

  set equipmentSlayer(equipmentSlayer: number) {
    this.setEquipmentSlayer(equipmentSlayer, this.target);
  }

  get armorDefense1() {
    return this.sharedState.unitData[this.target].armorDefense1;
  }

  set armorDefense1(armorDefense1: number) {
    armorDefense1 = calc.fixValue(armorDefense1 * 5, 0, 2499) / 5;
    this.setArmorDefense1(armorDefense1, this.target);
  }

  get armorDefense2() {
    return this.sharedState.unitData[this.target].armorDefense2;
  }

  set armorDefense2(armorDefense2: number) {
    armorDefense2 = calc.fixValue(armorDefense2 * 5, 0, 2499) / 5;
    this.setArmorDefense2(armorDefense2, this.target);
  }

  get equipmentDefense() {
    return this.sharedState.unitData[this.target].equipmentDefense;
  }

  set equipmentDefense(equipmentDefense: number) {
    equipmentDefense = calc.fixValue(equipmentDefense * 5, 0, 2499) / 5;
    this.setEquipmentDefense(equipmentDefense, this.target);
  }

  get equipmentGuard() {
    return this.sharedState.unitData[this.target].equipmentGuard;
  }

  set equipmentGuard(equipmentGuard: number) {
    this.setEquipmentGuard(equipmentGuard, this.target);
  }

  get isWeekElement() {
    return this.sharedState.unitData[this.target].isWeekElement;
  }

  set isWeekElement(isWeekElement: boolean) {
    this.setIsWeekElement(isWeekElement, this.target);
  }

  get isResistElement() {
    return this.sharedState.unitData[this.target].isResistElement;
  }

  set isResistElement(isResistElement: boolean) {
    this.setIsResistElement(isResistElement, this.target);
  }

  get equipmentMagic() {
    return this.sharedState.unitData[this.target].equipmentMagic;
  }

  set equipmentMagic(equipmentMagic: number) {
    equipmentMagic = calc.fixValue(equipmentMagic * 5, 0, 2499) / 5;
    this.setEquipmentMagic(equipmentMagic, this.target);
  }

  get equipmentMagicDefense() {
    return this.sharedState.unitData[this.target].equipmentMagicDefense;
  }

  set equipmentMagicDefense(equipmentMagicDefense: number) {
    equipmentMagicDefense = calc.fixValue(equipmentMagicDefense, 0, 5);
    this.setEquipmentMagicDefense(equipmentMagicDefense, this.target);
  }
}
</script>
