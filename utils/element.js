// element.js
module.exports = {
  kim: { hp: 6, mana: 2, attack: 2, defense: 3, armor: 3 }, // Trâu, thiên về thủ + giáp
  moc: { hp: 5, mana: 5, attack: 3, defense: 2, armor: 2 }, // Cân bằng, thiên về mana
  thuy: { hp: 7, mana: 4, attack: 2, defense: 3, armor: 2 }, // Nhiều máu, mana ổn định
  hoa: { hp: 5, mana: 2, attack: 5, defense: 2, armor: 2 }, // Công cao, máu vừa
  tho: { hp: 8, mana: 2, attack: 2, defense: 4, armor: 4 }, // Tank cứng, thủ + giáp cao
};

// Map hiển thị
module.exports.display = {
  kim: "⚔️ Kim",
  moc: "🌿 Mộc",
  thuy: "💧 Thủy",
  hoa: "🔥 Hỏa",
  tho: "⛰️ Thổ",
};
