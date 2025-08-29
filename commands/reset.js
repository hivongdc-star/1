const { EmbedBuilder } = require("discord.js");
const { loadUsers, saveUsers, createUser } = require("../utils/storage");

module.exports = {
  name: "reset",
  aliases: ["rs"],
  run: async (client, msg, args) => {
    // bắt buộc tag user
    const target = msg.mentions.users.first();
    if (!target) {
      return msg.reply(
        "⚠️ Bạn phải tag người muốn reset. Ví dụ: `-reset @user`"
      );
    }

    // load user data
    const users = loadUsers();
    if (!users[target.id]) {
      return msg.reply("❌ Người này chưa có nhân vật để reset!");
    }

    // xoá user cũ
    delete users[target.id];
    saveUsers(users);

    // tạo mới mặc định
    createUser(target.id, "nhan", "kim");

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("♻️ Reset nhân vật")
      .setDescription(
        `Nhân vật của **${target.username}** đã được reset về trạng thái ban đầu (Nhân + Kim).`
      )
      .setFooter({ text: "✨ Hãy tu luyện chăm chỉ từ đầu!" });

    msg.channel.send({ embeds: [embed] });
  },
};
