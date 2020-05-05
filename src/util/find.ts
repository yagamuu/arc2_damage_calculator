import { UnitData, ClassData } from "@/types";
import * as formItems from "@/assets/formItems";
import unitDataList from "@/assets/unitData.json";
import classDataList from "@/assets/classData.json";

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

export const skillPattern = [
  [100, 0, 0, 0, 0, 0, 0, 0],
  [87.5, 12.5, 0, 0, 0, 0, 0, 0],
  [75, 12.5, 6.25, 0, 6.25, 0, 0, 0],
  [62.5, 12.5, 12.5, 0, 12.5, 0, 0, 0],
  [62.5, 12.5, 12.5, 0, 12.5, 0, 0, 0],
  [12.5, 62.5, 12.5, 0, 6.25, 6.25, 0, 0],
  [12.5, 62.5, 12.5, 0, 6.25, 6.25, 0, 0],
  [12.5, 62.5, 12.5, 0, 0, 12.5, 0, 0],
  [0, 62.5, 12.5, 12.5, 0, 12.5, 0, 0],
  [0, 12.5, 62.5, 12.5, 0, 6.25, 6.25, 0],
  [0, 12.5, 62.5, 12.5, 0, 6.25, 6.25, 0],
  [0, 12.5, 62.5, 12.5, 0, 0, 12.5, 0],
  [0, 12.5, 62.5, 12.5, 0, 0, 12.5, 0],
  [0, 12.5, 62.5, 12.5, 0, 0, 6.25, 6.25],
  [0, 12.5, 62.5, 12.5, 0, 0, 6.25, 6.25],
  [0, 0, 37.5, 50, 0, 0, 0, 12.5]
];
