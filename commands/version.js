const { execSync } = require("child_process");

module.exports = {
  name: "version",
  aliases: ["ver", "v"],
  description: "Xem phiên bản bot hiện tại",

  run: async (client, msg) => {
    try {
      const version = "1.0"; // 🔖 Phiên bản hiện tại
      const commit = execSync("git rev-parse --short HEAD").toString().trim();
      const branch = execSync("git rev-parse --abbrev-ref HEAD")
        .toString()
        .trim();

      msg.reply(
        `📦 **Bot Cultivation**\n` +
          `🔖 Phiên bản: **v${version}**\n` +
          `🌿 Branch: **${branch}**\n` +
          `📝 Commit: \`${commit}\``
      );
    } catch (err) {
      console.error("Version command error:", err);
      msg.reply("⚠️ Không thể lấy thông tin phiên bản.");
    }
  },
};
