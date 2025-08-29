const { addStones } = require("../utils/currency");
const { loadUsers } = require("../utils/storage");
const { OWNER_ID } = process.env;

module.exports = {
  name: "addlt",
  description: "Cộng linh thạch cho nhân vật chỉ định (Admin Only)",
  async run(client, message, args) {
    if (message.author.id !== OWNER_ID) {
      return message.reply("❌ Bạn không có quyền dùng lệnh này.");
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply("⚠️ Vui lòng mention người cần cộng linh thạch.");
    }

    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) {
      return message.reply("⚠️ Vui lòng nhập số linh thạch hợp lệ.");
    }

    const userId = target.id;
    addStones(userId, amount);

    const users = loadUsers();
    const user = users[userId];
    if (!user) return message.reply("❌ Nhân vật này chưa được tạo.");

    return message.reply(
      `✅ Đã cộng ${amount} 💎 linh thạch cho **${user.name}**. (Tổng: ${user.currency})`
    );
  },
};
