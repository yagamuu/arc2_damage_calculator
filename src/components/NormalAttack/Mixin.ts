import Vue from "vue";
import Component from "vue-class-component";
import store from "./store";
import * as calc from "@/util/calc";
import unitDataList from "@/assets/unitData.json";
import classDataList from "@/assets/classData.json";
import { ClassData } from "@/types";

@Component
export class Mixin extends Vue {
  privateState = {};
  sharedState = store.state;
  classDataList: Array<ClassData> = classDataList;
  unitNameList = [...unitDataList].map(value => value.name);

  initUnitData() {
    store.initUnitDataAction();
  }

  swapUnitData() {
    store.swapUnitDataAction();
  }

  setUnitName(unitName: string, key: string) {
    store.setUnitNameAction(unitName, key);
    const unitData = unitDataList.find(data => data.name === unitName);
    const classData = classDataList.find(
      data => data.className === unitData?.className
    );
    if (classData === undefined) {
      return;
    }
    const baseAttack = calc.calcParameter(
      classData.baseAttack,
      store.state.unitData[key].appearanceLv,
      classData?.hasAppearanceLvAttackBonus,
      store.state.unitData[key].lv,
      classData?.growAttack
    );
    store.setBaseAttackAction(calc.fixValue(baseAttack, 1, 2499), key);
  }

  setLv(lv: number, key: string) {
    store.setLvAction(lv, key);
  }

  setAppearanceLv(appearanceLv: number, key: string) {
    store.setAppearanceLvAction(appearanceLv, key);
  }

  setBaseAttack(baseAttack: number, key: string) {
    store.setBaseAttackAction(baseAttack, key);
  }

  setBaseDefense(baseDefense: number, key: string) {
    store.setBaseDefenseAction(baseDefense, key);
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

  setIsWeekResist(isWeekResist: boolean, key: string) {
    store.setIsWeekResistAction(isWeekResist, key);
  }
}
