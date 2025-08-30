// commands/reset.js
const { loadUsers, saveUsers } = require("../utils/storage");

module.exports = {
  name: "reset",
  aliases: ["rs"],
  run: async (client, msg) => {
    const users = loadUsers();
    if (!users[msg.author.id]) {
      return msg.reply("⚠️ Bạn chưa có nhân vật để reset.");
    }

    // Xoá user cũ
    delete users[msg.author.id];
    saveUsers(users);

    await msg.reply(
      "♻️ Nhân vật của bạn đã được xoá. Hãy chọn lại để bắt đầu!"
    );

    // Gọi lại lệnh create để hiển thị menu chọn mới
    const createCmd = require("./create");
    await createCmd.run(client, msg, []);
  },
};
