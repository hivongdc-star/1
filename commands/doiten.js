const { loadUsers, saveUsers } = require("../utils/storage");

module.exports = {
  name: "doiten",
  run: (client, msg, args) => {
    const users = loadUsers();
    if (!users[msg.author.id])
      return msg.channel.send("❌ Bạn chưa có nhân vật.");

    const newName = args.join(" ");
    if (!newName) return msg.channel.send("❌ Hãy nhập tên mới.");

    users[msg.author.id].name = newName;
    saveUsers(users);

    msg.channel.send(`✅ Đổi tên thành công: **${newName}**`);
  },
};
