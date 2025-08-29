const { exec } = require("child_process");

module.exports = {
  name: "update",
  description: "Cập nhật code từ GitHub và restart bot (Admin only)",
  run: async (client, msg) => {
    const OWNER_ID = process.env.OWNER_ID;

    if (msg.author.id !== OWNER_ID) {
      return msg.reply("❌ Bạn không có quyền dùng lệnh này.");
    }

    msg.reply("🔄 Đang tiến hành update...");

    exec("./update.sh", async (err, stdout, stderr) => {
      const owner = await client.users.fetch(OWNER_ID);

      if (err) {
        console.error("Update error:", err);
        if (owner) {
          owner
            .send("❌ Lỗi khi update bot:\n```" + err.message + "```")
            .catch(() => {});
        }
        return msg.channel.send("❌ Lỗi khi update bot.");
      }

      if (stderr) console.error(stderr);

      // báo trong channel
      msg.channel.send(
        "✅ Bot đã được cập nhật và restart!\n```" + stdout + "```"
      );

      // báo riêng cho OWNER
      if (owner) {
        owner
          .send("✅ Bot đã update & restart thành công!\n```" + stdout + "```")
          .catch(() => {});
      }
    });
  },
};
