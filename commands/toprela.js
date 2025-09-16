// commands/toprela.js
const { getTopRelaPairs } = require("../utils/relaUtils");

module.exports = {
  name: "toprela",
  aliases: ["toplove", "rela"],
  run: async (client, msg, args) => {
    const top = getTopRelaPairs(10); // top 10 cặp

    if (!top.length) {
      return msg.reply("📭 Chưa có dữ liệu rela để xếp hạng.");
    }

    const lines = top.map((p, i) => {
      return `**#${i + 1}** <@${p.a}> ❤ <@${p.b}> — **${p.value}** điểm`;
    });

    msg.channel.send(`💞 **TOP RELA** 💞\n${lines.join("\n")}`);
  },
};
