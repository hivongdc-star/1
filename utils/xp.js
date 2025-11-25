// utils/xp.js
//
// Quản lý EXP, Level Up, cập nhật chỉ số theo Race + Element
// Bản đã loại bỏ hoàn toàn RELA (không có ringBonus, partnerBonus)

const { loadUsers, saveUsers } = require("./storage");
const races = require("./races");
const elements = require("./elements");
const realms = require("./realms");

// Tính EXP cần cho mỗi level
function getExpNeeded(level) {
  const cfg = realms.expConfig || { baseExp: 100, expMultiplier: 1.25 };
  const base = cfg.baseExp || 100;
  const mul = cfg.expMultiplier || 1.25;

  return Math.floor(base * Math.pow(mul, level - 1));
}

// Chỉ còn bonus từ trang bị (equipments)
// ĐÃ GỠ sạch bonus từ nhẫn cưới / relationship
function computeExpBonusPercent(user) {
  let bonus = 0;

  if (user && user.equipments) {
    for (const key in user.equipments) {
      const it = user.equipments[key];
      if (!it) continue;

      // exp_percent đặt thẳng trong item
      if (typeof it.exp_percent === "number") {
        bonus += it.exp_percent;
      }

      // bonus.exp_percent từ object con
      if (it.bonus && typeof it.bonus.exp_percent === "number") {
        bonus += it.bonus.exp_percent;
      }
    }
  }

  return bonus;
}

// Tăng chỉ số khi level up dựa theo Race
function applyRaceBonus(stats, race) {
  if (!races[race]) return stats;
  const b = races[race].growth || {};
  return {
    attack: stats.attack + (b.attack || 0),
    defense: stats.defense + (b.defense || 0),
    hp: stats.hp + (b.hp || 0),
    mp: stats.mp + (b.mp || 0),
  };
}

// Tăng chỉ số khi level up dựa theo Element
function applyElementBonus(stats, element) {
  if (!elements[element]) return stats;
  const b = elements[element].growth || {};
  return {
    attack: stats.attack + (b.attack || 0),
    defense: stats.defense + (b.defense || 0),
    hp: stats.hp + (b.hp || 0),
    mp: stats.mp + (b.mp || 0),
  };
}

// Lấy cảnh giới theo level
function getRealm(level) {
  const list = realms.realms || [];
  let realmName = "Phàm Nhân";
  for (const r of list) {
    if (level >= r.minLevel) realmName = r.name;
  }
  return realmName;
}

// Hàm cộng EXP chính
function addXp(userId, amount) {
  const users = loadUsers();
  const user = users[userId];
  if (!user) return null;

  // Tính bonus EXP %
  const bonusPercent = computeExpBonusPercent(user);
  const realGain = Math.floor(amount * (1 + bonusPercent / 100));

  user.exp = (user.exp || 0) + realGain;

  let upgraded = false;

  // Kiểm tra đủ EXP để lên cấp
  while (user.exp >= getExpNeeded(user.level)) {
    user.exp -= getExpNeeded(user.level);
    user.level++;
    upgraded = true;

    // Áp dụng tăng chỉ số theo Race
    let st = user.stats || {
      attack: 0, defense: 0, hp: 0, mp: 0
    };
    st = applyRaceBonus(st, user.race);
    st = applyElementBonus(st, user.element);
    user.stats = st;
  }

  saveUsers(users);

  return {
    user,
    gained: realGain,
    levelUp: upgraded,
    realm: getRealm(user.level),
  };
}

module.exports = {
  getExpNeeded,
  computeExpBonusPercent,
  applyRaceBonus,
  applyElementBonus,
  getRealm,
  addXp,
};
