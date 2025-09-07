const { startGame, getGame } = require("../noitu/noituState");

module.exports = {
  name: "start",
  description: "Bắt đầu game nối từ tiếng Việt",
  run(client, message) {
    const channelId = message.channel.id;

    if (getGame(channelId)?.active) {
      return message.reply("⚠️ Game nối từ đã chạy trong kênh này.");
    }

    startGame(channelId);
    message.channel.send(
      "✅ Game nối từ tiếng Việt đã bắt đầu!\n🎯 Mục tiêu: 1000 từ.\n✍️ Hãy nhập từ đầu tiên."
    );
  },
};
