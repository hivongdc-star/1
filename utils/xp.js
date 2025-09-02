// utils/xp.js
const { loadUsers, saveUsers } = require("./storage");
const realms = require("./realms");
const elements = require("./element");
const races = require("./races");
const { baseExp, expMultiplier } = require("./config");

// Tính EXP cần để lên cấp
function getExpNeeded(level) {
  return Math.floor(baseExp * Math.pow(expMultiplier, level - 1));
}

// Cộng EXP cho user, xử lý lên cấp
function addXp(userId, amount) {
  const users = loadUsers();
  if (!users[userId]) return;

  users[userId].exp += amount;
  let leveledUp = false;

  while (users[userId].exp >= getExpNeeded(users[userId].level)) {
    users[userId].exp -= getExpNeeded(users[userId].level);
    users[userId].level++;
    leveledUp = true;

    // --- Cộng chỉ số theo Tộc ---
    const race = users[userId].race;
    const raceGain = races[race]?.gain;
    if (raceGain) {
      for (let stat in raceGain) {
        if (stat === "hp") {
          users[userId].hp += raceGain[stat];
          users[userId].maxHp += raceGain[stat];
        } else if (stat === "mp") {
          users[userId].mp += raceGain[stat];
          users[userId].maxMp += raceGain[stat];
        } else {
          users[userId][stat] = (users[userId][stat] || 0) + raceGain[stat];
        }
      }
    }

    // --- Cộng chỉ số theo Ngũ hành ---
    const ele = users[userId].element;
    const eleGain = elements[ele];
    if (eleGain) {
      for (let stat in eleGain) {
        if (stat === "hp") {
          users[userId].hp += eleGain[stat];
          users[userId].maxHp += eleGain[stat];
        } else if (stat === "mp") {
          users[userId].mp += eleGain[stat];
          users[userId].maxMp += eleGain[stat];
        } else {
          users[userId][stat] = (users[userId][stat] || 0) + eleGain[stat];
        }
      }
    }

    // ✅ Cộng thêm máu & mana cơ bản mỗi cấp
    users[userId].hp += 100;
    users[userId].maxHp += 100;
    users[userId].mp += 20;
    users[userId].maxMp += 20;

    // --- Breakthrough cảnh giới ---
    if (users[userId].level % 10 === 1) {
      let multiplier = users[userId].race === "than" ? 1.6 : 1.5;
      ["hp", "maxHp", "mp", "maxMp", "atk", "def", "spd"].forEach((stat) => {
        users[userId][stat] = Math.floor(users[userId][stat] * multiplier);
      });
    }
  }

  saveUsers(users);
  return leveledUp;
}

// Lấy cảnh giới từ level
function getRealm(level) {
  const realmIndex = Math.floor((level - 1) / 10);
  const stage = ((level - 1) % 10) + 1;
  return `${realms[realmIndex]} - Tầng ${stage}`;
}

module.exports = { addXp, getRealm, getExpNeeded };
