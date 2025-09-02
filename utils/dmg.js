function applyBuffs(user, target, baseAtk, baseDef) {
  let atk = baseAtk;
  let def = baseDef;
  let ignoreArmor = 0;

  if (user.buffs) {
    for (const buff of user.buffs) {
      const val = Number(buff.value) || 0;
      if (buff.type === "buffAtk") atk = Math.floor(atk * (1 + val));
      if (buff.type === "buffIgnoreArmor")
        ignoreArmor = Math.max(ignoreArmor, val);
    }
  }

  if (target.buffs) {
    for (const buff of target.buffs) {
      const val = Number(buff.value) || 0;
      if (buff.type === "buffDef") def = Math.floor(def * (1 + val));
    }
  }

  return { atk, def, ignoreArmor };
}

function calculateDamage(attacker, defender, skill, state) {
  if (skill.type === "buff") return 0;

  let atk = attacker.atk || 10;
  let def = defender.def || 0;

  const { atk: buffedAtk, def: buffedDef, ignoreArmor } = applyBuffs(
    attacker,
    defender,
    atk,
    def
  );
  atk = buffedAtk;
  def = buffedDef;

  if (ignoreArmor > 0) {
    def = Math.floor(def * (1 - ignoreArmor));
  }

  if (["normal", "mana", "fury"].includes(skill.type)) {
    const spdDiff = attacker.spd - defender.spd;
    let dodgeChance = Math.min(
      30,
      Math.max(0, (spdDiff / (defender.spd + 1)) * 100)
    );
    if (Math.random() * 100 < dodgeChance) {
      if (state) state.logs.push(`💨 ${defender.name} né được đòn của ${attacker.name}!`);
      return 0;
    }
  }

  let dmg = atk * (skill.multiplier || 1);
  dmg = Math.floor(dmg * (100 / (100 + def)));

  if (defender.shield > 0) {
    const absorbed = Math.min(defender.shield, dmg);
    defender.shield -= absorbed;
    dmg -= absorbed;
    if (state) state.logs.push(`🛡️ Khiên của ${defender.name} đã chặn ${absorbed} sát thương!`);
  }

  return dmg > 0 ? dmg : 1;
}

function tickBuffs(user, state) {
  if (!user.buffs) return;
  user.buffs = user.buffs.filter((buff) => {
    buff.turns -= 1;
    if (buff.type === "shield" && buff.turns <= 0) {
      user.shield = 0;
    }
    if (buff.turns <= 0 && state) {
      state.logs.push(`✨ Buff ${buff.type} của ${user.name} đã hết hiệu lực.`);
    }
    return buff.turns > 0;
  });
}

function addBuff(user, type, value, turns) {
  user.buffs = user.buffs || [];
  user.buffs.push({ type, value, turns });
}

function heal(user, amount, state) {
  const healed = Math.min(user.maxHp - user.hp, amount);
  user.hp = Math.min(user.maxHp, user.hp + amount);
  if (state && healed > 0) state.logs.push(`💚 ${user.name} hồi phục ${healed} HP!`);
  return healed;
}

function addShield(user, amount, turns = 2, state) {
  user.shield = (user.shield || 0) + amount;
  addBuff(user, "shield", amount, turns);
  if (state) state.logs.push(`🛡️ ${user.name} nhận được khiên ${amount} (tồn tại ${turns} lượt)!`);
}

module.exports = {
  calculateDamage,
  tickBuffs,
  addBuff,
  heal,
  addShield,
};
