/**
 * 値のデータ型を修正+正しいデータ範囲内に修正
 * @param {number} value 元の値
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @return {number} 計算結果
 */
const fixValue = (value, min, max) => {
  value = parseFloat(value);
  if (isNaN(value)) {
    value = min;
  }
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
const calcParameter = (
  baseValue,
  appearanceLv,
  hasAppearanceLvBonus,
  lv,
  growValue
) => {
  baseValue = hasAppearanceLvBonus
    ? baseValue + Math.floor((appearanceLv - 1) / 4)
    : baseValue;
  return baseValue + (lv - 1) * growValue;
};

/**
 * 現在の基礎パラメーターを計算(ウィークエネミー時)
 * @param {number} baseValue クラス別の初期パラメーター
 * @param {number} appearanceLv 登場Lv
 * @param {boolean} hasAppearanceLvBonus 登場Lvボーナスの有無
 * @param {number} lv 現在Lv
 * @param {number} growValue 成長値
 * @return {number} 計算結果
 */
const calcParameterWithWeekEnemy = (
  baseValue,
  appearanceLv,
  hasAppearanceLvBonus,
  lv,
  growValue
) => {
  baseValue = hasAppearanceLvBonus
    ? baseValue + Math.floor((appearanceLv - 1) / 16)
    : baseValue;
  return baseValue + Math.floor((lv - 1) / 4) * growValue;
};

const damage = mode => {
  const attacker = {};
  attacker.name = "unitData[state.unitName]";
  attacker.class = "attacker.className";
  attacker.lv = fixValue("state.lv", 1, 1000);
  attacker.appearanceLv = fixValue("state.appearanceLv", 1, 1000);
  attacker.element = "state.element";
  attacker.baseAttack = calcParameter(
    "classData[attacker.class].baseAttack",
    attacker.appearanceLv,
    "classData[attacker.class].hasAppearanceLvBonusAttack",
    attacker.lv,
    "classData[attacker.class].growAttack"
  );
  attacker.baseAttack = fixValue(attacker.baseAttack, 1, 2499);
  // 基本攻撃力内部値は普通にstateから取ってくる、上のは各データ入力時の修正処理とする
  // A=基本攻撃力内部値*基本攻撃力修正値、1~2499
  // ウィークエネミー時の攻撃力計算処理、ヘモジー、毒、攻撃バフは無視される
  // ヘモジー=0.75倍
  // 毒=0.85倍
  // 攻撃力上昇=1.25倍、低下=0.75倍

  // ここから武器補正

  // 武器なしor刀破斬=装備上昇分のみ
  // ここまでの攻撃力 = 基礎攻撃力+装備分
  // 飛行敵ダメ増は属性扱いでこっちのが優先度が高い
};
