// element.js
module.exports = {
  // Key chữ thường không dấu (để đồng bộ với storage.js và xp.js)
  kim: { armor: 2, defense: 1, hp: 5 },
  moc: { mana: 3, attack: 1, hp: 3 },
  thuy: { mana: 4, hp: 5, defense: 1 },
  hoa: { attack: 4, hp: 3 },
  tho: { defense: 3, armor: 2, hp: 7 },
};

// Map hiển thị ra giao diện (profile card)
module.exports.display = {
  kim: "Kim ⚔️",
  moc: "Mộc 🌳",
  thuy: "Thủy 💧",
  hoa: "Hỏa 🔥",
  tho: "Thổ 🪨",
};
