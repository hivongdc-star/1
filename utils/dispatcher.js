const fs = require("fs");
const path = require("path");
const aliases = require("./aliases");
const { loadUsers, saveUsers } = require("./storage");
const { addXp, getRealm } = require("./xp");
const { earnFromChat } = require("./currency");

let commands = new Map();
const cooldowns = new Map();

function loadCommands() {
  const cmdFiles = fs
    .readdirSync(path.join(__dirname, "../commands"))
    .filter((f) => f.endsWith(".js"));

  cmdFiles.forEach((file) => {
    const cmd = require(path.join(__dirname, "../commands", file));
    if (!cmd || !cmd.name) return;

    commands.set(cmd.name, cmd);

    if (cmd.aliases) {
      cmd.aliases.forEach((a) => commands.set(a, cmd));
    }

    if (aliases[cmd.name]) {
      aliases[cmd.name].forEach((a) => commands.set(a, cmd));
    }
  });

  console.log(`✅ Loaded ${commands.size} commands`);
}

function handleCommand(client, msg, args) {
  let cmdName = args[0].replace("-", "").toLowerCase();
  const cmd = commands.get(cmdName);

  if (!cmd) {
    return msg.reply(`❌ Không tìm thấy lệnh: **${cmdName}**`);
  }

  try {
    cmd.run(client, msg, args.slice(1), { loadUsers, saveUsers });
  } catch (err) {
    console.error(err);
    msg.reply("⚠️ Đã xảy ra lỗi khi chạy lệnh này.");
  }
}

function startDispatcher(client) {
  loadCommands();

  // 🔔 Gắn lịch xổ số tự động (19:50 nhắc, 20:00 quay)
  require("./lotteryScheduler")(client);

  client.on("messageCreate", (msg) => {
    if (msg.author.bot) return;

    // --- Auto EXP mỗi 15s ---
    const now = Date.now();
    const last = cooldowns.get(msg.author.id) || 0;
    if (now - last >= 15000) {
      const users = loadUsers();
      let expGain = Math.floor(Math.random() * 16) + 5; // random 5–20

      if (users[msg.author.id]) {
        if (users[msg.author.id].race === "nhan")
          expGain = Math.floor(expGain * 1.05);
        if (users[msg.author.id].race === "than")
          expGain = Math.floor(expGain * 0.95);
      }

      const gained = addXp(msg.author.id, expGain);
      earnFromChat(msg.author.id);
      cooldowns.set(msg.author.id, now);

      // ⚡ Thông báo lên cấp
      if (gained > 0) {
        const u = users[msg.author.id];
        msg.channel.send(
          `⚡ **${msg.author.username}** đã đột phá **${gained} cấp**!\n` +
            `📖 Hiện tại cảnh giới: **${u ? getRealm(u.level) : "???"}**`
        );
      }
    }

    if (msg.content.startsWith("-")) {
      const args = msg.content.trim().split(/\s+/);
      handleCommand(client, msg, args);
    }
  });
}

module.exports = { startDispatcher };
