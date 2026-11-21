import { describe, it, expect } from "vitest";
import * as calc from "@/util/calc";
import * as find from "@/util/find";
import type {
  NormalAttackStateInterface,
  NormalAttackStateUnitData
} from "@/types/NormalAttack/State";

const initialArcUnitData = (): NormalAttackStateUnitData => ({
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
});

describe("通常攻撃", () => {
  it("攻撃側・防御側ともに画面の初期入力(アーク)のとき、熟練Lv1で発生するパターン1・2のダメージが画面の表示と一致する", () => {
    const state: NormalAttackStateInterface = {
      unitData: {
        attack: initialArcUnitData(),
        defense: initialArcUnitData()
      },
      checkbox: {
        attack: { appearanceLv: true, baseAttack: false, baseDefense: false },
        defense: { appearanceLv: true, baseAttack: false, baseDefense: false }
      },
      damageResult: calc.initDamageResult()
    };
    const { attack: attackSide, defense: defenseSide } = state.unitData;
    const arc = find.unitData("アーク");
    const arcClass = find.classData(arc.className);

    const attack = calc.calcAttack(
      calc.calcBasicAttack(state, arc, arcClass),
      state
    );
    const defense = calc.calcDefense(
      calc.calcBasicDefense(state, arc, arcClass),
      state,
      defenseSide.isNoArmor
    );
    const basicDamage = calc.calcBasicDamage(attack, attackSide.baseAttack);
    const addDamage = calc.calcAddDamage(
      basicDamage,
      attack,
      attackSide.baseAttack,
      defense,
      defenseSide.isDying,
      defenseSide.isWeekElement
    );
    const isSlayer = false;
    const isGuard = false;
    const damage = calc.calcConditionDamage(
      addDamage,
      defenseSide.isResistElement,
      arc.frontDamegeScale,
      attackSide.charge,
      isSlayer,
      isGuard,
      attackSide.isCounter
    );

    // パターン3〜8は熟練Lv1では発生率0%で画面に表示されず、期待値を画面から取れないため検証しない
    expect(damage[0]).toEqual([16, 17, 18, 19, 21, 22]);
    expect(damage[1]).toEqual([21, 23, 24, 25, 27, 28]);
  });
});
