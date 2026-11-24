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
        <v-row dense>
          <v-col cols="6" sm="3" lg="3" v-if="target === 'attack'">
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
          <v-col cols="6" sm="3" lg="3" v-if="target === 'defense'">
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
          <v-col cols="12" sm="3" lg="3" v-if="target === 'attack'">
            <v-select
              item-text="name"
              item-value="effect"
              :items="formItems.attackBuff"
              v-model="attackBuff"
              label="攻撃力上昇or低下"
              dense
            ></v-select>
          </v-col>
          <v-col cols="12" sm="3" lg="3" v-if="target === 'defense'">
            <v-select
              item-text="name"
              item-value="effect"
              :items="formItems.defenseBuff"
              v-model="defenseBuff"
              label="防御力上昇or低下"
              dense
            ></v-select>
          </v-col>
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
        </v-row>
        <v-row dense>
          <v-col cols="12" sm="3" lg="3">
            <v-switch
              label="ウィークエネミー"
              v-model="isWeekEnemy"
              inset
              dense
              hide-details
              class="mt-0"
            ></v-switch>
          </v-col>
          <v-col cols="12" sm="3" lg="3">
            <v-switch
              label="毒"
              v-model="isPoison"
              inset
              dense
              hide-details
              class="mt-0"
            ></v-switch>
          </v-col>
          <v-col cols="12" sm="3" lg="3" v-if="target === 'attack'">
            <v-switch
              label="反撃"
              v-model="isCounter"
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
          <v-col
            cols="12"
            sm="3"
            lg="3"
            v-if="target === 'attack' && !isNoWeapon"
          >
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-switch
                  class="mt-0"
                  label="クリティカル"
                  v-model="isCritical"
                  v-on="on"
                  inset
                  dense
                  hide-details
                ></v-switch>
              </template>
              <span
                >装備特殊効果「クリティカルが出る」を持つアイテムを装備している場合チェックしてください</span
              >
            </v-tooltip>
          </v-col>
          <v-col
            cols="12"
            sm="3"
            lg="3"
            v-if="target === 'attack' && !isNoWeapon"
          >
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-switch
                  class="mt-0"
                  label="飛行敵ダメ増"
                  v-model="isBonusToFlyable"
                  v-on="on"
                  inset
                  dense
                  hide-details
                ></v-switch>
              </template>
              <span
                >装備特殊効果「飛行敵にダメージ増」を持つアイテムの装備している場合チェックしてください</span
              >
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row dense v-if="target === 'attack'">
          <v-col cols="12" sm="3" lg="3" v-if="!isNoWeapon">
            <input-data-form-text-field
              label="武器ATT"
              :value.sync="weaponAttack"
              :min="0"
              :max="499.8"
              tooltip="装備武器のATTを入力してください"
            />
          </v-col>
          <v-col cols="12" sm="3" lg="3" v-if="!isNoWeapon">
            <v-select
              item-text="name"
              item-value="element"
              v-model="weaponElement"
              :items="formItems.weaponElement"
              label="武器属性"
              dense
            ></v-select>
          </v-col>
          <v-col cols="12" sm="3" lg="3">
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
        </v-row>
        <v-row dense v-if="target === 'defense'">
          <v-col cols="12" sm="3" lg="3" v-if="!isNoArmor && isEquipableArmor">
            <input-data-form-text-field
              label="防具1DEF"
              :value.sync="armorDefense1"
              :min="0"
              :max="499.8"
              tooltip="装備防具のDEFを入力してください(中央)"
            />
          </v-col>
          <v-col cols="12" sm="3" lg="3" v-if="!isNoArmor && isEquipableArmor">
            <input-data-form-text-field
              label="防具2DEF"
              :value.sync="armorDefense2"
              :min="0"
              :max="499.8"
              tooltip="装備防具のDEFを入力してください(下段)"
            />
          </v-col>
          <v-col cols="12" sm="3" lg="3">
            <input-data-form-text-field
              label="他装備DEF"
              :value.sync="equipmentDefense"
              :min="0"
              :max="499.8"
              tooltip="装備特殊効果「装備すると防御力上昇」を持つアイテムを装備している場合、<br />その上昇値を入力してください"
            />
          </v-col>
          <v-col cols="12" sm="3" lg="3" v-if="!isNoArmor && isEquipableArmor">
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
        </v-row>
        <v-subheader class="pl-0">その他</v-subheader>
        <v-row dense v-if="target === 'attack'">
          <v-col cols="12" sm="3" lg="3" v-if="!isNoWeapon">
            <v-select
              :items="formItems.skillLevel"
              v-model="weaponSkillLv"
              label="熟練Lv"
              dense
            ></v-select>
          </v-col>
          <v-col cols="12" sm="3" lg="3" v-if="isCounter">
            <v-select
              :items="formItems.counterLevel"
              v-model="counterLv"
              label="反撃Lv"
              dense
            ></v-select>
          </v-col>
          <v-col cols="12" sm="3" lg="3" v-if="!isCounter">
            <v-select
              :items="formItems.charge"
              v-model="charge"
              label="チャージ"
              dense
            ></v-select>
          </v-col>
          <v-col cols="12" sm="3" lg="3">
            <v-select
              item-text="name"
              item-value="effect"
              :items="formItems.direction"
              v-model="direction"
              label="攻撃方向"
              dense
            ></v-select>
          </v-col>
        </v-row>
        <v-row dense v-if="target === 'defense'">
          <v-col cols="12" sm="4" lg="4">
            <v-switch label="瀕死" inset dense v-model="isDying"></v-switch>
          </v-col>
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
import { defineComponent } from "vue";
import InputDataFormTextField from "@/components/Common/InputDataFormTextField.vue";
import * as formItems from "@/assets/formItems";
import * as calc from "@/util/calc";
import * as find from "@/util/find";
import { Mixin } from "../Mixin";

export default defineComponent({
  mixins: [Mixin],
  components: { InputDataFormTextField },
  props: {
    target: {
      type: String,
      required: true,
      validator: (value: string) => ["attack", "defense"].indexOf(value) !== -1
    }
  },
  computed: {
    title() {
      return this.target === "attack" ? "攻撃側データ" : "防御側データ";
    },
    titleIcon() {
      return this.target === "attack"
        ? "mdi-sword"
        : "mdi-shield-cross-outline";
    },
    toolBarColor() {
      return this.target === "attack" ? "red" : "indigo";
    },
    formItems() {
      return formItems;
    },
    baseAttackMessage() {
      const unitData = find.unitData(
        this.sharedState.unitData[this.target].unitName
      );

      if (!unitData?.basicAttackModifier) {
        return "修正値x？";
      }

      return "修正値x" + unitData?.basicAttackModifier;
    },
    baseDefenseMessage() {
      const unitData = find.unitData(
        this.sharedState.unitData[this.target].unitName
      );

      if (!unitData?.basicDefenseModifier) {
        return "修正値x？";
      }

      return "修正値x" + unitData?.basicDefenseModifier;
    },
    isEquipableArmor() {
      const unitData = find.unitData(
        this.sharedState.unitData[this.target].unitName
      );

      if (!unitData?.isEquipableArmor) {
        return false;
      }

      return true;
    },
    isAbleManipWeekElement() {
      if (this.attackElement === "無") {
        return false;
      }
      if (
        this.sharedState.unitData.attack.isBonusToFlyable &&
        !this.sharedState.unitData.attack.isNoWeapon
      ) {
        return false;
      }
      return true;
    },
    isAbleManipResistElement() {
      const unitData = find.unitData(
        this.sharedState.unitData.defense.unitName
      );

      if (this.attackElement === "無") {
        return false;
      }
      if (
        this.sharedState.unitData.attack.isBonusToFlyable &&
        !this.sharedState.unitData.attack.isNoWeapon
      ) {
        return false;
      }
      if (this.attackElement === unitData?.element) {
        return false;
      }
      return true;
    },
    attackElement() {
      const unitData = find.unitData(this.sharedState.unitData.attack.unitName);
      return this.sharedState.unitData.attack.weaponElement !== 0 &&
        !this.sharedState.unitData.attack.isNoWeapon
        ? formItems.weaponElement[
            this.sharedState.unitData.attack.weaponElement
          ].name
        : unitData?.element;
    },
    unitName: {
      get() {
        return this.sharedState.unitData[this.target].unitName;
      },
      set(unitName: string) {
        this.setUnitName(unitName, this.target);
      }
    },
    lv: {
      get() {
        return this.sharedState.unitData[this.target].lv;
      },
      set(lv: number) {
        lv = calc.fixValue(lv, 1, 1000);
        this.setLv(lv, this.target);
      }
    },
    appearanceLv: {
      get() {
        return this.sharedState.unitData[this.target].appearanceLv;
      },
      set(appearanceLv: number) {
        appearanceLv = calc.fixValue(appearanceLv, 1, 1000);
        this.setAppearanceLv(appearanceLv, this.target);
      }
    },
    appearanceLvCheckbox: {
      get() {
        return this.sharedState.checkbox[this.target].appearanceLv;
      },
      set(appearanceLv: boolean) {
        this.setAppearanceLvCheckbox(appearanceLv, this.target);
      }
    },
    baseAttack: {
      get() {
        return this.sharedState.unitData[this.target].baseAttack;
      },
      set(baseAttack: number) {
        baseAttack = calc.fixValue(baseAttack, 1, 2499);
        this.setBaseAttack(baseAttack, this.target);
      }
    },
    baseAttackCheckbox: {
      get() {
        return this.sharedState.checkbox[this.target].baseAttack;
      },
      set(baseAttack: boolean) {
        this.setBaseAttackCheckbox(baseAttack, this.target);
      }
    },
    baseDefense: {
      get() {
        return this.sharedState.unitData[this.target].baseDefense;
      },
      set(baseDefense: number) {
        baseDefense = calc.fixValue(baseDefense, 1, 2499);
        this.setBaseDefense(baseDefense, this.target);
      }
    },
    baseDefenseCheckbox: {
      get() {
        return this.sharedState.checkbox[this.target].baseDefense;
      },
      set(baseDefense: boolean) {
        this.setBaseDefenseCheckbox(baseDefense, this.target);
      }
    },
    debuff: {
      get() {
        return this.sharedState.unitData[this.target].debuff;
      },
      set(debuff: number) {
        this.setDebuff(debuff, this.target);
      }
    },
    attackBuff: {
      get() {
        return this.sharedState.unitData[this.target].attackBuff;
      },
      set(attackBuff: number) {
        this.setAttackBuff(attackBuff, this.target);
      }
    },
    defenseBuff: {
      get() {
        return this.sharedState.unitData[this.target].defenseBuff;
      },
      set(defenseBuff: number) {
        this.setDefenseBuff(defenseBuff, this.target);
      }
    },
    isWeekEnemy: {
      get() {
        return this.sharedState.unitData[this.target].isWeekEnemy;
      },
      set(isWeekEnemy: boolean) {
        this.setIsWeekEnemy(isWeekEnemy, this.target);
      }
    },
    isPoison: {
      get() {
        return this.sharedState.unitData[this.target].isPoison;
      },
      set(isPoison: boolean) {
        this.setIsPoison(isPoison, this.target);
      }
    },
    isCounter: {
      get() {
        return this.sharedState.unitData.attack.isCounter;
      },
      set(isCounter: boolean) {
        this.setIsCounter(isCounter, this.target);
      }
    },
    isNoWeapon: {
      get() {
        return this.sharedState.unitData[this.target].isNoWeapon;
      },
      set(isNoWeapon: boolean) {
        this.setIsNoWeapon(isNoWeapon, this.target);
      }
    },
    isNoArmor: {
      get() {
        return this.sharedState.unitData[this.target].isNoArmor;
      },
      set(isNoArmor: boolean) {
        this.setIsNoArmor(isNoArmor, this.target);
      }
    },
    isCritical: {
      get() {
        return this.sharedState.unitData[this.target].isCritical;
      },
      set(isCritical: boolean) {
        this.setIsCritical(isCritical, this.target);
      }
    },
    isBonusToFlyable: {
      get() {
        return this.sharedState.unitData[this.target].isBonusToFlyable;
      },
      set(isBonusToFlyable: boolean) {
        this.setIsBonusToFlyable(isBonusToFlyable, this.target);
      }
    },
    weaponAttack: {
      get() {
        return this.sharedState.unitData[this.target].weaponAttack;
      },
      set(weaponAttack: number) {
        weaponAttack = calc.fixValue(weaponAttack * 5, 0, 2499) / 5;
        this.setWeaponAttack(weaponAttack, this.target);
      }
    },
    weaponElement: {
      get() {
        return this.sharedState.unitData[this.target].weaponElement;
      },
      set(weaponElement: number) {
        this.setWeaponElement(weaponElement, this.target);
      }
    },
    equipmentAttack: {
      get() {
        return this.sharedState.unitData[this.target].equipmentAttack;
      },
      set(equipmentAttack: number) {
        equipmentAttack = calc.fixValue(equipmentAttack * 5, 0, 2499) / 5;
        this.setEquipmentAttack(equipmentAttack, this.target);
      }
    },
    equipmentSlayer: {
      get() {
        return this.sharedState.unitData[this.target].equipmentSlayer;
      },
      set(equipmentSlayer: number) {
        this.setEquipmentSlayer(equipmentSlayer, this.target);
      }
    },
    armorDefense1: {
      get() {
        return this.sharedState.unitData[this.target].armorDefense1;
      },
      set(armorDefense1: number) {
        armorDefense1 = calc.fixValue(armorDefense1 * 5, 0, 2499) / 5;
        this.setArmorDefense1(armorDefense1, this.target);
      }
    },
    armorDefense2: {
      get() {
        return this.sharedState.unitData[this.target].armorDefense2;
      },
      set(armorDefense2: number) {
        armorDefense2 = calc.fixValue(armorDefense2 * 5, 0, 2499) / 5;
        this.setArmorDefense2(armorDefense2, this.target);
      }
    },
    equipmentDefense: {
      get() {
        return this.sharedState.unitData[this.target].equipmentDefense;
      },
      set(equipmentDefense: number) {
        equipmentDefense = calc.fixValue(equipmentDefense * 5, 0, 2499) / 5;
        this.setEquipmentDefense(equipmentDefense, this.target);
      }
    },
    equipmentGuard: {
      get() {
        return this.sharedState.unitData[this.target].equipmentGuard;
      },
      set(equipmentGuard: number) {
        this.setEquipmentGuard(equipmentGuard, this.target);
      }
    },
    weaponSkillLv: {
      get() {
        return this.sharedState.unitData[this.target].weaponSkillLv;
      },
      set(weaponSkillLv: number) {
        this.setWeaponSkillLv(weaponSkillLv, this.target);
      }
    },
    counterLv: {
      get() {
        return this.sharedState.unitData[this.target].counterLv;
      },
      set(counterLv: number) {
        this.setCounterLv(counterLv, this.target);
      }
    },
    charge: {
      get() {
        return this.sharedState.unitData[this.target].charge;
      },
      set(charge: number) {
        this.setCharge(charge, this.target);
      }
    },
    direction: {
      get() {
        return this.sharedState.unitData[this.target].direction;
      },
      set(direction: number) {
        this.setDirection(direction, this.target);
      }
    },
    isDying: {
      get() {
        return this.sharedState.unitData[this.target].isDying;
      },
      set(isDying: boolean) {
        this.setIsDying(isDying, this.target);
      }
    },
    isWeekElement: {
      get() {
        return this.sharedState.unitData[this.target].isWeekElement;
      },
      set(isWeekElement: boolean) {
        this.setIsWeekElement(isWeekElement, this.target);
      }
    },
    isResistElement: {
      get() {
        return this.sharedState.unitData[this.target].isResistElement;
      },
      set(isResistElement: boolean) {
        this.setIsResistElement(isResistElement, this.target);
      }
    }
  }
});
</script>
