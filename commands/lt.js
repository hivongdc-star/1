const { getUser } = require("../utils/storage");

module.exports = {
  name: "lt",
  description: "Xem số lượng Linh thạch của bạn",
  aliases: ["linhthach"],
  run: async (client, msg) => {
    const user = getUser(msg.author.id);
    if (!user) {
      return msg.reply("⚠️ Bạn chưa có nhân vật. Hãy dùng `-create` để tạo!");
    }

    msg.reply(`💎 Bạn hiện có **${user.linhthach ?? 0} Linh thạch**.`);
  },
};
