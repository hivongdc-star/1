module.exports = {
  nhan: {
    name: "Nhân",
    emoji: "👤",
    bonus: (user) => {
      // Nhân: cân bằng, không buff gì
    },
  },
  ma: {
    name: "Ma",
    emoji: "😈",
    bonus: (user) => {
      user.attack += 5;
    },
  },
  tien: {
    name: "Tiên",
    emoji: "👼",
    bonus: (user) => {
      user.mana += 30;
      user.hp -= 10;
    },
  },
  yeu: {
    name: "Yêu",
    emoji: "🦊",
    bonus: (user) => {
      user.hp += 50;
      user.attack -= 2;
    },
  },
  than: {
    name: "Thần",
    emoji: "⚡",
    bonus: (user) => {
      user.attack += 3;
      user.defense += 3;
      user.hp += 10;
    },
  },
};
