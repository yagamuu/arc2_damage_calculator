import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import store from "./store";
import * as calc from "@/util/calc";
import * as find from "@/util/find";
import unitDataList from "@/assets/unitData.json";
import classDataList from "@/assets/classData.json";
import initUnitLvList from "@/assets/initUnitLv.json";
import * as formItems from "@/assets/formItems";
import { ClassData, StateCheckboxInterface } from "@/types";
import { NormalAttackStateUnitData } from "@/types/NormalAttack/State";

@Component
export class Mixin extends Vue {
  privateState = {};
  sharedState = store.state;
  unitDataList = unitDataList;
  classDataList: Array<ClassData> = classDataList;
  unitNameList = [...unitDataList].map(value => value.name);
  initUnitLvList = initUnitLvList;

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

  setDebuff(debuff: number, key: string) {
    store.setDebuffAction(debuff, key);
  }

  setAttackBuff(attackBuff: number, key: string) {
    store.setAttackBuffAction(attackBuff, key);
  }

  setDefenseBuff(defenseBuff: number, key: string) {
    store.setDefenseBuffAction(defenseBuff, key);
  }

  setIsWeekEnemy(isWeekEnemy: boolean, key: string) {
    store.setIsWeekEnemyAction(isWeekEnemy, key);
  }

  setIsPoison(isPoison: boolean, key: string) {
    store.setIsPoisonAction(isPoison, key);
  }

  setIsCounter(isCounter: boolean, key: string) {
    store.setIsCounter(isCounter, key);
  }

  setIsNoWeapon(isNoWeapon: boolean, key: string) {
    store.setIsNoWeaponAction(isNoWeapon, key);
  }

  setIsNoArmor(isNoArmor: boolean, key: string) {
    store.setIsNoArmorAction(isNoArmor, key);
  }

  setIsCritical(isCritical: boolean, key: string) {
    store.setIsCriticalAction(isCritical, key);
  }

  setIsBonusToFlyable(isBonusToFlyable: boolean, key: string) {
    store.setIsBonusToFlyableAction(isBonusToFlyable, key);
  }

  setWeaponAttack(weaponAttack: number, key: string) {
    store.setWeaponAttackAction(weaponAttack, key);
  }

  setWeaponElement(weaponElement: number, key: string) {
    store.setWeaponElementAction(weaponElement, key);
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

  setWeaponSkillLv(weaponSkillLv: number, key: string) {
    store.setWeaponSkillLvAction(weaponSkillLv, key);
  }

  setCounterLv(counterLv: number, key: string) {
    store.setCounterLvAction(counterLv, key);
  }

  setCharge(charge: number, key: string) {
    store.setChargeAction(charge, key);
  }

  setDirection(direction: number, key: string) {
    store.setDirectionAction(direction, key);
  }

  setIsDying(isDying: boolean, key: string) {
    store.setIsDyingAction(isDying, key);
  }

  setIsWeekElement(isWeekElement: boolean, key: string) {
    store.setIsWeekElementAction(isWeekElement, key);
  }

  setIsResistElement(isResistElement: boolean, key: string) {
    store.setIsResistElementAction(isResistElement, key);
  }

  setDamageResult(damageResult: number[][]) {
    store.setDamageResultAction(damageResult);
  }

  setUnitDataAll(
    attack: NormalAttackStateUnitData,
    defense: NormalAttackStateUnitData
  ) {
    store.setUnitDataAllAction(attack, defense);
  }

  setCheckboxAll(
    attack: StateCheckboxInterface,
    defense: StateCheckboxInterface
  ) {
    store.setCheckboxAllAction(attack, defense);
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

    if (
      classData.counterLv3 &&
      store.state.unitData[key].lv >= classData.counterLv3
    ) {
      store.setCounterLvAction(3, key);
    } else if (
      classData.counterLv2 &&
      store.state.unitData[key].lv >= classData.counterLv2
    ) {
      store.setCounterLvAction(2, key);
    } else if (
      classData.counterLv1 &&
      store.state.unitData[key].lv >= classData.counterLv1
    ) {
      store.setCounterLvAction(1, key);
    } else {
      store.setCounterLvAction(0, key);
    }
  }

  updateLvAndCheckboxFromUnitName(key: string) {
    const unitName = store.state.unitData[key].unitName;
    const unitData = find.unitData(unitName);

    const initUnitLv = unitData?.bookLv
      ? unitData?.bookLv
      : initUnitLvList.find(data => data.unitName === unitName)?.lv;

    if (!initUnitLv) {
      return;
    }

    store.setLvAction(initUnitLv, key);
    store.setAppearanceLvAction(initUnitLv, key);

    const isCheckAppearAppearanceLv = unitData?.bookLv ? false : true;
    store.setAppearanceLvCheckboxAction(isCheckAppearAppearanceLv, key);
  }

  updateDamageResult() {
    const attackUnitData = find.unitData(store.state.unitData.attack.unitName);
    const attackClassData = find.classData(attackUnitData.className);

    const defenseUnitData = find.unitData(
      store.state.unitData.defense.unitName
    );
    const defenseClassData = find.classData(defenseUnitData.className);

    const baseAttack = calc.calcBasicAttack(
      store.state,
      attackUnitData!,
      attackClassData!
    );

    const attack = calc.calcAttack(baseAttack, store.state);

    const baseDefense = calc.calcBasicDefense(
      store.state,
      defenseUnitData!,
      defenseClassData!
    );

    const isNoArmor =
      store.state.unitData.defense.isNoArmor ||
      !defenseUnitData?.isEquipableArmor;
    const defense = calc.calcDefense(baseDefense, store.state, isNoArmor);

    const isNoWeapon = store.state.unitData.attack.isNoWeapon;
    let attackElement =
      store.state.unitData.attack.weaponElement !== 0 && !isNoWeapon
        ? formItems.weaponElement[store.state.unitData.attack.weaponElement]
            .name
        : attackUnitData?.element;
    attackElement =
      !isNoWeapon && store.state.unitData.attack.isBonusToFlyable
        ? "飛行敵"
        : attackElement;

    let isWeekElement = false;
    if (
      !isNoWeapon &&
      store.state.unitData.attack.isBonusToFlyable &&
      defenseUnitData?.isFlyable
    ) {
      isWeekElement = true;
    } else if (store.state.unitData.defense.isWeekElement) {
      isWeekElement = true;
    }

    let isResistElement = false;
    if (
      attackElement !== "無" &&
      (attackElement === defenseUnitData?.element ||
        store.state.unitData.defense.isResistElement)
    ) {
      isResistElement = true;
    }

    let directionPow = 1;
    switch (store.state.unitData.attack.direction) {
      case 0:
        directionPow = defenseUnitData?.frontDamegeScale!;
        break;
      case 1:
        directionPow = defenseUnitData?.sideDamegeScale!;
        break;
      case 2:
        directionPow = defenseUnitData?.backDamegeScale!;
        break;
    }

    const isSlayer =
      !isNoWeapon &&
      find.slayerAndGuard(store.state.unitData.attack.equipmentSlayer) ===
        defenseUnitData?.slayer
        ? true
        : false;
    const isGuard =
      !store.state.unitData.defense.isNoArmor &&
      find.slayerAndGuard(store.state.unitData.defense.equipmentGuard) ===
        attackUnitData?.slayer
        ? true
        : false;

    const basicDamage = calc.calcBasicDamage(
      attack,
      store.state.unitData.attack.baseAttack
    );
    const addDamage = calc.calcAddDamage(
      basicDamage,
      attack,
      store.state.unitData.attack.baseAttack,
      defense,
      store.state.unitData.defense.isDying,
      isWeekElement
    );
    const damage = calc.calcConditionDamage(
      addDamage,
      isResistElement,
      directionPow,
      store.state.unitData.attack.charge,
      isSlayer,
      isGuard,
      store.state.unitData.attack.isCounter
    );

    this.setDamageResult(damage);
  }

  @Watch("sharedState.unitData", { deep: true, immediate: true })
  onChangeUnitData() {
    this.updateDamageResult();
  }
}
