const { stopGame } = require("../noitu/noituState");
const { rewardGameResults } = require("../utils/currency");

module.exports = {
  name: "stop",
  description: "Kết thúc game nối từ (Admin)",
  run(client, message) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Bạn không có quyền dừng game.");
    }

    const channelId = message.channel.id;
    const state = stopGame(channelId);

    if (!state) {
      return message.reply("⚠️ Không có game nào đang chạy trong kênh này.");
    }

    const results = rewardGameResults(state.players);
    let board = results.length
      ? results
          .map(
            (r, i) =>
              `${i + 1}. <@${r.userId}> - ${r.words} từ → +${r.reward} LT`
          )
          .join("\n")
      : "Không có ai tham gia 😢";

    message.channel.send(
      `🛑 Game nối từ đã kết thúc bởi Admin.\n📊 Tổng số từ: ${state.wordCount}/${state.maxWords}\n\n${board}`
    );
  },
};
