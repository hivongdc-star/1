const { EmbedBuilder } = require("discord.js");
const { loadUsers } = require("../utils/storage");

// emoji
const raceEmojis = {
  nhan: "👤 Nhân",
  ma: "😈 Ma",
  tien: "👼 Tiên",
  yeu: "🦊 Yêu",
  than: "⚡ Thần",
};

const elementEmojis = {
  kim: "⚔️ Kim",
  moc: "🌿 Mộc",
  thuy: "💧 Thủy",
  hoa: "🔥 Hỏa",
  tho: "⛰️ Thổ",
};

const realms = [
  "Luyện Khí",
  "Trúc Cơ",
  "Kết Đan",
  "Nguyên Anh",
  "Hóa Thần",
  "Hợp Thể",
  "Độ Kiếp",
  "Đại Thừa",
  "Tán Tiên",
  "Chân Tiên",
  "Địa Tiên",
  "Thiên Tiên",
  "Kim Tiên",
  "Tiên Quân",
  "Tiên Vương",
  "Tiên Hoàng",
  "Tiên Đế",
];

module.exports = {
  name: "profile",
  aliases: ["p"],
  run: async (client, msg) => {
    const users = loadUsers();
    const user = users[msg.author.id];

    if (!user) {
      return msg.reply("⚠️ Bạn chưa có nhân vật. Hãy dùng `-crate` để tạo!");
    }

    // Tính cảnh giới + tầng
    let exp = user.exp || 0;
    let base = 100;
    let level = 0;

    while (exp >= base) {
      exp -= base;
      level++;
      base = Math.floor(base * 1.1);
    }

    const realmIndex = Math.floor(level / 10);
    const stage = (level % 10) + 1;
    const realm = realmIndex < realms.length ? realms[realmIndex] : "Siêu việt";

    // Embed
    const embed = new EmbedBuilder()
      .setColor("Purple")
      .setTitle(`📜 Hồ sơ *${msg.author.username}*`)
      .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: "🌟 Danh hiệu",
          value: user.danhHieu || "Chưa có",
          inline: true,
        },
        {
          name: "🧬 Tộc",
          value: raceEmojis[user.toc] || "Chưa chọn",
          inline: true,
        },
        {
          name: "🌿 Ngũ hành",
          value: elementEmojis[user.he] || "Chưa chọn",
          inline: true,
        },
        {
          name: "⚔️ Cảnh giới",
          value: `${realm} – Tầng ${stage}`,
          inline: true,
        },
        {
          name: "✨ EXP",
          value: `${user.exp || 0}`,
          inline: true,
        },
        {
          name: "❤️ Máu",
          value: `${user.hp || 100}`,
          inline: true,
        },
        {
          name: "🔥 Công",
          value: `${user.cong || 10}`,
          inline: true,
        },
        {
          name: "🛡️ Thủ",
          value: `${user.thu || 10}`,
          inline: true,
        },
        {
          name: "📦 Giáp",
          value: `${user.giap || 10}`,
          inline: true,
        },
        {
          name: "🔷 Năng lượng",
          value: `${user.mana || 100}`,
          inline: true,
        },
        {
          name: "💢 Nộ",
          value: `${user.no || 0}`,
          inline: true,
        },
        {
          name: "💎 Linh thạch",
          value: `${user.linhThach || 0}`,
          inline: true,
        },
        {
          name: "📖 Bio",
          value: user.bio || "Chưa có",
        }
      )
      .setFooter({ text: "✨ Tu luyện chăm chỉ để tiến xa hơn!" });

    msg.reply({ embeds: [embed] });
  },
};
