// Hệ ngũ hành
module.exports = {
  kim: { hp: 20, mp: 20, atk: 20, def: 20, spd: 20 }, // cân bằng, +10% fury khởi đầu
  moc: { hp: 50, mp: 15, atk: 15, def: 10, spd: 10 }, // ưu tiên HP
  thuy: { hp: 15, mp: 50, atk: 10, def: 15, spd: 10 }, // ưu tiên MP
  hoa: { hp: 15, mp: 10, atk: 50, def: 15, spd: 10 }, // ưu tiên ATK
  tho: { hp: 20, mp: 10, atk: 15, def: 45, spd: 10 }, // ưu tiên DEF
};

// Map hiển thị
module.exports.display = {
  kim: "⚔️ Kim",
  moc: "🌿 Mộc",
  thuy: "💧 Thủy",
  hoa: "🔥 Hỏa",
  tho: "⛰️ Thổ",
};
