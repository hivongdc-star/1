const { buyTicket, getPot, drawWinner } = require("../utils/lottery");

module.exports = {
  name: "lottery",
  run: (client, msg, args) => {
    const sub = args[0];

    if (sub === "buy") {
      const amount = parseInt(args[1]) || 1;
      const result = buyTicket(msg.author.id, amount);
      return msg.reply(result.msg);
    } else if (sub === "pot") {
      return msg.reply(`💰 Jackpot hiện tại: ${getPot()} LT`);
    } else if (sub === "draw") {
      // 🔒 chỉ OWNER_ID trong .env mới có quyền
      const ownerId = process.env.OWNER_ID;
      if (msg.author.id !== ownerId) {
        return msg.reply("❌ Bạn không có quyền dùng lệnh này!");
      }

      const result = drawWinner();
      return msg.reply(result.msg);
    } else {
      return msg.reply(
        "📌 Dùng: \n" +
          "`-lottery buy <số vé>` → mua vé (10 LT/vé)\n" +
          "`-lottery pot` → xem jackpot\n" +
          "`-lottery draw` → quay số (Admin)"
      );
    }
  },
};
