const { loadUsers, saveUsers } = require("./storage");
const skills = require("./skills");

const battles = {};
const challenges = {};

// fallback stats nếu thiếu
function normalizeUser(u) {
  if (!u) return null;
  if (!u.maxHp) u.maxHp = 100;
  if (!u.hp || u.hp <= 0) u.hp = u.maxHp;
  if (!u.maxMana) u.maxMana = 100;
  if (u.mana === undefined) u.mana = u.maxMana;
  if (u.fury === undefined || u.fury === null) u.fury = 0;
  if (!u.attack) u.attack = 10;
  if (!u.defense) u.defense = 10;
  if (!u.armor) u.armor = 10;
  return u;
}

function createBattleState(player1, player2) {
  return {
    players: [player1.id, player2.id],
    turn: player1.id, // ai đi trước
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

  if (state.finished) return state;
  if (state.turn !== attacker.id) return state; // chưa tới lượt

  const element = attacker.element || attacker.he;
  const skill = (skills[element] || []).find((s) => s.name === skillName);
  if (!skill) {
    state.logs.push(`${attacker.name} thử dùng skill không hợp lệ.`);
    return state;
  }

  // Kiểm tra tài nguyên
  if ((skill.cost.mana || 0) > attacker.mana) {
    state.logs.push(`${attacker.name} không đủ mana để dùng ${skill.name}!`);
    return state;
  }
  if ((skill.cost.fury || 0) > attacker.fury) {
    state.logs.push(`${attacker.name} chưa đủ nộ để dùng ${skill.name}!`);
    return state;
  }

  // Trừ tài nguyên
  attacker.mana -= skill.cost.mana || 0;
  attacker.fury -= skill.cost.fury || 0;

  // Tính damage
  const rawDmg = attacker.attack * skill.multiplier;
  const dmg = Math.max(1, Math.floor(rawDmg - defender.defense));
  defender.hp -= dmg;

  // Cộng Fury theo skill
  attacker.fury = Math.min(100, attacker.fury + (skill.furyGain ?? 0));

  state.logs.push(
    `💥 ${attacker.name} dùng **${skill.name}** gây **${dmg}** sát thương cho ${defender.name}!`
  );

  // Kiểm tra tử vong
  if (defender.hp <= 0) {
    state.finished = true;
    state.logs.push(`🏆 ${attacker.name} đã chiến thắng!`);
  } else {
    state.turn = defender.id; // 🔄 chuyển lượt
  }

  // Lưu lại users
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
  }
  saveUsers(users);

  for (const pid of state.players) {
    delete battles[pid];
  }
}

function cancelDuel(userId) {
  const battle = battles[userId];
  if (!battle) return false;
  const opponentId = battle.opponentId;
  delete battles[userId];
  delete battles[opponentId];
  return true;
}

function cancelAll() {
  for (const id in battles) delete battles[id];
  for (const id in challenges) delete challenges[id];
}

module.exports = {
  battles,
  challenges,
  startDuel,
  useSkill,
  resetAfterBattle,
  cancelDuel,
  cancelAll,
};
