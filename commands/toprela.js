// commands/toprela.js
const { loadUsers } = require("../utils/storage");
const { getTopPairs } = require("../utils/relaUtils");

module.exports = {
  name:"toprela",
  run: async (client, msg)=>{
    const users = loadUsers();
    const top = getTopPairs(10);
    if (!top.length) return msg.reply("📭 Chưa có dữ liệu.");
    const lines = top.map((p,i)=>{
      const A = users[p.a]?.name||"Ẩn danh", B = users[p.b]?.name||"Ẩn danh";
      return `**#${i+1}** ${A} ❤ ${B} — **${p.value}**`;
    });
    msg.reply("💞 **TOP QUAN HỆ** 💞\n"+lines.join("\n"));
  }
};
