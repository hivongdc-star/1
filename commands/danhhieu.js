// commands/danhhieu.js
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

    if (args[0].toLowerCase() === "xoa") {
      user.title = null;
      saveUsers(users);
      return msg.channel.send("🗑️ Danh hiệu đã được xóa.");
    }

    const newTitle = args.join(" ");
    if (newTitle.length > 30) {
      return msg.channel.send("⚠️ Danh hiệu quá dài, tối đa 30 ký tự.");
    }

    const safeTitle = newTitle.replace(/[*_`~|]/g, "");
    user.title = safeTitle;
    saveUsers(users);

    msg.channel.send(`✅ Danh hiệu mới: **${safeTitle}**`);
  },
};
