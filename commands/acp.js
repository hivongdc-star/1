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

    // gửi cho challenger
    try {
      const dm1 = await challenger.createDM();
      state.dmChannels.push(dm1);
    } catch (e) {
      console.error("❌ DM lỗi challenger:", e.message);
      message.channel.send(
        `⚠️ Không thể DM cho <@${challengerId}> → trận đấu sẽ hiển thị ở kênh này.`
      );
      state.dmChannels.push(message.channel);
    }

    // gửi cho defender
    try {
      const dm2 = await defender.createDM();
      state.dmChannels.push(dm2);
    } catch (e) {
      console.error("❌ DM lỗi defender:", e.message);
      message.channel.send(
        `⚠️ Không thể DM cho <@${defenderId}> → trận đấu sẽ hiển thị ở kênh này.`
      );
      state.dmChannels.push(message.channel);
    }

    // ⚔️ Thêm log mở đầu vào state
    state.logs.push(
      `⚔️ Trận đấu giữa ${challenger.username} và ${defender.username} đã bắt đầu!`
    );

    // 🔥 gửi embed + menu skill ngay từ đầu
    for (const ch of state.dmChannels) {
      try {
        await sendBattleEmbeds(client, state, ch);
      } catch (err) {
        console.error("❌ Lỗi khi gọi duelMenu:", err);
        message.channel.send(
          "⚠️ Không thể hiển thị bảng skill, xem log để biết chi tiết."
        );
      }
    }
  },
};
