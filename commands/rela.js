const { getRela } = require("../shop/shopUtils");
const { loadUsers } = require("../utils/storage");

module.exports = {
  name: "rela",
  aliases: ["relationship"],
  run: async (client, msg, args) => {
    const target = msg.mentions.users.first();
    if (!target) return msg.reply("❌ Bạn phải mention một người để xem độ thân mật.");

    const users = loadUsers();
    const u1 = users[msg.author.id];
    const u2 = users[target.id];
    if (!u1 || !u2) return msg.reply("❌ Một trong hai người chưa có nhân vật.");

    const rela = getRela(msg.author.id, target.id);
    let status = "Không có quan hệ";

    if (u1.relationships?.partnerId === target.id) {
      status = "Đang kết hôn 💍";
    } else if (rela > 0) {
      status = "Đang hẹn hò 💖";
    }

    msg.reply(
      `💞 Độ thân mật giữa **${u1.name}** và **${u2.name}**: **${rela}**\n📌 Trạng thái: ${status}`
    );
  },
};
