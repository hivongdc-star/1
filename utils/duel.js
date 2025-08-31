const { loadUsers, saveUsers } = require("./storage");
const skills = require("./skills");
const { calculateDamage, tickBuffs } = require("./dmg");

const battles = {};
const challenges = {};

// Chuẩn hóa user trước combat
function normalizeUser(u, id) {
  if (!u) return null;
  u.id = id;
  u.maxHp = u.maxHp || 100;
  u.hp = Math.min(u.hp ?? u.maxHp, u.maxHp);
  u.maxMp = u.maxMp || 100;
  u.mp = Math.min(u.mp ?? u.maxMp, u.maxMp);
  u.fury = u.fury ?? 0;
  u.atk = u.atk ?? 10;
  u.def = u.def ?? 10;
  u.spd = u.spd ?? 10;
  u.buffs = u.buffs || [];
  u.shield = u.shield || 0;

  // track cooldown buff
  u.buffCooldowns = u.buffCooldowns || {}; // { skillName: turnsLeft }

  return u;
}

function createBattleState(p1Id, p2Id) {
  return {
    players: [p1Id, p2Id],
    turn: p1Id,
    logs: [],
    finished: false,
  };
}

function startDuel(p1Id, p2Id) {
  const users = loadUsers();
  const p1 = normalizeUser(users[p1Id], p1Id);
  const p2 = normalizeUser(users[p2Id], p2Id);
  if (!p1 || !p2) return null;

  const state = createBattleState(p1Id, p2Id);
  battles[p1Id] = { opponentId: p2Id, state };
  battles[p2Id] = { opponentId: p1Id, state };
  delete challenges[p1Id];
  delete challenges[p2Id];
  return state;
}

function useSkill(userId, skillName) {
  const battle = battles[userId];
  if (!battle) return null;
  const state = battle.state;
  if (state.finished || state.turn !== userId) return state;

  const users = loadUsers();
  const attacker = normalizeUser(users[userId], userId);
  const defenderId = state.players.find((id) => id !== userId);
  const defender = normalizeUser(users[defenderId], defenderId);

  const skillList = skills[attacker.element] || [];
  const skill = skillList.find((s) => s.name === skillName);

  if (!skill) {
    state.logs.push(`${attacker.name} thử dùng skill không hợp lệ.`);
    return state;
  }

  // ⚡ Buff skill check cooldown
  if (skill.type === "buff") {
    const cd = attacker.buffCooldowns[skill.name] || 0;
    if (cd > 0) {
      state.logs.push(
        `${attacker.name} chưa thể dùng ${skill.name} (còn ${cd} lượt hồi).`
      );
      return state;
    }
  }

  // ⚡ Check mana cost (% maxMp)
  const mpCost = Math.floor(
    (attacker.maxMp || 100) * ((skill.cost?.mpPercent || 0) / 100)
  );
  if (attacker.mp < mpCost) {
    state.logs.push(`${attacker.name} không đủ MP để dùng ${skill.name}!`);
    return state;
  }
  if ((skill.cost?.fury || 0) > attacker.fury) {
    state.logs.push(`${attacker.name} chưa đủ Nộ để dùng ${skill.name}!`);
    return state;
  }

  // Trừ cost
  attacker.mp -= mpCost;
  attacker.fury -= skill.cost?.fury || 0;

  let dmg = 0;
  if (skill.type !== "buff" && skill.multiplier > 0) {
    dmg = calculateDamage(attacker, defender, skill);
    defender.hp -= dmg;
  }

  if (skill.effect) {
    skill.effect(attacker, defender, dmg);
  }

  defender.hp = Math.max(0, defender.hp);
  attacker.fury = Math.max(
    0,
    Math.min(100, attacker.fury + (skill.furyGain || 0))
  );

  // Ghi log
  let log = `💥 ${attacker.name} dùng **${skill.name}**`;
  if (skill.type !== "buff" && dmg > 0) {
    log += ` gây **${dmg}** sát thương cho ${defender.name}!`;
  } else if (skill.type === "buff") {
    log += ` (${skill.description})`;
    attacker.buffCooldowns[skill.name] = skill.cooldown || 3;
  }
  state.logs.push(log);

  if (defender.hp <= 0) {
    state.finished = true;
    state.logs.push(`🏆 ${attacker.name} đã chiến thắng!`);
  } else {
    state.turn = defenderId;
  }

  // tick buffs & cooldowns
  tickBuffs(attacker);
  tickBuffs(defender);
  for (const k in attacker.buffCooldowns) {
    if (attacker.buffCooldowns[k] > 0) attacker.buffCooldowns[k]--;
  }
  for (const k in defender.buffCooldowns) {
    if (defender.buffCooldowns[k] > 0) defender.buffCooldowns[k]--;
  }

  const allUsers = loadUsers();
  allUsers[userId] = attacker;
  allUsers[defenderId] = defender;
  saveUsers(allUsers);

  return state;
}

function resetAfterBattle(state) {
  const users = loadUsers();
  for (const pid of state.players) {
    const u = normalizeUser(users[pid], pid);
    if (!u) continue;
    u.hp = u.maxHp;
    u.mp = u.maxMp;
    u.fury = 0;
    u.shield = 0;
    u.buffs = [];
    u.buffCooldowns = {};
  }
  saveUsers(users);
  for (const pid of state.players) delete battles[pid];
}

module.exports = { battles, challenges, startDuel, useSkill, resetAfterBattle };
