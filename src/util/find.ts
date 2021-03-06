import { UnitData, ClassData, AbilityData } from "@/types";
import * as formItems from "@/assets/formItems";
import unitDataList from "@/assets/unitData.json";
import classDataList from "@/assets/classData.json";
import abilityDataList from "@/assets/abilityData.json";

export const slayerAndGuard = (id: number): string => {
  const data = formItems.slayerAndGuard.find(data => data.id === id);
  return data?.name ? data.name : "無";
};

export const unitData = (name: string): UnitData => {
  return unitDataList.find(data => data.name === name)!;
};

export const classData = (name: string): ClassData => {
  return classDataList.find(data => data.className === name)!;
};

export const abilityData = (name: string): AbilityData => {
  return abilityDataList.find(data => data.name === name)!;
};
