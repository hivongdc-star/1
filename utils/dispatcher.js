const fs = require("fs");
const path = require("path");
const aliases = require("./aliases");
const { loadUsers, saveUsers } = require("./storage");
const { addXp } = require("./xp");
const { earnFromChat } = require("./currency");

let commands = new Map();
const cooldowns = new Map(); // cooldown cho XP

// Load commands trong thư mục /commands
function loadCommands() {
  const cmdFiles = fs
    .readdirSync(path.join(__dirname, "../commands"))
    .filter((f) => f.endsWith(".js"));

  cmdFiles.forEach((file) => {
    const cmd = require(`../commands/${file}`);
    if (!cmd || !cmd.name) return;

    commands.set(cmd.name, cmd);

    // alias trong file
    if (cmd.aliases) {
      cmd.aliases.forEach((a) => commands.set(a, cmd));
    }

    // alias trong aliases.js
    if (aliases[cmd.name]) {
      aliases[cmd.name].forEach((a) => commands.set(a, cmd));
    }
  });
}

// Xử lý lệnh
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

// Dispatcher chính
function startDispatcher(client) {
  loadCommands();

  client.on("messageCreate", (msg) => {
    if (msg.author.bot) return;

    // --- Auto XP mỗi 15s ---
    const now = Date.now();
    const last = cooldowns.get(msg.author.id) || 0;
    if (now - last >= 15000) {
      addXp(msg.author.id, 5); // mỗi 15s chat +5 EXP
      earnFromChat(msg.author.id); // mỗi tin nhắn +1 linh thạch (tối đa 1000/ngày)
      cooldowns.set(msg.author.id, now);
    }

    // --- Command ---
    if (msg.content.startsWith("-")) {
      const args = msg.content.trim().split(/\s+/);
      handleCommand(client, msg, args);
    }
  });
}

module.exports = { startDispatcher };
