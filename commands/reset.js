const { EmbedBuilder } = require("discord.js");
const { loadUsers, saveUsers, createUser } = require("../utils/storage");

module.exports = {
  name: "reset",
  aliases: ["rs"],
  run: async (client, msg, args) => {
    // chỉ admin hoặc owner mới được reset
    if (!msg.member.permissions.has("Administrator")) {
      return msg.reply("⚠️ Bạn không có quyền dùng lệnh này.");
    }

    // check có tag user không
    const target = msg.mentions.users.first();
    if (!target) {
      return msg.reply(
        "⚠️ Bạn phải tag người muốn reset. Ví dụ: `-reset @user`"
      );
    }

    // load data
    const users = loadUsers();

    if (!users[target.id]) {
      return msg.reply("❌ Người này chưa có nhân vật để reset!");
    }

    // Xoá user cũ
    delete users[target.id];
    saveUsers(users);

    // Tạo lại user với mặc định (Nhân + Kim)
    const newUser = createUser(target.id, "nhan", "kim");

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("♻️ Reset nhân vật")
      .setDescription(
        `Nhân vật của **${target.username}** đã được reset về trạng thái ban đầu.`
      )
      .addFields(
        { name: "Tộc", value: "👤 Nhân", inline: true },
        { name: "Ngũ hành", value: "⚔️ Kim", inline: true },
        { name: "Cảnh giới", value: "Luyện Khí - Tầng 1", inline: true }
      )
      .setFooter({ text: "✨ Hãy tu luyện chăm chỉ từ đầu!" });

    msg.channel.send({ embeds: [embed] });
  },
};
