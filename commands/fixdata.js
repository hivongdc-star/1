const { loadUsers, saveUsers } = require("../utils/storage");
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: "fixdata",
  description: "Cập nhật users.json với chỉ số mới (chỉ admin)",
  aliases: ["fd"],

  run(client, msg) {
    if (msg.author.id !== OWNER_ID) {
      return msg.reply("❌ Bạn không có quyền dùng lệnh này.");
    }

    const users = loadUsers();
    let fixed = 0;

    const defaults = {
      name: "Chưa đặt tên",
      exp: 0,
      level: 1,
      realm: "Luyện Khí - Tầng 1",
      race: "nhan",
      element: "kim",
      hp: 100,
      maxHp: 100,
      mana: 100,
      maxMana: 100,
      attack: 10,
      defense: 10,
      armor: 10,
      fury: 0,
      lt: 0, // ✅ đổi từ linhthach sang lt
      inventory: {},
      title: null,
      bio: "",
      dailyStones: { date: null, earned: 0 },
    };

    for (const id in users) {
      const u = users[id];
      let changed = false;

      for (const key in defaults) {
        if (u[key] === undefined || u[key] === null) {
          u[key] = defaults[key];
          changed = true;
        }
      }

      if (changed) fixed++;
    }

    saveUsers(users);
    msg.reply(`✅ Đã fix chỉ số cho **${fixed}** nhân vật.`);
  },
};
