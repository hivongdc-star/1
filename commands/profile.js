const { EmbedBuilder } = require("discord.js");
const { loadUsers } = require("../utils/storage");
const { getExpNeeded, getRealm } = require("../utils/xp");
const elements = require("../utils/element");
const races = require("../utils/races");

const elementColors = {
  kim: "Grey",
  moc: "Green",
  thuy: "Blue",
  hoa: "Red",
  tho: "Yellow",
};

module.exports = {
  name: "profile",
  aliases: ["p"],
  run: async (client, msg) => {
    const users = loadUsers();
    const user = users[msg.author.id];
    if (!user)
      return msg.reply("⚠️ Bạn chưa có nhân vật. Hãy dùng `-create` để tạo!");

    const realm = getRealm(user.level ?? 1);
    const expNow = user.exp ?? 0;
    const expNeed = getExpNeeded(user.level ?? 1);
    const displayName = user.name || msg.author.username;

    const embed = new EmbedBuilder()
      .setColor(elementColors[user.element] || "Purple")
      .setTitle(`📜 Hồ sơ *${displayName}*`)
      .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "🌟 Danh hiệu", value: user.title || "Chưa có", inline: true },
        {
          name: "🧬 Tộc",
          value: races[user.race]
            ? `${races[user.race].emoji} ${races[user.race].name}`
            : "Chưa chọn",
          inline: true,
        },
        {
          name: "🌿 Ngũ hành",
          value: elements.display?.[user.element] || "Chưa chọn",
          inline: true,
        },
        { name: "⚔️ Cảnh giới", value: String(realm), inline: true },
        {
          name: "✨ EXP",
          value: `${expNow.toLocaleString()} / ${expNeed.toLocaleString()}`,
          inline: true,
        },
        { name: "❤️ Máu", value: String(user.hp ?? 100), inline: true },
        { name: "🔷 Mana", value: String(user.mp ?? 100), inline: true },
        { name: "🔥 Công", value: String(user.atk ?? 10), inline: true },
        { name: "🛡️ Thủ", value: String(user.def ?? 10), inline: true },
        { name: "⚡ Tốc", value: String(user.spd ?? 10), inline: true },
        { name: "💢 Nộ", value: String(user.fury ?? 0), inline: true },
        { name: "💎 Linh thạch", value: String(user.lt ?? 0), inline: true },
        {
          name: "📖 Bio",
          value: user.bio
            ? user.bio.slice(0, 200) + (user.bio.length > 200 ? "..." : "")
            : "Chưa có",
        }
      )
      .setFooter({ text: "✨ Tu luyện chăm chỉ để tiến xa hơn!" });

    msg.reply({ embeds: [embed] });
  },
};
