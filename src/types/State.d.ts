export interface StateUnitData {
  unitName: string;
  lv: number;
  appearanceLv: number;
  baseAttack: number;
  baseDefense: number;
  debuff: number;
  attackBuff: number;
  defenseBuff: number;
  isWeekEnemy: boolean;
  isPoison: boolean;
  isNoWeapon: boolean;
  isNoArmor: boolean;
  weaponAttack: number;
  equipmentAttack: number;
  equipmentSlayer: number;
  armorDefense1: number;
  armorDefense2: number;
  equipmentDefense: number;
  equipmentGuard: number;
  isWeekElement: boolean;
  isResistElement: boolean;
}

export interface StateCheckboxInterface {
  appearanceLv: boolean;
  baseAttack: boolean;
  baseDefense: boolean;
}

export interface StateInterface {
  unitData: {
    [key: string]: StateUnitData;
    attack: StateUnitData;
    defense: StateUnitData;
  };
  checkbox: {
    [key: string]: StateCheckboxInterface;
    attack: StateCheckboxInterface;
    defense: StateCheckboxInterface;
  };
}
