// commands/profile.js
const { EmbedBuilder } = require("discord.js");
const { loadUsers } = require("../utils/storage");
const { getExpNeeded, getRealm } = require("../utils/xp");
const elements = require("../utils/element");
const races = require("../utils/races");

module.exports = {
  name: "profile",
  aliases: ["p"],
  run: async (client, msg) => {
    const users = loadUsers();
    const user = users[msg.author.id];
    if (!user)
      return msg.reply("⚠️ Bạn chưa có nhân vật. Hãy dùng `-create` để tạo!");

    const realm = getRealm(user.level || 1);
    const expNow = user.exp || 0;
    const expNeed = getExpNeeded(user.level || 1);
    const displayName = user.name || msg.author.username;

    const embed = new EmbedBuilder()
      .setColor("Purple")
      .setTitle(`📜 Hồ sơ *${displayName}*`)
      .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "🌟 Danh hiệu", value: user.title || "Chưa có", inline: true },
        {
          name: "🧬 Tộc",
          value:
            races[user.race]?.emoji + " " + races[user.race]?.name ||
            "Chưa chọn",
          inline: true,
        },
        {
          name: "🌿 Ngũ hành",
          value: elements.display[user.element] || "Chưa chọn",
          inline: true,
        },
        { name: "⚔️ Cảnh giới", value: `${realm}`, inline: true },
        { name: "✨ EXP", value: `${expNow} / ${expNeed}`, inline: true },
        { name: "❤️ Máu", value: `${user.hp}`, inline: true },
        { name: "🔥 Công", value: `${user.attack}`, inline: true },
        { name: "🛡️ Thủ", value: `${user.defense}`, inline: true },
        { name: "📦 Giáp", value: `${user.armor}`, inline: true },
        { name: "🔷 Năng lượng", value: `${user.mana}`, inline: true },
        { name: "💢 Nộ", value: `${user.fury}`, inline: true },
        { name: "💎 Linh thạch", value: `${user.linhthach}`, inline: true },
        { name: "📖 Bio", value: user.bio || "Chưa có" }
      )
      .setFooter({ text: "✨ Tu luyện chăm chỉ để tiến xa hơn!" });

    msg.reply({ embeds: [embed] });
  },
};
