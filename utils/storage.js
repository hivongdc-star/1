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

// chỉ đọc user, không auto tạo
function getUser(id) {
  const users = loadUsers();
  return users[id] || null;
}

// tạo user mới
function createUser(id, race, element) {
  const users = loadUsers();
  if (!users[id]) {
    // base stats
    let hp = 100,
      mana = 100,
      attack = 10,
      defense = 10,
      armor = 10;

    // bonus theo Tộc
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
        break; // nhân = cân bằng
    }

    // bonus theo Hệ
    switch (element) {
      case "kim":
        armor += 2;
        defense += 1;
        hp += 5;
        break;
      case "moc":
        mana += 3;
        attack += 1;
        hp += 3;
        break;
      case "thuy":
        mana += 4;
        hp += 5;
        defense += 1;
        break;
      case "hoa":
        attack += 4;
        hp += 3;
        break;
      case "tho":
        defense += 3;
        armor += 2;
        hp += 7;
        break;
      default:
        break;
    }

    users[id] = {
      id,
      name: "Chưa đặt tên",
      exp: 0,
      level: 1,
      realm: "Luyện Khí - Tầng 1",
      race,
      element, // luôn dùng element thay vì he
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
