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

    // tạo state trận đấu
    const state = startDuel(challengerId, defenderId);
    delete challenges[defenderId];

    if (!state) {
      return message.reply(
        "❌ Không thể bắt đầu trận đấu (thiếu dữ liệu nhân vật)!"
      );
    }

    const challenger = await client.users.fetch(challengerId);
    const defender = message.author;

    try {
      const dm1 = await challenger.createDM();
      const dm2 = await defender.createDM();

      state.dmChannels = [dm1, dm2];

      await dm1.send(`🔥 Trận đấu với **${defender.username}** đã bắt đầu!`);
      await dm2.send(`🔥 Trận đấu với **${challenger.username}** đã bắt đầu!`);

      // gửi embed/menu vào DM cả hai bên
      await sendBattleEmbeds(client, state, dm1);
      await sendBattleEmbeds(client, state, dm2);
    } catch (e) {
      console.error("Không thể gửi DM:", e);
      message.channel.send(
        "❌ Không thể DM cho người chơi (có thể họ tắt DM)."
      );
    }
  },
};
