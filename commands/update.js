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
          `❌ Lỗi khi git pull:\n\`\`\`${error.message}\`\`\``
        );
      }

      if (stderr && !stderr.includes("Already up to date")) {
        message.channel.send(`⚠️ Cảnh báo:\n\`\`\`${stderr}\`\`\``);
      }

      message.channel
        .send(`✅ Update thành công:\n\`\`\`${stdout}\`\`\``)
        .then(() => {
          message.channel.send("♻️ Restart bot bằng PM2...");
          process.exit(0); // PM2 sẽ tự restart
        });
    });
  },
};
