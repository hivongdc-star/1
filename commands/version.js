const { execSync } = require("child_process");
const { version } = require("../package.json"); // lấy version từ package.json

module.exports = {
  name: "version",
  aliases: ["ver", "v"],
  description: "Xem phiên bản bot và bản cập nhật mới nhất",

  run: async (client, msg) => {
    try {
      // branch và commit
      const commit = execSync("git rev-parse --short HEAD").toString().trim();
      const branch = execSync("git rev-parse --abbrev-ref HEAD")
        .toString()
        .trim();

      // message + date của commit mới nhất
      const commitMsg = execSync("git log -1 --pretty=%B").toString().trim();
      const commitDate = execSync("git log -1 --date=short --pretty=format:%cd")
        .toString()
        .trim();

      msg.reply(
        `📦 **Bot Cultivation**\n` +
          `🔖 Phiên bản: **v${version}**\n` +
          `🌿 Branch: **${branch}**\n` +
          `📝 Commit: \`${commit}\`\n` +
          `💬 Message: *${commitMsg}*\n` +
          `📅 Ngày: ${commitDate}`
      );
    } catch (err) {
      console.error("Version command error:", err);
      msg.reply("⚠️ Không thể lấy thông tin phiên bản.");
    }
  },
};
