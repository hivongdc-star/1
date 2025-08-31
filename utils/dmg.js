/**
 * 📌 Damage system với Buff/Shield/Heal + Dodge theo SPD
 */

function applyBuffs(user, target, baseDmg) {
  let dmg = baseDmg;
  let defenseBonus = 0;
  let ignoreArmor = 0;

  if (user.buffs) {
    for (const buff of user.buffs) {
      if (buff.type === "buffDmg") dmg *= buff.value; // buffDmg: nhân sát thương
      if (buff.type === "ignoreArmor") {
        ignoreArmor = Math.max(ignoreArmor, buff.value); // % cao nhất
      }
    }
  }

  if (target.buffs) {
    for (const buff of target.buffs) {
      if (buff.type === "buffDef") defenseBonus += buff.value; // cộng dồn % def
    }
  }

  return { dmg, defenseBonus, ignoreArmor };
}

function calculateDamage(attacker, defender, skill) {
  let atk = attacker.atk || 10;
  let def = defender.def || 0;

  let dmg = atk * (skill.multiplier || 1);

  // --- Né tránh dựa trên SPD ---
  const dodgeChance = Math.min(
    0.3,
    ((defender.spd || 0) / ((attacker.spd || 1) + (defender.spd || 0))) * 0.3
  );
  if (Math.random() < dodgeChance) {
    defender.lastDodge = true; // flag cho log
    return 0;
  }
  defender.lastDodge = false;

  // --- Buff & Armor ---
  const {
    dmg: buffedDmg,
    defenseBonus,
    ignoreArmor,
  } = applyBuffs(attacker, defender, dmg);
  dmg = buffedDmg;

  def = Math.floor(def * (1 + defenseBonus));

  if (skill.ignoreArmor && skill.ignoreArmor < 1) {
    def = Math.floor(def * (1 - skill.ignoreArmor));
  } else {
    def = Math.max(0, def - (skill.ignoreArmor || 0));
  }

  if (ignoreArmor > 0 && ignoreArmor < 1) {
    def = Math.floor(def * (1 - ignoreArmor));
  }

  dmg = Math.floor(dmg * (100 / (100 + def)));

  // Shield absorb
  if (defender.shield && defender.shield > 0) {
    const absorbed = Math.min(defender.shield, dmg);
    defender.shield -= absorbed;
    dmg -= absorbed;
  }

  return dmg > 0 ? dmg : 1;
}

function tickBuffs(user) {
  if (!user.buffs) return;
  user.buffs = user.buffs.filter((buff) => {
    buff.turns -= 1;

    if (buff.type === "shield" && buff.turns <= 0) {
      user.shield = 0;
    }

    return buff.turns > 0;
  });
}

function addBuff(user, type, value, turns) {
  user.buffs = user.buffs || [];

  const existing = user.buffs.find((b) => b.type === type);
  if (existing) {
    existing.value = value;
    existing.turns = turns;
  } else {
    user.buffs.push({ type, value, turns });
  }
}

function heal(user, amount) {
  user.hp = Math.min(user.maxHp || 100, user.hp + amount);
  return amount;
}

function addShield(user, amount, turns = 2) {
  user.shield = (user.shield || 0) + amount;
  addBuff(user, "shield", amount, turns);
}

module.exports = {
  calculateDamage,
  tickBuffs,
  addBuff,
  heal,
  addShield,
};
