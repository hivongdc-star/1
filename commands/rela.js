// commands/rela.js
const { loadUsers } = require("../utils/storage");
const { getRela } = require("../utils/relaUtils");

module.exports = {
  name: "rela",
  aliases: ["quanhe", "friendship"],
  run: async (client, msg, args) => {
    const userId = msg.author.id;
    const users = loadUsers();

    if (!users[userId]) {
      return msg.reply("❌ Bạn chưa có hồ sơ nhân vật.");
    }

    const relaMap = users[userId].rela || {};
    const entries = Object.keys(relaMap).map((pid) => {
      const partner = users[pid];
      const name = partner?.name || "Ẩn danh";
      const value = getRela(userId, pid);
      return { name, value };
    });

    if (!entries.length) {
      return msg.reply("📭 Bạn chưa có quan hệ (rela) với ai.");
    }

    // sắp xếp giảm dần theo rela
    entries.sort((a, b) => b.value - a.value);

    const top = entries.slice(0, 10); // top 10
    const lines = top.map(
      (e, i) => `**#${i + 1}** ${e.name} — ${e.value} điểm`
    );

    msg.channel.send(
      `📖 **Quan hệ (RELA) của bạn:**\n${lines.join("\n")}`
    );
  },
};
