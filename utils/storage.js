const fs = require("fs");
const path = require("path");
const elements = require("./element");

const dataPath = path.join(__dirname, "../data/users.json");

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
  } catch (e) {
    return {};
  }
}

function saveUsers(users) {
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
}

function getUser(id) {
  const users = loadUsers();
  return users[id] || null;
}

function createUser(id, race, element) {
  const users = loadUsers();
  if (!users[id]) {
    let hp = 100,
      mana = 100,
      attack = 10,
      defense = 10,
      armor = 10;

    // Bonus theo Tộc
    switch (race) {
      case "ma":
        attack += 5;
        break;
      case "tien":
        mana += 30;
        hp -= 10;
        break;
      case "yeu":
        hp += 50;
        attack -= 2;
        break;
      case "than":
        attack += 3;
        defense += 3;
        hp += 10;
        break;
      default:
        break;
    }

    // Bonus theo Ngũ hành
    const gains = elements[element];
    if (gains) {
      if (gains.hp) hp += gains.hp;
      if (gains.mana) mana += gains.mana;
      if (gains.attack) attack += gains.attack;
      if (gains.defense) defense += gains.defense;
      if (gains.armor) armor += gains.armor;
    }

    users[id] = {
      id,
      name: "Chưa đặt tên",
      exp: 0,
      level: 1,
      realm: "Luyện Khí - Tầng 1",
      race,
      element,
      hp,
      maxHp: hp,
      mana,
      maxMana: mana,
      attack,
      defense,
      armor,
      fury: 0,
      linhthach: 0,
      inventory: {},
      title: null,
      bio: "",
      dailyStones: { date: null, earned: 0 },
    };
    saveUsers(users);
  }
  return users[id];
}

function updateUser(id, data) {
  const users = loadUsers();
  if (!users[id]) return null;
  users[id] = { ...users[id], ...data };
  saveUsers(users);
  return users[id];
}

module.exports = { loadUsers, saveUsers, getUser, createUser, updateUser };
