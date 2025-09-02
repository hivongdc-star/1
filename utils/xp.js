const { loadUsers, saveUsers } = require("./storage");
const realms = require("./realms");
const elements = require("./element");
const races = require("./races");
const { baseExp, expMultiplier } = require("./config");

function getExpNeeded(level) {
  // EXP cần để lên cấp (có thể chỉnh hệ số trong config)
  return Math.floor(baseExp * Math.pow(expMultiplier, level - 1));
}

function addXp(userId, amount) {
  const users = loadUsers();
  if (!users[userId]) return 0;

  users[userId].exp += amount;
  let levelUps = 0;

  while (users[userId].exp >= getExpNeeded(users[userId].level)) {
    users[userId].exp -= getExpNeeded(users[userId].level);
    users[userId].level++;
    levelUps++;

    // --- Cộng chỉ số theo Tộc ---
    const race = users[userId].race;
    const raceGain = races[race]?.gain;
    if (raceGain) {
      for (let stat in raceGain) {
        users[userId][stat] = (users[userId][stat] || 0) + raceGain[stat];
      }
    }

    // --- Cộng chỉ số theo Ngũ hành ---
    const ele = users[userId].element;
    const eleGain = elements[ele];
    if (eleGain) {
      for (let stat in eleGain) {
        users[userId][stat] = (users[userId][stat] || 0) + eleGain[stat];
      }
    }

    // ✅ Cộng thêm máu cố định mỗi cấp
    users[userId].hp += 100;
    users[userId].maxHp += 100;

    // --- Breakthrough cảnh giới ---
    if (users[userId].level % 10 === 1) {
      let multiplier = 1.5;
      if (users[userId].race === "than") multiplier = 1.6; // Thần đặc biệt

      ["hp", "mp", "atk", "def", "spd"].forEach((stat) => {
        users[userId][stat] = Math.floor(users[userId][stat] * multiplier);
      });
    }
  }

  saveUsers(users);
  return levelUps; // trả về số cấp đã lên
}

function getRealm(level) {
  const realmIndex = Math.floor((level - 1) / 10);
  const stage = ((level - 1) % 10) + 1;
  return `${realms[realmIndex]} - Tầng ${stage}`;
}

module.exports = { addXp, getRealm, getExpNeeded };
