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
      Object.keys(gains).forEach((stat) => {
        users[userId][stat] = (users[userId][stat] || 0) + gains[stat];
      });
    }
  }

  users[userId].realm = getRealm(users[userId].level);
  saveUsers(users);
  return leveledUp;
}

function getRealm(level) {
  const realmIndex = Math.floor((level - 1) / 10);
  const stage = ((level - 1) % 10) + 1;
  return `${realms[realmIndex]} - Tầng ${stage}`;
}

module.exports = { addXp, getRealm, getExpNeeded };
