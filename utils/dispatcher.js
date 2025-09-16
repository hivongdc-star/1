const fs = require("fs");
const path = require("path");
const aliases = require("./aliases");
const { loadUsers, saveUsers } = require("./storage");
const { addXp, getRealm } = require("./xp");
const { earnFromChat, rewardGameResults } = require("./currency");

// --- Nối từ (Noitu) ---
const { getGame, addTurn, stopGame } = require("../noitu/noituState");

// --- Rela ---
const { handleMessageEvent } = require("./relaUtils");

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

  // 🔔 Lên lịch quay số (19:50 nhắc, 20:00 quay)
  require("./lotteryScheduler")(client);

  client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    // --- RELA ---
    const mentionedIds = msg.mentions.users
      .filter((u) => !u.bot && u.id !== msg.author.id)
      .map((u) => u.id);

    let repliedUserId = null;
    if (msg.type === 19 && msg.mentions.repliedUser && !msg.mentions.repliedUser.bot) {
      repliedUserId = msg.mentions.repliedUser.id;
    }

    handleMessageEvent({
      channelId: msg.channel.id,
      authorId: msg.author.id,
      mentionedIds,
      repliedUserId,
    });

    // --- Nối từ ---
    const state = getGame(msg.channel.id);
    if (state && state.active && !msg.content.startsWith("-")) {
      const result = addTurn(msg.channel.id, msg.author.id, msg.content.trim());

      if (!result.success) {
        msg.react("❌");
      } else {
        msg.react("✅");

        if (state.wordCount >= state.maxWords) {
          const finished = stopGame(msg.channel.id);
          const results = rewardGameResults(finished.players);

          let board = results.length
            ? results
                .map(
                  (r, i) =>
                    `${i + 1}. <@${r.userId}> - ${r.words} từ → +${r.reward} LT`
                )
                .join("\n")
            : "Không có ai tham gia 😢";

          msg.channel.send(
            `🎉 Game nối từ đã hoàn thành ${finished.maxWords}/${finished.maxWords} từ!\n\n${board}`
          );
        }
      }

      return;
    }

    // --- Auto EXP mỗi 15s ---
    const now = Date.now();
    const last = cooldowns.get(msg.author.id) || 0;
    if (now - last >= 15000) {
      const users = loadUsers();
      let expGain = Math.floor(Math.random() * 16) + 5;

      if (users[msg.author.id]) {
        if (users[msg.author.id].race === "nhan")
          expGain = Math.floor(expGain * 1.05);
        if (users[msg.author.id].race === "than")
          expGain = Math.floor(expGain * 0.95);
      }

      const gained = addXp(msg.author.id, expGain);
      earnFromChat(msg.author.id);
      cooldowns.set(msg.author.id, now);

      if (gained > 0) {
        const updatedUsers = loadUsers();
        const u = updatedUsers[msg.author.id];
        const displayName = u?.name || msg.author.username;

        msg.channel.send(
          `⚡ **${displayName}** đã đột phá **${gained} cấp**!\n` +
            `📖 Hiện tại cảnh giới: **${u ? getRealm(u.level) : "???"}**`
        );
      }
    }

    // --- Command ---
    if (msg.content.startsWith("-")) {
      const args = msg.content.trim().split(/\s+/);
      handleCommand(client, msg, args);
    }
  });
}

module.exports = { startDispatcher };
