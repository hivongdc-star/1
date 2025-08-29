const { loadUsers, saveUsers } = require("../utils/storage");

module.exports = {
  name: "danhhieu",
  aliases: ["dh"],
  run: (client, msg, args) => {
    const users = loadUsers();
    const user = users[msg.author.id];
    if (!user) return msg.channel.send("❌ Bạn chưa có nhân vật.");

    if (!args[0]) {
      return msg.channel.send(
        `🎖️ Danh hiệu hiện tại: **${user.title || "Chưa có"}**`
      );
    }

    const newTitle = args.join(" ");
    user.title = newTitle;
    saveUsers(users);

    msg.channel.send(`✅ Danh hiệu mới: **${newTitle}**`);
  },
};
