// utils/xp.js
const { loadUsers, saveUsers } = require("./storage");
const realms = require("./realms");
const elements = require("./element");
const { baseExp, expMultiplier } = require("./config");

function getExpNeeded(level) {
  return Math.floor(baseExp * Math.pow(expMultiplier, level - 1));
}

function addXp(userId, amount) {
  const users = loadUsers();
  if (!users[userId]) return;

  users[userId].exp += amount;
  let leveledUp = false;

  while (users[userId].exp >= getExpNeeded(users[userId].level)) {
    users[userId].exp -= getExpNeeded(users[userId].level);
    users[userId].level++;
    leveledUp = true;

    // cộng chỉ số theo hệ
    const ele = users[userId].element;
    const gains = elements[ele];
    if (gains) {
      for (let stat in gains) {
        users[userId][stat] = (users[userId][stat] || 0) + gains[stat];
      }
    }

    // breakthrough cảnh giới
    if (users[userId].level % 10 === 1) {
      let multiplier = 1.5;
      if (users[userId].race === "than") multiplier = 1.6;

      ["hp", "mana", "attack", "defense", "armor"].forEach((stat) => {
        users[userId][stat] = Math.floor(users[userId][stat] * multiplier);
      });
    }
  }

  saveUsers(users);
  return leveledUp;
}

function getRealm(level) {
  const realmIndex = Math.floor((level - 1) / 10);
  const stage = ((level - 1) % 10) + 1;
  return `${realms[realmIndex]} - Tầng ${stage}`;
}

module.exports = { addXp, getRealm, getExpNeeded };
