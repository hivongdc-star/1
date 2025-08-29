// commands/acp.js
const { challenges, startDuel } = require("../utils/duel");
const { sendBattleEmbeds } = require("../utils/duelMenu");

module.exports = {
  name: "acp",
  description: "Chấp nhận thách đấu",
  async run(client, message) {
    const challenge = challenges[message.author.id];
    if (!challenge) {
      return message.reply("❌ Hiện không có lời thách đấu nào dành cho bạn!");
    }

    const opponentId = challenge.challengerId;
    const state = startDuel(opponentId, message.author.id);
    delete challenges[message.author.id];

    if (!state) {
      return message.reply(
        "❌ Không thể bắt đầu trận đấu (dữ liệu nhân vật lỗi)!"
      );
    }

    await message.channel.send(
      `🔥 Trận đấu giữa <@${opponentId}> và <@${message.author.id}> đã bắt đầu!`
    );

    // Thử DM, nếu fail thì gửi trong channel công khai
    sendBattleEmbeds(client, state, message.channel);
  },
};
