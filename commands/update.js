const { exec } = require("child_process");
const { OWNER_ID } = process.env;

module.exports = {
  name: "update",
  description: "Cập nhật code mới từ GitHub và restart bot (Admin Only)",
  async run(client, message, args) {
    if (message.author.id !== OWNER_ID) {
      return message.reply("❌ Bạn không có quyền dùng lệnh này.");
    }

    message.reply("🔄 Đang cập nhật code từ GitHub...");

    exec("git pull", (error, stdout, stderr) => {
      if (error) {
        return message.channel.send(
          `❌ Lỗi khi git pull: \`${error.message}\``
        );
      }
      if (stderr) {
        return message.channel.send(`⚠️ Cảnh báo: \`${stderr}\``);
      }

      message.channel.send(`✅ Update thành công:\n\`\`\`${stdout}\`\`\``);

      // restart bot bằng cách thoát process
      message.channel.send("♻️ Restart bot...");
      process.exit(0);
    });
  },
};
