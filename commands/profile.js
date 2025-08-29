const { EmbedBuilder } = require("discord.js");
const { loadUsers } = require("../utils/storage");
const { getExpNeeded, getRealm } = require("../utils/xp");

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

module.exports = {
  name: "profile",
  aliases: ["p"],
  run: async (client, msg) => {
    const users = loadUsers();
    const user = users[msg.author.id];

    if (!user) {
      return msg.reply("⚠️ Bạn chưa có nhân vật. Hãy dùng `-crate` để tạo!");
    }

    // Cảnh giới + tầng
    const realm = getRealm(user.level || 1);
    const expNow = user.exp || 0;
    const expNeed = getExpNeeded(user.level || 1);

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
          value: elementEmojis[user.element] || "Chưa chọn",
          inline: true,
        },
        {
          name: "⚔️ Cảnh giới",
          value: `${realm}`,
          inline: true,
        },
        {
          name: "✨ EXP",
          value: `${expNow} / ${expNeed}`,
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
          value: `${user.currency || 0}`,
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
