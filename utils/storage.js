const fs = require("fs");
const path = require("path");

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
  const u = users[id];
  if (!u) return null;

  if (u.lt === undefined) u.lt = 0;
  if (u.fury === undefined) u.fury = 0;
  if (!u.inventory) u.inventory = {};
  if (!u.dailyStones) u.dailyStones = { date: null, earned: 0 };
  if (!u.buffs) u.buffs = [];
  if (!u.shield) u.shield = 0;

  return u;
}

function createUser(id, race, element) {
  const users = loadUsers();
  if (!users[id]) {
    let hp = 100,
      mp = 100,
      atk = 10,
      def = 10,
      spd = 10;

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
      mp,
      maxMp: mp,
      atk,
      def,
      spd,
      fury: 0,
      lt: 0,
      bio: "",
      title: null,
      inventory: {},
      dailyStones: { date: null, earned: 0 },
      buffs: [],
      shield: 0,
      background: "default",
    };

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
