const { baseExp, expMultiplier } = require("./config");
const { loadUsers, saveUsers } = require("./storage");
const realms = require("./realms");
const elements = require("./element");
const races = require("./races");

// 📌 Bảng hệ số cảnh giới
function getRealmMultiplier(level) {
  const realmIndex = Math.floor((level - 1) / 10);
  const multipliers = [
    1, // Luyện Khí
    1.2, // Trúc Cơ
    1.5, // Kết Đan
    1.8, // Nguyên Anh
    2.2, // Hóa Thần
    2.5, // Hợp Thể
    3, // Độ Kiếp
    3.5, // Đại Thừa
    4, // Tán Tiên
    4.5, // Chân Tiên
    5, // Địa Tiên
    5.5, // Thiên Tiên
    6, // Kim Tiên
    6.5, // Tiên Quân
    7, // Tiên Vương
    8, // Tiên Hoàng
    10, // Tiên Đế
  ];
  return multipliers[realmIndex] || 10;
}

// 📌 Công thức EXP mới
function getExpNeeded(level) {
  // EXP tăng vừa tuyến tính vừa mũ → cân bằng đầu/cuối game
  const base = baseExp * Math.pow(expMultiplier, level - 1) + level * 200;
  const realmMult = getRealmMultiplier(level);
  return Math.floor(base * realmMult);
}

// 📌 Cộng EXP
function addXp(userId, amount) {
  const users = loadUsers();
  if (!users[userId]) return;

  let expGain = amount;
  if (users[userId].race === "nhan") expGain = Math.floor(expGain * 1.05);
  if (users[userId].race === "than") expGain = Math.floor(expGain * 0.95);

  users[userId].exp += expGain;
  let leveledUp = false;

  const maxLevel = realms.length * 10; // 170

  while (
    users[userId].exp >= getExpNeeded(users[userId].level) &&
    users[userId].level < maxLevel
  ) {
    users[userId].exp -= getExpNeeded(users[userId].level);
    users[userId].level++;
    leveledUp = true;

    const eleGains = elements[users[userId].element];
    const raceGains = races[users[userId].race];
    for (let stat of ["hp", "mp", "atk", "def", "spd"]) {
      users[userId][stat] += (eleGains?.[stat] || 0) + (raceGains?.[stat] || 0);
    }

    if (users[userId].level % 10 === 1) {
      let multiplier = 1.5;
      if (users[userId].race === "than") multiplier = 1.6;
      ["hp", "mp", "atk", "def", "spd"].forEach((stat) => {
        users[userId][stat] = Math.floor(users[userId][stat] * multiplier);
      });
    }
  }

  saveUsers(users);
  return leveledUp;
}

// 📌 Lấy cảnh giới từ level
function getRealm(level) {
  const realmIndex = Math.floor((level - 1) / 10);
  const stage = ((level - 1) % 10) + 1;

  if (level >= realms.length * 10) {
    return `${realms[realms.length - 1]} - Tầng 10 (Tối cao)`;
  }
  return `${realms[realmIndex]} - Tầng ${stage}`;
}

module.exports = { addXp, getRealm, getExpNeeded };
