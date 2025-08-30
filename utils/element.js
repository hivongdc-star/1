// utils/element.js
module.exports = {
  kim: { hp: 30, mana: 10, attack: 10, defense: 15, armor: 15 }, // Trâu thủ/giáp
  moc: { hp: 20, mana: 25, attack: 15, defense: 10, armor: 8 }, // Nhiều mana + cân bằng
  thuy: { hp: 35, mana: 20, attack: 10, defense: 12, armor: 10 }, // Máu trâu + mana ổn định
  hoa: { hp: 20, mana: 10, attack: 30, defense: 8, armor: 8 }, // Công cực cao
  tho: { hp: 40, mana: 8, attack: 10, defense: 20, armor: 20 }, // Tank khủng
};

// Map hiển thị
module.exports.display = {
  kim: "⚔️ Kim",
  moc: "🌿 Mộc",
  thuy: "💧 Thủy",
  hoa: "🔥 Hỏa",
  tho: "⛰️ Thổ",
};
