// commands/tang.js
const { loadUsers, saveUsers } = require("../utils/storage");
const { addRelaByType } = require("../utils/relaUtils");

module.exports = {
  name: "tang",
  aliases: ["tặng", "gift"],
  run: async (client, msg, args) => {
    const authorId = msg.author.id;
    const mentioned = msg.mentions.users.first();

    if (!mentioned || mentioned.bot || mentioned.id === authorId) {
      return msg.reply("❌ Bạn phải mention đúng người muốn tặng.");
    }

    const targetId = mentioned.id;
    const users = loadUsers();

    if (!users[authorId]) return msg.reply("❌ Bạn chưa có hồ sơ nhân vật.");
    if (!users[targetId]) return msg.reply("❌ Người này chưa có hồ sơ nhân vật.");

    const inv = users[authorId].inventory || [];
    if (inv.length === 0) {
      return msg.reply("📭 Túi của bạn đang trống, không có gì để tặng.");
    }

    // hiển thị danh sách item
    const lines = inv.map(
      (item, i) => `**${i + 1}.** ${item.name} (x${item.qty})`
    );

    const prompt = await msg.channel.send(
      `🎁 Bạn muốn tặng gì cho <@${targetId}>?\n${lines.join("\n")}\n\n👉 Gõ số thứ tự để chọn.`
    );

    // chờ người tặng chọn
    const filter = (m) => m.author.id === authorId;
    const collected = await msg.channel.awaitMessages({
      filter,
      max: 1,
      time: 30000,
    });

    if (!collected || collected.size === 0) {
      return msg.reply("⏰ Hết thời gian chọn vật phẩm.");
    }

    const choice = parseInt(collected.first().content.trim());
    if (isNaN(choice) || choice < 1 || choice > inv.length) {
      return msg.reply("❌ Lựa chọn không hợp lệ.");
    }

    const item = inv[choice - 1];

    // trừ item khỏi kho
    if (item.qty <= 0) {
      return msg.reply("❌ Bạn không còn vật phẩm này.");
    }
    item.qty--;
    if (item.qty === 0) {
      inv.splice(choice - 1, 1);
    }
    users[authorId].inventory = inv;

    // cộng rela cho cả 2
    // tạm dùng giá trị item.value nếu có, không thì mặc định +10
    const relaGain = item.value ? item.value : 10;
    addRelaByType(authorId, targetId, "gift"); // có thể thêm type "gift" riêng nếu muốn
    // nếu muốn cộng theo giá trị, ta sửa hàm addRelaByType hoặc gọi trực tiếp
    // ở đây demo: gift = +relaGain
    const val = require("../utils/relaUtils");
    for (let i = 0; i < Math.ceil(relaGain / 10); i++) {
      val.addRelaByType(authorId, targetId, "mention"); // tạm reuse mention = 50
    }

    saveUsers(users);

    msg.channel.send(
      `🎉 <@${authorId}> đã tặng **${item.name}** cho <@${targetId}>!\n💞 Rela của hai bạn đã tăng.`
    );
  },
};
