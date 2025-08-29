const { loadUsers, saveUsers } = require("../utils/storage");

module.exports = {
  name: "bio",
  run: (client, msg, args) => {
    const users = loadUsers();
    if (!users[msg.author.id])
      return msg.channel.send("❌ Bạn chưa có nhân vật.");

    const text = args.join(" ");
    if (!text) return msg.channel.send("❌ Hãy nhập bio mới.");

    users[msg.author.id].bio = text;
    saveUsers(users);

    msg.channel.send("✅ Cập nhật bio thành công.");
  },
};
