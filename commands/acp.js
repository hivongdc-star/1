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

    // Tạo state trận đấu
    const state = startDuel(challengerId, defenderId);
    delete challenges[defenderId];

    if (!state) {
      return message.reply(
        "❌ Không thể bắt đầu trận đấu (thiếu dữ liệu nhân vật)!"
      );
    }

    const challenger = await client.users.fetch(challengerId);
    const defender = message.author;

    // thử DM cả 2 bên, nếu fail thì gửi ở kênh công khai
    const channels = [];
    try {
      const dm1 = await challenger.createDM();
      await dm1.send(`🔥 Trận đấu với **${defender.username}** đã bắt đầu!`);
      channels.push(dm1);
    } catch {
      message.channel.send(
        `⚠️ Không thể DM cho **${challenger.username}**, sẽ gửi ở kênh công khai.`
      );
      channels.push(message.channel);
    }

    try {
      const dm2 = await defender.createDM();
      await dm2.send(`🔥 Trận đấu với **${challenger.username}** đã bắt đầu!`);
      channels.push(dm2);
    } catch {
      message.channel.send(
        `⚠️ Không thể DM cho **${defender.username}**, sẽ gửi ở kênh công khai.`
      );
      if (!channels.includes(message.channel)) channels.push(message.channel);
    }

    // Lưu danh sách kênh để cập nhật
    state.channels = channels;

    // Gửi giao diện skill ban đầu
    await sendBattleEmbeds(client, state);
  },
};
