const { buyTicket, getPot, drawWinner } = require("../utils/lottery");

module.exports = {
  name: "lottery",
  run: (client, msg, args) => {
    const sub = args[0];

    if (sub === "buy") {
      const amount = parseInt(args[1]) || 1;
      const result = buyTicket(msg.author.id, amount);
      msg.reply(result.msg);
    } else if (sub === "pot") {
      msg.reply(`💰 Jackpot hiện tại: ${getPot()} LT`);
    } else if (sub === "draw") {
      const result = drawWinner();
      msg.reply(result.msg);
    } else {
      msg.reply(
        "📌 Dùng: `-lottery buy <số vé>`, `-lottery pot`, `-lottery draw`"
      );
    }
  },
};
