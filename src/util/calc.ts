/**
 * 正しいデータ範囲内に修正
 * @param {number} value 元の値
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @return {number} 計算結果
 */
export const fixValue = (value: number, min: number, max: number): number => {
  value = Math.floor(value);
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }

  return value;
};

/**
 * 現在の基礎パラメーターを計算
 * @param {number} baseValue クラス別の初期パラメーター
 * @param {number} appearanceLv 登場Lv
 * @param {boolean} hasAppearanceLvBonus 登場Lvボーナスの有無
 * @param {number} lv 現在Lv
 * @param {number} growValue 成長値
 * @return {number} 計算結果
 */
export const calcParameter = (
  baseValue: number,
  appearanceLv: number,
  hasAppearanceLvBonus: boolean,
  lv: number,
  growValue: number
): number => {
  baseValue = hasAppearanceLvBonus
    ? baseValue + Math.floor((appearanceLv - 1) / 4)
    : baseValue;
  return baseValue + (lv - 1) * growValue;
};
