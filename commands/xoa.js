const { loadUsers, saveUsers } = require("../utils/storage");
const { EmbedBuilder } = require("discord.js");

require("dotenv").config(); // đọc .env

module.exports = {
  name: "xoa",
  aliases: ["delete"],
  run: async (client, msg) => {
    const ownerId = process.env.BOT_OWNER_ID;

    // chỉ BOT_OWNER_ID mới được phép dùng
    if (msg.author.id !== ownerId) {
      return msg.reply("⚠️ Bạn không có quyền dùng lệnh này.");
    }

    const target = msg.mentions.users.first();
    if (!target) {
      return msg.reply("⚠️ Bạn phải tag người muốn xoá. Ví dụ: `-xoa @user`");
    }

    const users = loadUsers();
    if (!users[target.id]) {
      return msg.reply("❌ Người này chưa có nhân vật để xoá.");
    }

    delete users[target.id];
    saveUsers(users);

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🗑️ Nhân vật đã bị xoá")
      .setDescription(
        `Nhân vật của **${target.username}** đã bị xoá bởi Chủ Bot.\n` +
          `👉 Người chơi có thể tạo lại bằng lệnh \`-create\`.`
      );

    msg.channel.send({ embeds: [embed] });
  },
};
