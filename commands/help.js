const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h"],
  run: (client, msg) => {
    const embed = new EmbedBuilder()
      .setTitle("📖 Danh sách lệnh")
      .setColor(0x00ae86)
      .addFields(
        {
          name: "👤 Nhân vật",
          value:
            "`-crate`, `-profile` (`-p`), `-doiten`, `-bio`, `-change`, `-danhhieu`",
        },
        { name: "💎 Kinh tế", value: "`-daily`, `-shop`" },
        { name: "⚔️ PK", value: "`-thachdau`, `-acp`, `-huy`" },
        { name: "🌸 Khác", value: "`-tieunhu`" }
      )
      .setFooter({ text: "Dùng lệnh bằng cách gõ -<lệnh>" });

    msg.channel.send({ embeds: [embed] });
  },
};
