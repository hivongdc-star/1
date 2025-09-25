const { loadUsers, saveUsers } = require("../utils/storage");

module.exports = {
  name: "chuyen",
  description: "Chuyển Linh thạch cho người chơi khác",
  aliases: ["give", "pay", "transfer", "chuyenlt"],
  usage: "-chuyen @nguoi_nhan <so_luong>",
  run: async (client, msg, args) => {
    const mention = msg.mentions.users.first();
    const users = loadUsers();
    const senderId = msg.author.id;

    // Parse patterns:
    // -chuyen @user 100
    // -chuyen 100 @user
    let targetId = mention?.id || null;
    let amountStr = null;

    if (mention) {
      // find first numeric after mention
      amountStr = args.find((a) => /^\d+$/.test(a));
    } else {
      // no mention object, try resolve from args order
      const idArg = args.find((a) => /^<@!?(\d+)>$/.test(a));
      if (idArg) {
        targetId = idArg.replace(/[<@!>]/g, "");
        amountStr = args.find((a) => /^\d+$/.test(a));
      } else if (args.length >= 2 && /^\d+$/.test(args[1])) {
        // allow: -chuyen 100 @user
        amountStr = args[1];
        const id2 = args.find((a) => /^<@!?(\d+)>$/.test(a));
        if (id2) targetId = id2.replace(/[<@!>]/g, "");
      }
    }

    // Validate
    if (!targetId || !amountStr) {
      return msg.reply(
        "❌ Cú pháp: `-chuyen @nguoi_nhan <so_luong>` hoặc `-chuyen <so_luong> @nguoi_nhan>`"
      );
    }
    if (targetId === senderId) {
      return msg.reply("❌ Bạn không thể tự chuyển cho chính mình.");
    }

    const amount = parseInt(amountStr, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      return msg.reply("❌ Số lượng phải là số nguyên dương.");
    }
    if (amount > 1_000_000_000) {
      return msg.reply("❌ Số lượng quá lớn.");
    }

    // Ensure both users exist
    if (!users[senderId]) {
      return msg.reply("⚠️ Bạn chưa tạo nhân vật. Dùng `-create` trước.");
    }
    if (!users[targetId]) {
      return msg.reply("⚠️ Người nhận chưa tạo nhân vật.");
    }

    const senderLT = users[senderId].lt || 0;
    if (senderLT < amount) {
      return msg.reply(`❌ Bạn không đủ Linh thạch. Hiện có: **${senderLT}**`);
    }

    // Transfer
    users[senderId].lt = senderLT - amount;
    users[targetId].lt = (users[targetId].lt || 0) + amount;
    saveUsers(users);

    return msg.reply(
      `✅ Đã chuyển **${amount}** 💎 Linh thạch cho <@${targetId}>.\n` +
      `📤 Số dư của bạn: **${users[senderId].lt}**\n` +
      `📥 Số dư của họ: **${users[targetId].lt}**`
    );
  },
};
