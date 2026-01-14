const fs = require("fs");
const path = require("path");
const aliases = require("./aliases");
const { saveImageFromUrl, saveImageFromBuffer } = require("./imageStore");

let commands = new Map();

function loadCommands() {
  const cmdFiles = fs
    .readdirSync(path.join(__dirname, "../commands"))
    .filter((f) => f.endsWith(".js"));

  cmdFiles.forEach((file) => {
    const cmd = require(path.join(__dirname, "../commands", file));
    if (!cmd || !cmd.name) return;

    commands.set(cmd.name, cmd);

    // Giữ đúng cơ chế alias hiện tại: chỉ dùng utils/aliases.js
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

  // Context stub để tránh crash nếu còn sót command cũ destructuring {loadUsers,saveUsers}
  // Nhưng nếu command cố gọi vào hệ nhân vật, sẽ nổ rõ ràng (thay vì âm thầm sai dữ liệu).
  const ctx = {
    loadUsers: () => {
      throw new Error("CHARACTER_SYSTEM_REMOVED");
    },
    saveUsers: () => {
      throw new Error("CHARACTER_SYSTEM_REMOVED");
    },
  };

  try {
    cmd.run(client, msg, args.slice(1), ctx);
  } catch (err) {
    console.error(err);
    msg.reply("⚠️ Đã xảy ra lỗi khi chạy lệnh này.");
  }
}

function startDispatcher(client) {
  loadCommands();

  // Đồng bộ với commands/reload.js (nó thao tác client.commands)
  client.commands = commands;

  client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    // --- Image save ---
    try {
      if ((msg.attachments?.size || 0) > 0) {
        for (const att of msg.attachments.values()) {
          const ctype = att.contentType || "";
          if (ctype.startsWith("image/")) {
            const result = await saveImageFromUrl(att.url, {
              mime: ctype,
              originalName: att.name || "image",
            });
            console.log("Saved image:", result.relPath, result.bytes, "bytes");
          }
        }
      }

      // data URL in message content
      const m = msg.content?.match(
        /data:image\/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/=]+)/
      );
      if (m) {
        const buf = Buffer.from(m[1], "base64");
        const res2 = saveImageFromBuffer(buf, {
          mime: "image/auto",
          originalName: "pasted",
        });
        console.log("Saved inline image:", res2.relPath);
      }
    } catch (e) {
      console.error("Image save error:", e?.message || e);
    }

    // --- Command ---
    if (msg.content.startsWith("-")) {
      const args = msg.content.trim().split(/\s+/);
      handleCommand(client, msg, args);
    }
  });
}

module.exports = { startDispatcher };
