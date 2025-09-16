// commands/marry.js
const { getEligiblePartners, getRela } = require("../utils/relaUtils");
const { loadUsers, saveUsers } = require("../utils/storage");

module.exports = {
  name: "marry",
  run: async (client, msg, args) => {
    const userId = msg.author.id;
    const users = loadUsers();

    if (!users[userId]) {
      return msg.reply("❌ Bạn chưa có hồ sơ nhân vật.");
    }

    // check nếu đã kết hôn
    if (users[userId].marriedWith) {
      return msg.reply("💍 Bạn đã kết hôn rồi!");
    }

    // lấy danh sách partner đủ rela
    const eligibles = getEligiblePartners(userId, 1000);

    if (!eligibles.length) {
      return msg.reply("❌ Hiện chưa có ai đủ **1000 rela** để kết hôn.");
    }

    // hiển thị danh sách lựa chọn
    let msgList = eligibles
      .slice(0, 10)
      .map(
        (r, i) =>
          `**${i + 1}.** <@${r.partnerId}> — ${r.value} rela`
      )
      .join("\n");

    const listMessage = await msg.channel.send(
      `💞 Những người bạn có thể kết hôn:\n${msgList}\n\n👉 Gõ số thứ tự để chọn partner.`
    );

    // chờ user phản hồi
    const filter = (m) => m.author.id === userId;
    const collected = await msg.channel
      .awaitMessages({ filter, max: 1, time: 30000 })
      .catch(() => null);

    if (!collected || collected.size === 0) {
      return msg.reply("⏰ Hết thời gian chọn partner.");
    }

    const choice = parseInt(collected.first().content.trim());
    if (isNaN(choice) || choice < 1 || choice > eligibles.length) {
      return msg.reply("❌ Lựa chọn không hợp lệ.");
    }

    const partnerId = eligibles[choice - 1].partnerId;

    // check rela lần cuối
    const relaNow = getRela(userId, partnerId);
    if (relaNow < 1000) {
      return msg.reply("❌ Rela hiện tại chưa đủ 1000.");
    }

    // gửi đề nghị tới partner
    const proposal = await msg.channel.send(
      `💍 <@${partnerId}>, bạn có đồng ý kết hôn với <@${userId}> không?\n👉 Trả lời **có** hoặc **không** trong 30s.`
    );

    const filter2 = (m) => m.author.id === partnerId;
    const collected2 = await msg.channel
      .awaitMessages({ filter2, max: 1, time: 30000 })
      .catch(() => null);

    if (!collected2 || collected2.size === 0) {
      return msg.channel.send("⏰ Không có phản hồi, hủy kết hôn.");
    }

    const ans = collected2.first().content.toLowerCase();
    if (ans !== "có" && ans !== "yes" && ans !== "y") {
      return msg.channel.send("❌ Đối phương đã từ chối.");
    }

    // cập nhật dữ liệu
    users[userId].marriedWith = partnerId;
    users[partnerId].marriedWith = userId;

    saveUsers(users);

    msg.channel.send(
      `🎉 Chúc mừng <@${userId}> và <@${partnerId}> đã chính thức kết hôn! 💞`
    );
  },
};
