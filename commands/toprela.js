const { loadUsers } = require("../utils/storage");

module.exports = {
  name: "toprela",
  aliases: ["relaTop", "toplove"],
  run: async (client, msg) => {
    const users = loadUsers();
    let pairs = [];

    // duyệt qua tất cả quan hệ
    for (const [id, u] of Object.entries(users)) {
      if (!u.relationships?.partners) continue;
      for (const [pid, rel] of Object.entries(u.relationships.partners)) {
        if (!users[pid]) continue;

        // tránh trùng cặp (A-B và B-A)
        if (id < pid) {
          pairs.push({
            aId: id,
            bId: pid,
            rela: rel.rela || 0,
          });
        }
      }
    }

    if (pairs.length === 0) return msg.reply("❌ Chưa có cặp đôi nào có rela.");

    // sắp xếp giảm dần theo rela
    pairs.sort((a, b) => b.rela - a.rela);

    // lấy top 10
    const top10 = pairs.slice(0, 10);
    let lines = top10.map((p, i) => {
      const a = users[p.aId]?.name || p.aId;
      const b = users[p.bId]?.name || p.bId;
      return `**${i + 1}.** 💞 ${a} ❤️ ${b} — ${p.rela}`;
    });

    msg.reply("🏆 **Top các cặp đôi có rela cao nhất**:\n" + lines.join("\n"));
  },
};
