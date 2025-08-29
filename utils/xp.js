const { loadUsers, saveUsers } = require("./storage");
const realms = require("./realms");
const elements = require("./element"); // ✅ đúng tên file
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

    // Tăng chỉ số theo ngũ hành
    const ele = users[userId].element;
    if (elements[ele]) {
      const gains = elements[ele];
      for (let stat in gains) {
        switch (stat) {
          case "attack":
            users[userId].cong = (users[userId].cong || 0) + gains[stat];
            break;
          case "defense":
            users[userId].thu = (users[userId].thu || 0) + gains[stat];
            break;
          case "armor":
            users[userId].giap = (users[userId].giap || 0) + gains[stat];
            break;
          case "hp":
            users[userId].hp = (users[userId].hp || 0) + gains[stat];
            break;
          case "mana":
            users[userId].mana = (users[userId].mana || 0) + gains[stat];
            break;
        }
      }
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
