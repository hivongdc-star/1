const { loadUsers, saveUsers } = require("./storage");
const realms = require("./realms");
const elements = require("./element");
const races = require("./races");
const { baseExp, expMultiplier } = require("./config");

/**
 * EXP cần để lên cấp
 */
function getExpNeeded(level) {
  return Math.floor(baseExp * Math.pow(expMultiplier, level - 1));
}

/**
 * Tính % bonus EXP từ trang bị + nhẫn cưới
 */
function computeExpBonusPercent(user) {
  let bonus = 0;

  // Bonus từ equipments
  if (user && user.equipments) {
    for (const key in user.equipments) {
      const it = user.equipments[key];
      if (!it) continue;
      if (typeof it.exp_percent === "number") bonus += it.exp_percent;
      if (it.bonus && typeof it.bonus.exp_percent === "number") {
        bonus += it.bonus.exp_percent;
      }
    }
  }

  // Bonus từ nhẫn cưới (relationship)
  if (
    user &&
    user.relationships &&
    user.relationships.ringBonus &&
    typeof user.relationships.ringBonus.exp_percent === "number"
  ) {
    bonus += user.relationships.ringBonus.exp_percent;
  }

  return bonus;
}

/**
 * Cộng EXP cho user
 */
function addXp(userId, amount) {
  const users = loadUsers();
  if (!users[userId]) return 0;

  const user = users[userId];
  const bonusPct = computeExpBonusPercent(user);
  const finalAmount = Math.floor(amount * (1 + bonusPct / 100));

  user.exp += finalAmount;
  let levelUps = 0;

  while (user.exp >= getExpNeeded(user.level)) {
    user.exp -= getExpNeeded(user.level);
    user.level++;
    levelUps++;

    // --- Cộng chỉ số theo Tộc ---
    const race = user.race;
    const raceGain = races[race]?.gain;
    if (raceGain) {
      for (let stat in raceGain) {
        user[stat] = (user[stat] || 0) + raceGain[stat];
      }
    }

    // --- Cộng chỉ số theo Ngũ hành ---
    const ele = user.element;
    const eleGain = elements[ele];
    if (eleGain) {
      for (let stat in eleGain) {
        user[stat] = (user[stat] || 0) + eleGain[stat];
      }
    }

    // ✅ Cộng thêm máu cố định mỗi cấp
    user.hp += 100;
    user.maxHp += 100;

    // --- Breakthrough cảnh giới ---
    if (user.level % 10 === 1) {
      let multiplier = 1.5;
      if (user.race === "than") multiplier = 1.6; // Thần đặc biệt

      ["hp", "mp", "atk", "def", "spd"].forEach((stat) => {
        user[stat] = Math.floor(user[stat] * multiplier);
      });
    }
  }

  saveUsers(users);
  return levelUps;
}

/**
 * Lấy cảnh giới từ level
 */
function getRealm(level) {
  const realmIndex = Math.floor((level - 1) / 10);
  const stage = ((level - 1) % 10) + 1;
  return `${realms[realmIndex]} - Tầng ${stage}`;
}

module.exports = { addXp, getRealm, getExpNeeded };
