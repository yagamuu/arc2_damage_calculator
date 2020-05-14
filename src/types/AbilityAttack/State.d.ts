import { StateCheckboxInterface, StateUnitData } from "@/types";

export interface AbilityAttackStateUnitData extends StateUnitData {
  abilityName: string;
  abilityLv: number;
  baseMagic: number;
  magicBuff: number;
  equipmentMagic: number;
  equipmentMagicDefense: number;
}

export interface AbilityAttackStateCheckboxInterface
  extends StateCheckboxInterface {
  baseMagic: boolean;
}

export interface AbilityAttackStateInterface {
  unitData: {
    [key: string]: AbilityAttackStateUnitData;
    attack: AbilityAttackStateUnitData;
    defense: AbilityAttackStateUnitData;
  };
  checkbox: {
    [key: string]: AbilityAttackStateCheckboxInterface;
    attack: AbilityAttackStateCheckboxInterface;
    defense: AbilityAttackStateCheckboxInterface;
  };
  damageResult: number[];
}
