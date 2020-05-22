import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import store from "./store";
import * as calc from "@/util/calc";
import * as find from "@/util/find";
import unitDataList from "@/assets/unitData.json";
import classDataList from "@/assets/classData.json";
import initUnitLvList from "@/assets/initUnitLv.json";
import abilityDataList from "@/assets/abilityData.json";
import { ClassData } from "@/types";
import {
  AbilityAttackStateUnitData,
  AbilityAttackStateCheckboxInterface
} from "@/types/AbilityAttack/State";

@Component
export class Mixin extends Vue {
  privateState = {};
  sharedState = store.state;
  unitDataList = unitDataList;
  unitNameList = [...unitDataList].map(value => value.name);
  classDataList: Array<ClassData> = classDataList;
  initUnitLvList = initUnitLvList;
  abilityDataList = abilityDataList;
  abilityNameList = [...abilityDataList].map(value => value.name);

  get abilityList(): Array<string> {
    if (this.sharedState.unitData.attack.unitName === "ヂークベック") {
      return this.abilityNameList;
    }
    const unitData = find.unitData(this.sharedState.unitData.attack.unitName);
    const classData = find.classData(unitData.className);

    const list = [
      unitData.abilityName1,
      unitData.abilityName2,
      unitData.abilityName3,
      unitData.abilityName4,
      unitData.abilityName5,
      unitData.abilityName6,
      unitData.abilityName7,
      unitData.abilityName8,
      classData.addAbilityName1,
      classData.addAbilityName2,
      classData.addAbilityName3,
      classData.addAbilityName4,
      classData.addAbilityName5,
      classData.addAbilityName6
    ];

    const abilityList = list.filter(
      (v): v is string => v !== null && this.abilityNameList.includes(v)
    );

    return abilityList.length > 0 ? abilityList : this.abilityNameList;
  }

  initUnitData() {
    store.initUnitDataAction();
  }

  swapUnitData() {
    store.swapUnitDataAction();
  }

  setUnitName(unitName: string, key: string) {
    store.setUnitNameAction(unitName, key);
    this.updateLvAndCheckboxFromUnitName(key);
    this.updateParam(key);

    if (key === "attack") {
      this.setAbilityName(this.abilityList[0], "attack");
    }
  }

  setAbilityName(abilityName: string, key: string) {
    store.setAbilityNameAction(abilityName, key);
  }

  setAbilityLv(abilityLv: number, key: string) {
    store.setAbilityLvAction(abilityLv, key);
  }

  setLv(lv: number, key: string) {
    store.setLvAction(lv, key);
    if (store.state.checkbox[key].appearanceLv == false) {
      store.setAppearanceLvAction(lv, key);
    }
    this.updateParam(key);
  }

  setAppearanceLv(appearanceLv: number, key: string) {
    store.setAppearanceLvAction(appearanceLv, key);
    this.updateParam(key);
  }

  setAppearanceLvCheckbox(appearanceLv: boolean, key: string) {
    store.setAppearanceLvCheckboxAction(appearanceLv, key);
  }

  setBaseAttack(baseAttack: number, key: string) {
    store.setBaseAttackAction(baseAttack, key);
  }

  setBaseAttackCheckbox(baseAttack: boolean, key: string) {
    store.setBaseAttackCheckboxAction(baseAttack, key);
  }

  setBaseDefense(baseDefense: number, key: string) {
    store.setBaseDefenseAction(baseDefense, key);
  }

  setBaseDefenseCheckbox(baseDefense: boolean, key: string) {
    store.setBaseDefenseCheckboxAction(baseDefense, key);
  }

  setBaseMagic(baseMagic: number, key: string) {
    store.setBaseMagicAction(baseMagic, key);
  }

  setBaseMagicCheckbox(baseMagic: boolean, key: string) {
    store.setBaseMagicCheckboxAction(baseMagic, key);
  }

  setDebuff(debuff: number, key: string) {
    store.setDebuffAction(debuff, key);
  }

  setAttackBuff(attackBuff: number, key: string) {
    store.setAttackBuffAction(attackBuff, key);
  }

  setDefenseBuff(defenseBuff: number, key: string) {
    store.setDefenseBuffAction(defenseBuff, key);
  }

  setMagicBuff(magicBuff: number, key: string) {
    store.setMagicBuffAction(magicBuff, key);
  }

  setIsWeekEnemy(isWeekEnemy: boolean, key: string) {
    store.setIsWeekEnemyAction(isWeekEnemy, key);
  }

  setIsPoison(isPoison: boolean, key: string) {
    store.setIsPoisonAction(isPoison, key);
  }

  setIsNoWeapon(isNoWeapon: boolean, key: string) {
    store.setIsNoWeaponAction(isNoWeapon, key);
  }

  setIsNoArmor(isNoArmor: boolean, key: string) {
    store.setIsNoArmorAction(isNoArmor, key);
  }

  setWeaponAttack(weaponAttack: number, key: string) {
    store.setWeaponAttackAction(weaponAttack, key);
  }

  setEquipmentAttack(equipmentAttack: number, key: string) {
    store.setEquipmentAttackAction(equipmentAttack, key);
  }

  setEquipmentSlayer(equipmentSlayer: number, key: string) {
    store.setEquipmentSlayerAction(equipmentSlayer, key);
  }

  setArmorDefense1(armorDefense1: number, key: string) {
    store.setArmorDefense1Action(armorDefense1, key);
  }

  setArmorDefense2(armorDefense2: number, key: string) {
    store.setArmorDefense2Action(armorDefense2, key);
  }

  setEquipmentDefense(equipmentDefense: number, key: string) {
    store.setEquipmentDefenseAction(equipmentDefense, key);
  }

  setEquipmentGuard(equipmentGuard: number, key: string) {
    store.setEquipmentGuardAction(equipmentGuard, key);
  }

  setIsWeekElement(isWeekElement: boolean, key: string) {
    store.setIsWeekElementAction(isWeekElement, key);
  }

  setIsResistElement(isResistElement: boolean, key: string) {
    store.setIsResistElementAction(isResistElement, key);
  }

  setEquipmentMagic(equipmentMagic: number, key: string) {
    store.setEquipmentMagicAction(equipmentMagic, key);
  }

  setEquipmentMagicDefense(equipmentMagicDefense: number, key: string) {
    store.setEquipmentMagicDefenseAction(equipmentMagicDefense, key);
  }

  setDamageResult(damageResult: number[]) {
    store.setDamageResultAction(damageResult);
  }

  setUnitDataAll(
    attack: AbilityAttackStateUnitData,
    defense: AbilityAttackStateUnitData
  ) {
    store.setUnitDataAllAction(attack, defense);
  }

  setCheckboxAll(
    attack: AbilityAttackStateCheckboxInterface,
    defense: AbilityAttackStateCheckboxInterface
  ) {
    store.setCheckboxAllAction(attack, defense);
  }

  updateLvAndCheckboxFromUnitName(key: string) {
    const unitName = store.state.unitData[key].unitName;
    const unitData = this.unitDataList.find(data => data.name === unitName);

    if (unitData?.bookLv) {
      store.setLvAction(unitData.bookLv, key);
      store.setAppearanceLvAction(unitData.bookLv, key);
      store.setAppearanceLvCheckboxAction(false, key);
      return;
    }

    const initUnitLv = initUnitLvList.find(data => data.unitName === unitName)
      ?.lv;
    if (!initUnitLv) {
      return;
    }
    store.setLvAction(initUnitLv, key);
    store.setAppearanceLvAction(initUnitLv, key);
    store.setAppearanceLvCheckboxAction(true, key);
  }

  updateParam(key: string) {
    const unitName = store.state.unitData[key].unitName;
    const unitData = this.unitDataList.find(data => data.name === unitName);
    const classData = classDataList.find(
      data => data.className === unitData?.className
    );
    if (classData === undefined) {
      return;
    }
    if (store.state.checkbox[key].baseAttack === false) {
      const baseAttack = calc.calcParameter(
        classData.baseAttack,
        store.state.unitData[key].appearanceLv,
        classData?.hasAppearanceLvAttackBonus,
        store.state.unitData[key].lv,
        classData?.growAttack
      );
      store.setBaseAttackAction(calc.fixValue(baseAttack, 1, 2499), key);
    }
    if (store.state.checkbox[key].baseDefense === false) {
      const baseDefense = calc.calcParameter(
        classData.baseDefense,
        store.state.unitData[key].appearanceLv,
        classData?.hasAppearanceLvDefenseBonus,
        store.state.unitData[key].lv,
        classData?.growDefense
      );
      store.setBaseDefenseAction(calc.fixValue(baseDefense, 1, 2499), key);
    }
    if (store.state.checkbox[key].baseMagic === false) {
      const baseMagic = calc.calcParameter(
        classData.baseMagic,
        store.state.unitData[key].appearanceLv,
        classData?.hasAppearanceLvMagicBonus,
        store.state.unitData[key].lv,
        classData?.growMagic
      );
      store.setBaseMagicAction(calc.fixValue(baseMagic, 1, 2499), key);
    }
  }

  updateDamageResult() {
    const attackUnitData = find.unitData(store.state.unitData.attack.unitName);
    const attackClassData = find.classData(attackUnitData.className);

    const defenseUnitData = find.unitData(
      store.state.unitData.defense.unitName
    );
    const defenseClassData = find.classData(defenseUnitData.className);

    const abilityData = find.abilityData(
      store.state.unitData.attack.abilityName
    );

    let power = 0;
    let difference = 0;
    // 最終攻撃値/能力差値
    if (abilityData.type === "攻撃力") {
      const baseAttack = calc.calcBasicAttack(
        store.state,
        attackUnitData!,
        attackClassData!
      );
      const attack = calc.calcAttack(baseAttack, store.state);
      power = Math.floor(attack / 5);

      const baseMagic = calc.calcBasicMagic(
        store.state.unitData.attack,
        attackUnitData!,
        attackClassData!
      );
      const magic = calc.calcMagic(
        baseMagic,
        store.state.unitData.attack.equipmentMagic
      );

      const baseDefense = calc.calcBasicDefense(
        store.state,
        defenseUnitData!,
        defenseClassData!
      );
      const isNoArmor =
        store.state.unitData.defense.isNoArmor ||
        !defenseUnitData?.isEquipableArmor;
      const defense = calc.calcDefense(baseDefense, store.state, isNoArmor);

      difference = magic - defense;
    } else {
      const attackerBaseMagic = calc.calcBasicMagic(
        store.state.unitData.attack,
        attackUnitData!,
        attackClassData!
      );
      const attackerMagic = calc.calcMagic(
        attackerBaseMagic,
        store.state.unitData.attack.equipmentMagic
      );
      power = Math.floor(attackerMagic / 5);

      const defenderBaseMagic = calc.calcBasicMagic(
        store.state.unitData.defense,
        defenseUnitData!,
        defenseClassData!
      );
      const defenderMagic = calc.calcMagic(
        defenderBaseMagic,
        store.state.unitData.defense.equipmentMagic
      );
      difference = attackerMagic - defenderMagic;
    }

    //MP
    let mp = 0;
    if (store.state.unitData.attack.abilityLv === 1) {
      mp = abilityData.mp1;
    } else if (store.state.unitData.attack.abilityLv === 2) {
      mp = abilityData.mp2;
    } else {
      mp = abilityData.mp3;
    }

    //魔防御
    const baseMagicDefense = defenseUnitData.basicMagicDefense;
    const equipmentMagicDefense = calc.fixValue(
      store.state.unitData.defense.equipmentMagicDefense,
      0,
      5
    );
    const magicDefense = baseMagicDefense + equipmentMagicDefense;

    // 属性弱点
    let isWeekElement = false;
    if (store.state.unitData.defense.isWeekElement) {
      isWeekElement = true;
    }

    // 属性耐性
    const attackElement = abilityData.element;
    let isResistElement = false;
    if (
      attackElement !== "無" &&
      (attackElement === defenseUnitData?.element ||
        store.state.unitData.defense.isResistElement)
    ) {
      isResistElement = true;
    }

    // スレイヤー武器
    const isSlayer =
      !store.state.unitData.attack.isNoWeapon &&
      find.slayerAndGuard(store.state.unitData.attack.equipmentSlayer) ===
        defenseUnitData?.slayer
        ? true
        : false;

    // ガード防具
    const isGuard =
      !store.state.unitData.defense.isNoArmor &&
      find.slayerAndGuard(store.state.unitData.defense.equipmentGuard) ===
        attackUnitData?.slayer
        ? true
        : false;

    const damage = calc.calcAbilityDamage(
      power,
      abilityData.power,
      mp,
      difference,
      magicDefense,
      isSlayer,
      isGuard,
      isWeekElement,
      isResistElement
    );
    this.setDamageResult(damage);
  }

  @Watch("sharedState.unitData", { deep: true, immediate: true })
  onChangeUnitData() {
    this.updateDamageResult();
  }
}
