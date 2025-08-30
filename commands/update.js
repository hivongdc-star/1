require("dotenv").config();
const { spawn } = require("child_process");
const path = require("path");
const { log, logError } = require("../utils/logger");

module.exports = {
  name: "update",
  aliases: ["up"],
  run: async (client, msg) => {
    const ownerId = process.env.OWNER_ID;

    if (msg.author.id !== ownerId) {
      return msg.reply("❌ Bạn không có quyền dùng lệnh này.");
    }

    try {
      const owner = await client.users.fetch(ownerId);
      await owner.send("🔄 Bot đang tiến hành update...");

      // chạy file update.bat (Windows VPS)
      const scriptPath = path.join(__dirname, "..", "update.bat");
      const child = spawn("cmd.exe", ["/c", scriptPath]);

      child.stdout.on("data", (data) => {
        log(`[UPDATE STDOUT] ${data}`);
      });

      child.stderr.on("data", (data) => {
        logError(`[UPDATE STDERR] ${data}`);
      });

      child.on("close", (code) => {
        if (code === 0) {
          log("Bot update thành công!");
          owner.send("✅ Bot đã update và restart thành công!");
        } else {
          logError(`Update process exited with code ${code}`);
          owner.send(
            `❌ Update lỗi với code ${code}. Kiểm tra logs/update.log để biết chi tiết.`
          );
        }
      });
    } catch (err) {
      logError(err, "Update Command Outer");
      msg.reply("❌ Có lỗi khi chạy update, xem log để biết chi tiết.");
    }
  },
};
