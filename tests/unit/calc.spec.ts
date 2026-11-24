import { describe, it, expect } from "vitest";
import * as calc from "@/util/calc";
import * as find from "@/util/find";
import type {
  NormalAttackStateInterface,
  NormalAttackStateUnitData
} from "@/types/NormalAttack/State";
import type {
  AbilityAttackStateInterface,
  AbilityAttackStateUnitData
} from "@/types/AbilityAttack/State";

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

const normalAttackState = (
  attackSide: Partial<NormalAttackStateUnitData> = {},
  defenseSide: Partial<NormalAttackStateUnitData> = {}
): NormalAttackStateInterface => ({
  unitData: {
    attack: { ...initialArcUnitData(), ...attackSide },
    defense: { ...initialArcUnitData(), ...defenseSide }
  },
  checkbox: {
    attack: { appearanceLv: true, baseAttack: false, baseDefense: false },
    defense: { appearanceLv: true, baseAttack: false, baseDefense: false }
  },
  damageResult: calc.initDamageResult()
});

// 方向の倍率・スレイヤー・ガードは、Mixin がユニットデータと入力を突き合わせて決める値で計算関数の外の責務。
// テストでその判定を再実装すると Mixin の写しになるため、画面で成立させた条件をそのまま渡す
interface DerivedConditions {
  directionPow: number;
  isSlayer: boolean;
  isGuard: boolean;
}

const calcNormalAttackDamage = (
  state: NormalAttackStateInterface,
  {
    directionPow = 1,
    isSlayer = false,
    isGuard = false
  }: Partial<DerivedConditions> = {}
): number[][] => {
  const { attack: attackSide, defense: defenseSide } = state.unitData;
  const attackUnit = find.unitData(attackSide.unitName);
  const defenseUnit = find.unitData(defenseSide.unitName);

  const attack = calc.calcAttack(
    calc.calcBasicAttack(
      state,
      attackUnit,
      find.classData(attackUnit.className)
    ),
    state
  );
  const defense = calc.calcDefense(
    calc.calcBasicDefense(
      state,
      defenseUnit,
      find.classData(defenseUnit.className)
    ),
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
  return calc.calcConditionDamage(
    addDamage,
    defenseSide.isResistElement,
    directionPow,
    attackSide.charge,
    isSlayer,
    isGuard,
    attackSide.isCounter
  );
};

// 画面の表は発生率0%のパターンを表示しないため、期待値は画面に出たパターンだけを番号(1〜8)で持つ
const patternsOf = (
  damage: number[][],
  ...patternNumbers: number[]
): Record<number, number[]> =>
  Object.fromEntries(patternNumbers.map(n => [n, damage[n - 1]]));

// 防御側の条件を変えるテストでは、攻撃側に武器ATT30を持たせる。
// 初期入力のままだと防御力が攻撃力を上回って追加ダメージが0になり、防御力の差が結果に出ないため
const armedAttackSide: Partial<NormalAttackStateUnitData> = {
  weaponAttack: 30
};

// 画面で防御側にトッシュを選んだときに自動入力される値
const toshDefenseSide: Partial<NormalAttackStateUnitData> = {
  unitName: "トッシュ",
  lv: 46,
  appearanceLv: 46,
  baseDefense: 105
};
const tosh = find.unitData("トッシュ");

describe("通常攻撃", () => {
  describe("攻撃側の攻撃力", () => {
    it("攻撃側・防御側ともに初期入力(アーク)のとき、パターン1は16〜22、パターン2は21〜28になる", () => {
      const damage = calcNormalAttackDamage(normalAttackState());

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [16, 17, 18, 19, 21, 22],
        2: [21, 23, 24, 25, 27, 28]
      });
    });

    it("攻撃力上昇・武器ATT・他装備ATTがあると、その分だけ攻撃力が上がる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({
          attackBuff: 1,
          weaponAttack: 30,
          equipmentAttack: 10
        })
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [108, 111, 115, 118, 122, 125],
        2: [113, 117, 121, 124, 128, 132]
      });
    });

    it("攻撃力低下・ヘモジー・毒が重なると、攻撃力が下がる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({ attackBuff: 2, debuff: 1, isPoison: true })
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [6, 7, 7, 8, 9, 9],
        2: [8, 9, 9, 10, 11, 11]
      });
    });

    it("ウィークエネミーを受けると、基本攻撃力内部値ではなくLvから求めた攻撃力になる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({ isWeekEnemy: true })
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [5, 5, 6, 6, 7, 7],
        2: [6, 7, 8, 8, 9, 9]
      });
    });

    it("武器非装備のときは、武器ATTが無視され他装備ATTだけが加わる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({
          isNoWeapon: true,
          weaponAttack: 30,
          equipmentAttack: 10
        })
      );

      expect(patternsOf(damage, 1)).toEqual({
        1: [36, 38, 39, 41, 43, 44]
      });
    });
  });

  describe("防御側の防御力", () => {
    it("攻撃側が武器ATT30で防御側が初期入力のとき、パターン1は76〜89になる", () => {
      const damage = calcNormalAttackDamage(normalAttackState(armedAttackSide));

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [76, 79, 81, 84, 87, 89],
        2: [81, 84, 87, 90, 93, 96]
      });
    });

    it("防御力上昇・防具1DEF・防具2DEF・他装備DEFがあると、その分だけ防御力が上がる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState(armedAttackSide, {
          defenseBuff: 1,
          armorDefense1: 10,
          armorDefense2: 5,
          equipmentDefense: 2
        })
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [42, 45, 47, 50, 53, 55],
        2: [47, 50, 53, 56, 59, 62]
      });
    });

    it("防御力低下・石化・毒が重なると、石化で上がった防御力が低下と毒で下がる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState(armedAttackSide, {
          defenseBuff: 2,
          debuff: 2,
          isPoison: true
        })
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [78, 81, 83, 86, 89, 91],
        2: [83, 86, 89, 92, 95, 98]
      });
    });

    it("ヘモジーを受けると、防御力が下がる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState(armedAttackSide, { debuff: 1 })
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [84, 87, 89, 92, 95, 97],
        2: [90, 93, 96, 99, 102, 105]
      });
    });

    it("ウィークエネミーを受けると、基本防御力内部値ではなくLvから求めた防御力になる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState(armedAttackSide, { isWeekEnemy: true })
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [97, 100, 102, 105, 108, 110],
        2: [102, 105, 108, 111, 114, 117]
      });
    });

    it("防具非装備のときは、防具1DEF・防具2DEFが無視され他装備DEFだけが加わる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState(armedAttackSide, {
          isNoArmor: true,
          armorDefense1: 10,
          armorDefense2: 5,
          equipmentDefense: 2
        })
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [73, 76, 78, 81, 84, 86],
        2: [78, 81, 84, 87, 90, 93]
      });
    });
  });

  describe("追加ダメージ", () => {
    it("防御側が瀕死のときは、防御力を1.25倍して追加ダメージを求める", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState(armedAttackSide, { isDying: true })
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [67, 70, 72, 75, 78, 80],
        2: [73, 76, 79, 82, 85, 88]
      });
    });

    it("属性弱点のときは、追加ダメージが1.25倍になる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState(
          { ...armedAttackSide, weaponElement: 1 },
          { isWeekElement: true }
        )
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [88, 91, 93, 96, 99, 101],
        2: [94, 97, 100, 103, 106, 109]
      });
    });

    it("防御力が攻撃力を上回るときは、追加ダメージが0になり基本ダメージだけが残る", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState(armedAttackSide, { baseDefense: 2000 })
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [28, 31, 33, 36, 39, 41],
        2: [29, 32, 35, 38, 41, 44]
      });
    });
  });

  describe("状態による補正", () => {
    it("属性耐性のときは、ダメージが0.8倍になる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({ weaponElement: 1 }, { isResistElement: true })
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [13, 13, 14, 15, 17, 17],
        2: [17, 18, 19, 20, 21, 22]
      });
    });

    it("防御側(トッシュ)の正面から攻撃すると、トッシュの正面のダメージ倍率(0.5倍)がかかる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({ direction: 0 }, toshDefenseSide),
        { directionPow: tosh.frontDamegeScale }
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [9, 10, 10, 11, 12, 12],
        2: [12, 13, 13, 14, 15, 15]
      });
    });

    it("防御側(トッシュ)の左右から攻撃すると、トッシュの左右のダメージ倍率(1倍)がかかる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({ direction: 1 }, toshDefenseSide),
        { directionPow: tosh.sideDamegeScale }
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [18, 19, 20, 21, 23, 24],
        2: [23, 25, 26, 27, 29, 30]
      });
    });

    it("防御側(トッシュ)の背後から攻撃すると、トッシュの背後のダメージ倍率(1.5倍)がかかる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({ direction: 2 }, toshDefenseSide),
        { directionPow: tosh.backDamegeScale }
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [26, 28, 29, 31, 34, 35],
        2: [34, 37, 38, 40, 43, 44]
      });
    });

    it("チャージがあると、チャージ回数に応じた倍率がかかる", () => {
      const damage = calcNormalAttackDamage(normalAttackState({ charge: 3 }));

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [34, 37, 39, 41, 46, 48],
        2: [46, 50, 52, 55, 59, 61]
      });
    });

    it("防御側に対応するスレイヤーを装備していると、ダメージが1.5倍になる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({ equipmentSlayer: 1 }),
        { isSlayer: true }
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [23, 25, 26, 28, 31, 32],
        2: [31, 34, 35, 37, 40, 41]
      });
    });

    it("攻撃側に対応するガードを防御側が装備していると、ダメージが0.5倍になる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({}, { equipmentGuard: 1 }),
        { isGuard: true }
      );

      expect(patternsOf(damage, 1, 2)).toEqual({
        1: [9, 9, 10, 10, 11, 12],
        2: [11, 12, 13, 13, 14, 15]
      });
    });

    it("反撃のときは、チャージが無視される", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({ isCounter: true, charge: 5, counterLv: 2 })
      );

      expect(patternsOf(damage, 1)).toEqual({
        1: [16, 17, 18, 19, 21, 22]
      });
    });
  });

  describe("コンボパターン", () => {
    it("クリティカルで発生するパターン8は、基本攻撃力内部値の7/8が攻撃力に上乗せされる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({ isCritical: true })
      );

      expect(patternsOf(damage, 1, 2, 8)).toEqual({
        1: [16, 17, 18, 19, 21, 22],
        2: [21, 23, 24, 25, 27, 28],
        8: [59, 61, 63, 65, 68, 70]
      });
    });

    it("熟練Lv15で発生するパターン3・4は、基本攻撃力内部値の2/8・3/8が攻撃力に上乗せされる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState({ weaponSkillLv: 15 })
      );

      expect(patternsOf(damage, 3, 4, 8)).toEqual({
        3: [28, 29, 31, 32, 34, 35],
        4: [34, 36, 38, 39, 41, 43],
        8: [59, 61, 63, 65, 68, 70]
      });
    });

    it("32767を超えるダメージは、65536を引いた負の値になる", () => {
      const damage = calcNormalAttackDamage(
        normalAttackState(
          {
            baseAttack: 2499,
            weaponElement: 2,
            equipmentSlayer: 3,
            charge: 7,
            direction: 2,
            weaponSkillLv: 15
          },
          { ...toshDefenseSide, baseDefense: 1, isWeekElement: true }
        ),
        { directionPow: tosh.backDamegeScale, isSlayer: true }
      );

      expect(patternsOf(damage, 3, 4, 8)).toEqual({
        3: [20008, 20422, 20845, 21259, 21691, 22114],
        4: [22006, 22465, 22933, 23392, 23869, 24328],
        8: [30025, 30655, 31294, 31924, 32545, -32352]
      });
    });
  });
});

const initialArcAbilityUnitData = (): AbilityAttackStateUnitData => ({
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
  weaponAttack: 0,
  equipmentAttack: 0,
  equipmentSlayer: 0,
  armorDefense1: 0,
  armorDefense2: 0,
  equipmentDefense: 0,
  equipmentGuard: 0,
  isWeekElement: false,
  isResistElement: false,
  abilityName: "バーングラウンド",
  abilityLv: 1,
  baseMagic: 107,
  magicBuff: 0,
  equipmentMagic: 0,
  equipmentMagicDefense: 0
});

const abilityAttackState = (
  attackSide: Partial<AbilityAttackStateUnitData> = {},
  defenseSide: Partial<AbilityAttackStateUnitData> = {}
): AbilityAttackStateInterface => ({
  unitData: {
    attack: { ...initialArcAbilityUnitData(), ...attackSide },
    defense: { ...initialArcAbilityUnitData(), ...defenseSide }
  },
  checkbox: {
    attack: {
      appearanceLv: true,
      baseAttack: false,
      baseDefense: false,
      baseMagic: false
    },
    defense: {
      appearanceLv: true,
      baseAttack: false,
      baseDefense: false,
      baseMagic: false
    }
  },
  damageResult: calc.initAbilityDamageResult()
});

// 画面の特殊能力タブで攻撃側にトッシュを選んで保存したときの値（基本防御力内部値は画面に出ないため保存データから取った）
const toshAbilityAttackSide: Partial<AbilityAttackStateUnitData> = {
  unitName: "トッシュ",
  lv: 46,
  appearanceLv: 46,
  baseAttack: 170,
  baseDefense: 105,
  baseMagic: 69
};

const calcMagicOf = (unitData: AbilityAttackStateUnitData): number => {
  const unit = find.unitData(unitData.unitName);
  return calc.calcMagic(
    calc.calcBasicMagic(unitData, unit, find.classData(unit.className)),
    unitData.equipmentMagic
  );
};

const calcAbilityAttackDamage = (
  state: AbilityAttackStateInterface,
  {
    isSlayer = false,
    isGuard = false
  }: Partial<Pick<DerivedConditions, "isSlayer" | "isGuard">> = {}
): number[] => {
  const { attack: attackSide, defense: defenseSide } = state.unitData;
  const attackUnit = find.unitData(attackSide.unitName);
  const defenseUnit = find.unitData(defenseSide.unitName);
  const ability = find.abilityData(attackSide.abilityName);
  const attackerMagic = calcMagicOf(attackSide);

  let power: number;
  let difference: number;
  if (ability.type === "攻撃力") {
    const attack = calc.calcAttack(
      calc.calcBasicAttack(
        state,
        attackUnit,
        find.classData(attackUnit.className)
      ),
      state
    );
    const defense = calc.calcDefense(
      calc.calcBasicDefense(
        state,
        defenseUnit,
        find.classData(defenseUnit.className)
      ),
      state,
      defenseSide.isNoArmor
    );
    power = Math.floor(attack / 5);
    difference = attackerMagic - defense;
  } else {
    power = Math.floor(attackerMagic / 5);
    difference = attackerMagic - calcMagicOf(defenseSide);
  }
  const mp = [ability.mp1, ability.mp2, ability.mp3][attackSide.abilityLv - 1];
  const magicDefense =
    defenseUnit.basicMagicDefense + defenseSide.equipmentMagicDefense;

  return calc.calcAbilityDamage(
    power,
    ability.power,
    mp,
    difference,
    magicDefense,
    isSlayer,
    isGuard,
    defenseSide.isWeekElement,
    defenseSide.isResistElement
  );
};

// 画面には48通りのダメージの並びは出ず、「入力値以上のダメージが発生する確率」から
// 各ダメージが何通り出るかだけが読み取れる。そのため期待値は { ダメージ: 発生数 } で持つ
const damageCountsOf = (damage: number[]): Record<number, number> =>
  damage.reduce<Record<number, number>>(
    (counts, value) => ({ ...counts, [value]: (counts[value] ?? 0) + 1 }),
    {}
  );

describe("特殊能力", () => {
  describe("魔力に依存する特殊能力(アークのバーングラウンド)", () => {
    it("攻撃側・防御側ともに初期入力(アーク)のとき、ダメージは25〜31になる", () => {
      const damage = calcAbilityAttackDamage(abilityAttackState());

      expect(damageCountsOf(damage)).toEqual({
        25: 4,
        26: 9,
        27: 10,
        28: 4,
        29: 10,
        30: 9,
        31: 2
      });
    });

    it("特殊能力Lv3では、Lv3のMP補正がかかる", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({ abilityLv: 3 })
      );

      expect(damageCountsOf(damage)).toEqual({
        31: 8,
        32: 5,
        33: 10,
        34: 4,
        35: 10,
        36: 5,
        37: 6
      });
    });

    it("魔力上昇・装備MAGがあると、攻撃側の魔力が上がる", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({ magicBuff: 1, equipmentMagic: 10 })
      );

      expect(damageCountsOf(damage)).toEqual({
        58: 1,
        59: 3,
        60: 5,
        61: 3,
        62: 6,
        63: 3,
        64: 5,
        65: 3,
        67: 5,
        68: 3,
        69: 6,
        70: 3,
        71: 2
      });
    });

    it("魔力低下を受けると、攻撃側の魔力が下がる", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({ magicBuff: 2 })
      );

      expect(damageCountsOf(damage)).toEqual({
        17: 9,
        18: 13,
        19: 6,
        20: 19,
        21: 1
      });
    });

    it("ウィークエネミーを受けると、基本魔力内部値ではなくLvから求めた魔力になる", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({ isWeekEnemy: true })
      );

      expect(damageCountsOf(damage)).toEqual({ 7: 42, 8: 6 });
    });

    it("防御側の魔力が攻撃側を上回ると、能力差の分だけダメージが減る", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({}, { magicBuff: 1 })
      );

      expect(damageCountsOf(damage)).toEqual({
        22: 4,
        23: 9,
        24: 10,
        25: 9,
        26: 10,
        27: 6
      });
    });

    it("攻撃側の魔力が防御側を100より大きく上回ると、能力差による増加は50%で頭打ちになる", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({ baseMagic: 2499 })
      );

      expect(damageCountsOf(damage)).toEqual({
        873: 1,
        877: 1,
        881: 1,
        885: 1,
        889: 1,
        894: 1,
        897: 1,
        901: 1,
        906: 1,
        909: 1,
        914: 1,
        918: 1,
        921: 1,
        926: 1,
        930: 1,
        934: 1,
        938: 1,
        942: 1,
        946: 1,
        950: 1,
        954: 1,
        958: 1,
        962: 1,
        966: 1,
        970: 1,
        975: 1,
        978: 1,
        982: 1,
        987: 1,
        990: 1,
        995: 1,
        999: 1,
        1002: 1,
        1007: 1,
        1011: 1,
        1015: 1,
        1019: 1,
        1023: 1,
        1027: 1,
        1031: 1,
        1035: 1,
        1039: 1,
        1043: 1,
        1047: 1,
        1051: 1,
        1056: 1,
        1059: 1,
        1063: 1
      });
    });

    it("防御側の魔力が攻撃側を100より大きく上回ると、能力差による減少は50%で頭打ちになる", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({}, { baseMagic: 2499 })
      );

      expect(damageCountsOf(damage)).toEqual({ 13: 4, 14: 19, 15: 14, 16: 11 });
    });

    it("防御側に装備魔防御があると、魔防御の分だけダメージが減る", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({}, { equipmentMagicDefense: 3 })
      );

      expect(damageCountsOf(damage)).toEqual({
        16: 4,
        17: 14,
        18: 9,
        19: 15,
        20: 6
      });
    });

    it("属性弱点のときは、ダメージが1.25倍になる", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({}, { isWeekElement: true })
      );

      expect(damageCountsOf(damage)).toEqual({
        31: 4,
        32: 9,
        33: 5,
        34: 5,
        35: 9,
        36: 5,
        37: 9,
        38: 2
      });
    });

    it("属性耐性のときは、ダメージが0.8倍になる", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({}, { isResistElement: true })
      );

      expect(damageCountsOf(damage)).toEqual({
        20: 4,
        21: 14,
        22: 5,
        23: 14,
        24: 9,
        25: 2
      });
    });

    it("防御側に対応するスレイヤーを装備していると、ダメージが1.5倍になる", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({ equipmentSlayer: 1 }),
        { isSlayer: true }
      );

      expect(damageCountsOf(damage)).toEqual({
        37: 4,
        38: 4,
        39: 10,
        40: 5,
        42: 9,
        43: 5,
        44: 5,
        45: 6
      });
    });

    it("攻撃側に対応するガードを防御側が装備していると、ダメージが半分になる", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({}, { equipmentGuard: 1 }),
        { isGuard: true }
      );

      expect(damageCountsOf(damage)).toEqual({ 13: 4, 14: 19, 15: 14, 16: 11 });
    });
  });

  describe("攻撃力に依存する特殊能力(トッシュの真空斬・振り下ろし)", () => {
    it("攻撃側がトッシュの真空斬のとき、攻撃側の攻撃力と防御側の防御力からダメージを求める", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({ ...toshAbilityAttackSide, abilityName: "真空斬" })
      );

      expect(damageCountsOf(damage)).toEqual({
        32: 5,
        33: 6,
        34: 6,
        35: 9,
        36: 6,
        37: 8,
        38: 3,
        39: 5
      });
    });

    it("攻撃力上昇・武器ATT・他装備ATTがあると、攻撃側の攻撃力が上がる", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({
          ...toshAbilityAttackSide,
          abilityName: "真空斬",
          attackBuff: 1,
          weaponAttack: 30,
          equipmentAttack: 10
        })
      );

      expect(damageCountsOf(damage)).toEqual({
        76: 3,
        77: 2,
        78: 4,
        79: 4,
        80: 1,
        81: 3,
        82: 3,
        83: 4,
        84: 2,
        85: 2,
        86: 3,
        87: 3,
        88: 4,
        89: 3,
        90: 3,
        91: 1,
        92: 3
      });
    });

    it("防御側の防御力が上がると、攻撃側の魔力との能力差が縮みダメージが減る", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState(
          { ...toshAbilityAttackSide, abilityName: "真空斬" },
          { defenseBuff: 1, armorDefense1: 20 }
        )
      );

      expect(damageCountsOf(damage)).toEqual({
        21: 5,
        22: 12,
        23: 12,
        24: 11,
        25: 8
      });
    });

    it("威力が1.04の振り下ろしでは、真空斬より威力の分だけダメージが増える", () => {
      const damage = calcAbilityAttackDamage(
        abilityAttackState({
          ...toshAbilityAttackSide,
          abilityName: "振り下ろし"
        })
      );

      expect(damageCountsOf(damage)).toEqual({
        33: 4,
        34: 6,
        35: 9,
        36: 5,
        37: 9,
        38: 3,
        39: 8,
        40: 4
      });
    });
  });
});
