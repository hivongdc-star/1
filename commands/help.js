// commands/help.js
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h"],
  run: async (client, msg) => {
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("📖 Danh sách lệnh cho người chơi")
      .setDescription(
        "Dưới đây là các lệnh bạn có thể sử dụng trong bot Tu Tiên:"
      )
      .addFields(
        {
          name: "✨ Tạo nhân vật",
          value: "`-create` | alias: `-c`, `-crate`\nTạo nhân vật mới",
        },
        {
          name: "📜 Hồ sơ",
          value: "`-profile` | alias: `-p`, `-prof`\nXem thông tin nhân vật",
        },
        {
          name: "♻️ Reset nhân vật",
          value:
            "`-reset` | alias: `-rs`\nReset lại nhân vật (chọn lại Tộc + Ngũ hành)",
        },
        {
          name: "📖 Bio",
          value: "`-bio` | alias: `-b`\nĐặt giới thiệu nhân vật",
        },
        {
          name: "✍️ Đổi tên",
          value:
            "`-doiten <tên>` | alias: `-rename`, `-name`\nĐổi tên nhân vật",
        },
        {
          name: "🌟 Danh hiệu",
          value: "`-danhhieu` | alias: `-title`\nĐổi danh hiệu nhân vật",
        },
        {
          name: "🎁 Daily",
          value: "`-daily` | alias: `-dly`\nNhận thưởng hàng ngày",
        },
        {
          name: "🛒 Shop",
          value: "`-shop` | alias: `-s`\nXem cửa hàng",
        },
        {
          name: "🧚 Tiểu Nhu",
          value: "`-tieunhu` | alias: `-tn`\nGọi NPC Tiểu Nhu để nhận EXP",
        },
        {
          name: "⚔️ Thách đấu",
          value: "`-thachdau @user` | alias: `-td`\nThách đấu một người chơi",
        },
        {
          name: "🔥 Chấp nhận thách đấu",
          value: "`-acp` | alias: `-accept`\nChấp nhận lời thách đấu",
        },
        {
          name: "❌ Từ chối thách đấu",
          value: "`-deny` | alias: `-d`\nTừ chối lời thách đấu",
        },
        {
          name: "🚫 Hủy hành động",
          value: "`-cancel` | alias: `-cxl`\nHủy lời thách đấu hoặc hành động",
        },
        {
          name: "ℹ️ Hướng dẫn",
          value: "`-help` | alias: `-h`\nXem danh sách lệnh",
        }
      )
      .setFooter({ text: "✨ Hãy tu luyện chăm chỉ để mạnh hơn!" });

    msg.reply({ embeds: [embed] });
  },
};
