import { StateCheckboxInterface } from "@/types";
import {
  NormalAttackStateUnitData,
  NormalAttackStateInterface
} from "@/types/NormalAttack/State";
import { initDamageResult } from "@/util/calc";

const initUnitData = (): NormalAttackStateUnitData => {
  return {
    unitName: "アーク",
    lv: 47,
    appearanceLv: 47,
    baseAttack: 123,
    baseDefense: 112,
    debuff: 0,
    attackBuff: 0,
    defenseBuff: 0,
    isWeekEnemy: false,
    isPoison: false,
    isNoWeapon: false,
    isNoArmor: false,
    isCritical: false,
    isBonusToFlyable: false,
    weaponAttack: 0,
    weaponElement: 0,
    equipmentAttack: 0,
    equipmentSlayer: 0,
    armorDefense1: 0,
    armorDefense2: 0,
    equipmentDefense: 0,
    equipmentGuard: 0,
    weaponSkillLv: 1,
    counterLv: 2,
    charge: 0,
    direction: 0,
    isDying: false,
    isWeekElement: false,
    isResistElement: false,
    isCounter: false
  };
};

const state: NormalAttackStateInterface = {
  unitData: {
    attack: initUnitData(),
    defense: initUnitData()
  },
  checkbox: {
    attack: {
      appearanceLv: true,
      baseAttack: false,
      baseDefense: false
    },
    defense: {
      appearanceLv: true,
      baseAttack: false,
      baseDefense: false
    }
  },
  damageResult: initDamageResult()
};

export default {
  state,
  initUnitDataAction() {
    this.state.unitData.attack = initUnitData();
    this.state.unitData.defense = initUnitData();
  },
  swapUnitDataAction() {
    const temp = this.state.unitData.attack;
    this.state.unitData.attack = this.state.unitData.defense;
    this.state.unitData.defense = temp;
  },
  setUnitDataAllAction(
    attack: NormalAttackStateUnitData,
    defense: NormalAttackStateUnitData
  ) {
    this.state.unitData.attack = attack;
    this.state.unitData.defense = defense;
  },
  setUnitNameAction(unitName: string, key: string) {
    this.state.unitData[key].unitName = unitName;
  },
  setLvAction(lv: number, key: string) {
    this.state.unitData[key].lv = lv;
  },
  setAppearanceLvAction(appearanceLv: number, key: string) {
    this.state.unitData[key].appearanceLv = appearanceLv;
  },
  setBaseAttackAction(baseAttack: number, key: string) {
    this.state.unitData[key].baseAttack = baseAttack;
  },
  setBaseDefenseAction(baseDefense: number, key: string) {
    this.state.unitData[key].baseDefense = baseDefense;
  },
  setDebuffAction(debuff: number, key: string) {
    this.state.unitData[key].debuff = debuff;
  },
  setAttackBuffAction(attackBuff: number, key: string) {
    this.state.unitData[key].attackBuff = attackBuff;
  },
  setDefenseBuffAction(defenseBuff: number, key: string) {
    this.state.unitData[key].defenseBuff = defenseBuff;
  },
  setIsWeekEnemyAction(isWeekEnemy: boolean, key: string) {
    this.state.unitData[key].isWeekEnemy = isWeekEnemy;
  },
  setIsPoisonAction(isPoison: boolean, key: string) {
    this.state.unitData[key].isPoison = isPoison;
  },
  setIsNoWeaponAction(isNoWeapon: boolean, key: string) {
    this.state.unitData[key].isNoWeapon = isNoWeapon;
  },
  setIsNoArmorAction(isNoArmor: boolean, key: string) {
    this.state.unitData[key].isNoArmor = isNoArmor;
  },
  setIsCriticalAction(isCritical: boolean, key: string) {
    this.state.unitData[key].isCritical = isCritical;
  },
  setIsBonusToFlyableAction(isBonusToFlyable: boolean, key: string) {
    this.state.unitData[key].isBonusToFlyable = isBonusToFlyable;
  },
  setWeaponAttackAction(weaponAttack: number, key: string) {
    this.state.unitData[key].weaponAttack = weaponAttack;
  },
  setWeaponElementAction(weaponElement: number, key: string) {
    this.state.unitData[key].weaponElement = weaponElement;
  },
  setEquipmentAttackAction(equipmentAttack: number, key: string) {
    this.state.unitData[key].equipmentAttack = equipmentAttack;
  },
  setEquipmentSlayerAction(equipmentSlayer: number, key: string) {
    this.state.unitData[key].equipmentSlayer = equipmentSlayer;
  },
  setArmorDefense1Action(armorDefense1: number, key: string) {
    this.state.unitData[key].armorDefense1 = armorDefense1;
  },
  setArmorDefense2Action(armorDefense2: number, key: string) {
    this.state.unitData[key].armorDefense2 = armorDefense2;
  },
  setEquipmentDefenseAction(equipmentDefense: number, key: string) {
    this.state.unitData[key].equipmentDefense = equipmentDefense;
  },
  setEquipmentGuardAction(equipmentGuard: number, key: string) {
    this.state.unitData[key].equipmentGuard = equipmentGuard;
  },
  setWeaponSkillLvAction(weaponSkillLv: number, key: string) {
    this.state.unitData[key].weaponSkillLv = weaponSkillLv;
  },
  setCounterLvAction(counterLv: number, key: string) {
    this.state.unitData[key].counterLv = counterLv;
  },
  setChargeAction(charge: number, key: string) {
    this.state.unitData[key].charge = charge;
  },
  setDirectionAction(direction: number, key: string) {
    this.state.unitData[key].direction = direction;
  },
  setIsDyingAction(isDying: boolean, key: string) {
    this.state.unitData[key].isDying = isDying;
  },
  setIsWeekElementAction(isWeekElement: boolean, key: string) {
    this.state.unitData[key].isWeekElement = isWeekElement;
  },
  setIsResistElementAction(isResistElement: boolean, key: string) {
    this.state.unitData[key].isResistElement = isResistElement;
  },
  setCheckboxAllAction(
    attack: StateCheckboxInterface,
    defense: StateCheckboxInterface
  ) {
    this.state.checkbox.attack = attack;
    this.state.checkbox.defense = defense;
  },
  setAppearanceLvCheckboxAction(appearanceLv: boolean, key: string) {
    this.state.checkbox[key].appearanceLv = appearanceLv;
  },
  setBaseAttackCheckboxAction(baseAttack: boolean, key: string) {
    this.state.checkbox[key].baseAttack = baseAttack;
  },
  setBaseDefenseCheckboxAction(baseDefense: boolean, key: string) {
    this.state.checkbox[key].baseDefense = baseDefense;
  },
  setDamageResultAction(damageResult: number[][]) {
    this.state.damageResult = damageResult;
  },
  setIsCounter(isCounter: boolean, key: string) {
    this.state.unitData[key].isCounter = isCounter;
  }
};
