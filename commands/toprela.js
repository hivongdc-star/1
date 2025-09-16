const { loadUsers } = require("../utils/storage");
const { getTopRelaPairs } = require("../utils/relaUtils");

module.exports = {
  name: "toprela",
  aliases: ["toplove", "rela-top"],
  run: async (client, msg, args) => {
    const users = loadUsers();
    const top = getTopRelaPairs(10); // lấy top 10 cặp

    if (!top.length) {
      return msg.reply("📭 Chưa có dữ liệu rela để xếp hạng.");
    }

    const lines = top.map((p, i) => {
      const userA = users[p.a];
      const userB = users[p.b];
      const nameA = userA?.name || "Ẩn danh";
      const nameB = userB?.name || "Ẩn danh";
      return `**#${i + 1}** ${nameA} ❤ ${nameB} — **${p.value}** điểm`;
    });

    msg.reply("💞 **TOP RELA** 💞\n" + lines.join("\n"));
  },
};
