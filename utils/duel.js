const { loadUsers, saveUsers } = require("./storage");
const skills = require("./skills");
const { calculateDamage, tickBuffs } = require("./dmg");

const battles = {};
const challenges = {};

function normalizeUser(u) {
  if (!u) return null;
  u.maxHp = u.maxHp || 100;
  u.hp = u.hp > 0 ? u.hp : u.maxHp;
  u.maxMana = u.maxMana || 100;
  if (u.mana === undefined) u.mana = u.maxMana;
  if (u.fury === undefined) u.fury = 0;
  u.cong = u.cong || u.attack || 10;
  u.thu = u.thu || u.defense || 10;
  u.giap = u.giap || u.armor || 10;
  return u;
}

function createBattleState(player1, player2) {
  return {
    players: [player1.id, player2.id],
    turn: player1.id,
    logs: [],
    finished: false,
  };
}

function startDuel(p1Id, p2Id) {
  const users = loadUsers();
  const p1 = normalizeUser(users[p1Id]);
  const p2 = normalizeUser(users[p2Id]);
  if (!p1 || !p2) return null;

  const state = createBattleState(p1, p2);
  battles[p1Id] = { opponentId: p2Id, state };
  battles[p2Id] = { opponentId: p1Id, state };
  return state;
}

function useSkill(userId, skillName) {
  const battle = battles[userId];
  if (!battle) return null;

  const state = battle.state;
  const users = loadUsers();
  const attacker = normalizeUser(users[userId]);
  const defenderId = state.players.find((id) => id !== userId);
  const defender = normalizeUser(users[defenderId]);

  if (state.finished || state.turn !== attacker.id) return state;

  const element = attacker.element;
  const skillList = skills[element] || [];
  const skill = skillList.find((s) => s.name === skillName);
  if (!skill) {
    state.logs.push(`${attacker.name} thử dùng skill không hợp lệ.`);
    return state;
  }

  if ((skill.cost.mana || 0) > attacker.mana) {
    state.logs.push(`${attacker.name} không đủ Mana để dùng ${skill.name}!`);
    return state;
  }
  if ((skill.cost.fury || 0) > attacker.fury) {
    state.logs.push(`${attacker.name} chưa đủ Nộ để dùng ${skill.name}!`);
    return state;
  }

  attacker.mana -= skill.cost.mana || 0;
  attacker.fury -= skill.cost.fury || 0;

  let dmg = 0;
  if (skill.multiplier > 0) {
    dmg = calculateDamage(attacker, defender, skill);
    defender.hp -= dmg;
  }

  if (skill.effect) {
    dmg = skill.effect(attacker, defender, dmg);
  }

  if (defender.hp < 0) defender.hp = 0;
  attacker.fury = Math.min(100, attacker.fury + (skill.furyGain || 0));
  if (skill.furyGain < 0) attacker.fury = 0;

  let log = `💥 ${attacker.name} dùng **${skill.name}**`;
  if (skill.multiplier > 0)
    log += ` gây **${dmg}** sát thương cho ${defender.name}!`;
  else log += ` (${skill.description})`;
  state.logs.push(log);

  if (defender.hp <= 0) {
    state.finished = true;
    state.logs.push(`🏆 ${attacker.name} đã chiến thắng!`);
  } else {
    state.turn = defender.id;
  }

  tickBuffs(attacker);
  tickBuffs(defender);

  const allUsers = loadUsers();
  allUsers[attacker.id] = attacker;
  allUsers[defender.id] = defender;
  saveUsers(allUsers);

  return state;
}

function resetAfterBattle(state) {
  const users = loadUsers();
  for (const pid of state.players) {
    const u = normalizeUser(users[pid]);
    if (!u) continue;
    u.hp = u.maxHp;
    u.mana = u.maxMana;
    u.fury = 0;
    u.shield = 0;
    u.buffs = [];
  }
  saveUsers(users);

  for (const pid of state.players) delete battles[pid];
}

module.exports = { battles, challenges, startDuel, useSkill, resetAfterBattle };
