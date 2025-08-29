const realms = require("../utils/realms");

const baseCost = 100; // giá khởi điểm
const multiplier = 1.05; // mỗi cảnh giới tăng 5%

function calcCost(i) {
  return Math.round(baseCost * Math.pow(multiplier, i));
}

const icons = {
  weapon: "⚔️",
  armor: "🛡️",
  ring: "💍",
  boots: "🥾",
};

const items = [];

realms.forEach((realm, i) => {
  items.push(
    {
      id: `wp${i + 1}`,
      name: `Vũ Khí ${realm}`,
      slot: "weapon",
      icon: icons.weapon,
      cost: calcCost(i),
      stats: { atk: 5 * (i + 1) },
      realm,
    },
    {
      id: `ar${i + 1}`,
      name: `Giáp ${realm}`,
      slot: "armor",
      icon: icons.armor,
      cost: calcCost(i),
      stats: { armor: 5 * (i + 1) },
      realm,
    },
    {
      id: `rg${i + 1}`,
      name: `Nhẫn ${realm}`,
      slot: "ring",
      icon: icons.ring,
      cost: calcCost(i),
      stats: { hp: 50 * (i + 1) },
      realm,
    },
    {
      id: `bt${i + 1}`,
      name: `Giày ${realm}`,
      slot: "boots",
      icon: icons.boots,
      cost: calcCost(i),
      stats: { mp: 30 * (i + 1) },
      realm,
    }
  );
});

module.exports = items;
