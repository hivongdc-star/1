const { getGame } = require("../noitu/noituState");

module.exports = {
  name: "status",
  description: "Xem tiến độ game nối từ",
  run(client, message) {
    const channelId = message.channel.id;
    const state = getGame(channelId);

    if (!state || !state.active) {
      return message.reply("⚠️ Không có game nối từ nào đang chạy.");
    }

    // tìm người dẫn đầu
    let topUser = null;
    let topCount = 0;
    for (const [userId, words] of Object.entries(state.players)) {
      if (words > topCount) {
        topUser = userId;
        topCount = words;
      }
    }

    const leaderText = topUser
      ? `👑 Người dẫn đầu: <@${topUser}> (${topCount} từ)`
      : "Chưa có ai tham gia";

    message.channel.send(
      `📊 Tiến độ: ${state.wordCount}/${state.maxWords} từ\n${leaderText}`
    );
  },
};
