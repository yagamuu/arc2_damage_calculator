import { StateCheckboxInterface, StateUnitData } from "@/types";

export interface NormalAttackStateUnitData extends StateUnitData {
  isCritical: boolean;
  isBonusToFlyable: boolean;
  weaponElement: number;
  weaponSkillLv: number;
  counterLv: number;
  charge: number;
  direction: number;
  isDying: boolean;
  isCounter: boolean;
}

export interface NormalAttackStateInterface {
  unitData: {
    [key: string]: NormalAttackStateUnitData;
    attack: NormalAttackStateUnitData;
    defense: NormalAttackStateUnitData;
  };
  checkbox: {
    [key: string]: StateCheckboxInterface;
    attack: StateCheckboxInterface;
    defense: StateCheckboxInterface;
  };
  damageResult: number[][];
}
