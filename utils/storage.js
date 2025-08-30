// utils/storage.js
const fs = require("fs");
const path = require("path");
const elements = require("./element");
const races = require("./races");

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

    // bonus element ban đầu
    const eleBonus = elements[element];
    if (eleBonus) {
      hp += eleBonus.hp || 0;
      mana += eleBonus.mana || 0;
      attack += eleBonus.attack || 0;
      defense += eleBonus.defense || 0;
      armor += eleBonus.armor || 0;
    }

    let user = {
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
      bio: "",
      title: null,
      inventory: {},
      dailyStones: { date: null, earned: 0 },
    };

    // bonus theo race
    if (races[race]) {
      races[race].bonus(user);
    }

    users[id] = user;
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
