// チャージ補正
export const chargePow = [
  1,
  1.75,
  2,
  2.25,
  2.5,
  4,
  4.5,
  6,
  4.5,
  4.563,
  5.25,
  2.063,
  2.063,
  0,
  0.125,
  0
];

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

/**
 * 基本ダメージを計算
 * @param {number} attack 最終攻撃力
 * @param {number} baseAttack 基本攻撃力内部値
 * @return {number[][]} 計算結果(number[i][j],iが乱数部分,jがコンボパターン)
 */
export const calcBasicDamage = (
  attack: number,
  baseAttack: number
): number[][] => {
  const damageResult: number[][] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 6; j++) {
      damageResult[i][j] = Math.floor(
        (1 + 0.1 * j) *
          10 *
          0.01 *
          (attack + Math.floor(0.125 * baseAttack * i))
      );
    }
  }
  return damageResult;
};

/**
 * 防御力を考慮したダメージを計算し追加
 * @param {number[][]} damageList ダメージ配列
 * @param {number} attack 最終攻撃力
 * @param {number} baseAttack 基本攻撃力内部値
 * @param {number} defense 最終防御力
 * @param {boolean} isDying 瀕死
 * @param {boolean} isWeekElement 属性弱点
 * @return {number[][]} 計算結果(number[i][j],iが乱数部分,jがコンボパターン)
 */
export const calcAddDamage = (
  damageList: number[][],
  attack: number,
  baseAttack: number,
  defense: number,
  isDying: boolean,
  isWeekElement: boolean
): number[][] => {
  const damageResult: number[][] = [];
  const dyingPow = isDying ? 1.25 : 1;
  const weekElementPow = isWeekElement ? 1.25 : 1;
  for (let i = 0; i < 8; i++) {
    let addDamage = Math.floor(
      3 *
        0.1 *
        (Math.floor(0.125 * baseAttack * i) +
          attack -
          Math.floor(defense * dyingPow))
    );
    if (addDamage < 0) {
      addDamage = 0;
    }
    addDamage = Math.floor(addDamage * weekElementPow);
    for (let j = 0; j < 6; j++) {
      //基本ダメージに追加ダメージを加算する
      damageResult[i][j] = damageList[i][j] + addDamage;
    }
  }
  return damageResult;
};

/**
 * 各種条件を考慮したダメージを計算し反映
 * @param {number[][]} damageList ダメージ配列
 * @param {boolean} isResistElement 属性耐性
 * @param {number} directionPow 方向補正
 * @param {number} charge チャージ
 * @param {boolean} isSlayer スレイヤー装備補正
 * @param {boolean} isGuard ガード装備補正
 * @return {number[][]} 計算結果(number[i][j],iが乱数部分,jがコンボパターン)
 */
export const calcConditionDamage = (
  damageList: number[][],
  isResistElement: boolean,
  directionPow: number,
  charge: number,
  isSlayer: boolean,
  isGuard: boolean
): number[][] => {
  const damageResult: number[][] = [];
  const resistElementPow = isResistElement ? 0.8 : 1;
  const slayerPow = isSlayer ? 1.5 : 1;
  const guardPow = isGuard ? 0.5 : 1;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 6; j++) {
      damageResult[i][j] =
        Math.ceil(
          Math.floor(
            Math.floor(
              Math.floor(
                Math.floor(damageList[i][j] * resistElementPow) * directionPow
              ) * chargePow[charge]
            ) * slayerPow
          ) * guardPow
        ) + 1;
      if (damageResult[i][j] > 32767) {
        damageResult[i][j] = damageResult[i][j] - 65536;
      }
    }
  }
  return damageResult;
};
