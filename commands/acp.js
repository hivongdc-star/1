// commands/acp.js
const { challenges, startDuel } = require("../utils/duel");
const { sendBattleEmbeds } = require("../utils/duelMenu");

module.exports = {
  name: "acp",
  aliases: ["accept", "chapnhan"],
  description: "Chấp nhận thách đấu",
  async run(client, message) {
    const challenge = challenges[message.author.id];
    if (!challenge) {
      return message.reply("❌ Hiện không có lời thách đấu nào dành cho bạn!");
    }

    const challengerId = challenge.challengerId;
    const defenderId = message.author.id;

    const state = startDuel(challengerId, defenderId);
    delete challenges[defenderId];
    if (!state) {
      return message.reply(
        "❌ Không thể bắt đầu trận đấu (thiếu dữ liệu nhân vật)!"
      );
    }

    const challenger = await client.users.fetch(challengerId);
    const defender = message.author;

    state.dmChannels = [];

    // thử gửi cho challenger
    try {
      const dm1 = await challenger.createDM();
      await dm1.send(`🔥 Trận đấu với **${defender.username}** đã bắt đầu!`);
      state.dmChannels.push(dm1);
    } catch {
      message.channel.send(
        `⚠️ Không thể DM cho <@${challengerId}> → trận đấu sẽ hiển thị ở kênh này.`
      );
      state.dmChannels.push(message.channel);
    }

    // thử gửi cho defender
    try {
      const dm2 = await defender.createDM();
      await dm2.send(`🔥 Trận đấu với **${challenger.username}** đã bắt đầu!`);
      state.dmChannels.push(dm2);
    } catch {
      message.channel.send(
        `⚠️ Không thể DM cho <@${defenderId}> → trận đấu sẽ hiển thị ở kênh này.`
      );
      state.dmChannels.push(message.channel);
    }

    // gửi embed/menu vào tất cả channel hợp lệ
    for (const ch of state.dmChannels) {
      await sendBattleEmbeds(client, state, ch);
    }
  },
};
