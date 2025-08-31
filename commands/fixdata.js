const { loadUsers, saveUsers } = require("../utils/storage");
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: "fixdata",
  description: "Tự động chuẩn hóa dữ liệu users.json (chỉ admin)",
  aliases: ["fd"],

  run(client, msg) {
    if (msg.author.id !== OWNER_ID) {
      return msg.reply("❌ Bạn không có quyền dùng lệnh này.");
    }

    const users = loadUsers();
    let fixed = 0;

    // Các field mặc định (stat mới)
    const defaults = {
      name: "Chưa đặt tên",
      exp: 0,
      level: 1,
      realm: "Luyện Khí - Tầng 1",
      race: "nhan",
      element: "kim",
      hp: 100,
      maxHp: 100,
      mp: 100,
      maxMp: 100,
      atk: 10,
      def: 10,
      spd: 10,
      fury: 0,
      lt: 0,
      inventory: {},
      title: null,
      bio: "",
      dailyStones: { date: null, earned: 0 },
      buffs: [],
      shield: 0,
    };

    for (const id in users) {
      const u = users[id];
      let changed = false;

      // 🔄 migrate từ "linhthach" sang "lt"
      if (u.linhthach !== undefined) {
        u.lt = (u.lt || 0) + u.linhthach;
        delete u.linhthach;
        changed = true;
      }

      // 🔄 migrate stat cũ -> stat mới
      if (u.mana !== undefined) {
        u.mp = u.mana;
        delete u.mana;
        changed = true;
      }
      if (u.maxMana !== undefined) {
        u.maxMp = u.maxMana;
        delete u.maxMana;
        changed = true;
      }
      if (u.attack !== undefined) {
        u.atk = u.attack;
        delete u.attack;
        changed = true;
      }
      if (u.defense !== undefined) {
        u.def = u.defense;
        delete u.defense;
        changed = true;
      }
      if (u.armor !== undefined) {
        u.spd = u.armor;
        delete u.armor;
        changed = true;
      }

      // thêm field mặc định nếu thiếu
      for (const key in defaults) {
        if (u[key] === undefined || u[key] === null) {
          u[key] = defaults[key];
          changed = true;
        }
      }

      // 📌 Update HP chuẩn theo level (100 + 100 * (level-1))
      if (u.level && u.level > 1) {
        const expectedHp = 100 + (u.level - 1) * 100;
        if (u.maxHp < expectedHp) {
          u.maxHp = expectedHp;
          if (u.hp > u.maxHp) u.hp = u.maxHp;
          changed = true;
        }
      }

      if (changed) fixed++;
    }

    saveUsers(users);
    msg.reply(`✅ Đã fix dữ liệu cho **${fixed}** nhân vật.`);
  },
};
