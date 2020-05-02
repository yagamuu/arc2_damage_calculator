import { StateUnitData } from "@/types";

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
  damageResult: number[][];
}
