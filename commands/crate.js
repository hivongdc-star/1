const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const { loadUsers, saveUsers } = require("../utils/storage");

module.exports = {
  name: "crate",
  aliases: ["create"],
  run: async (client, msg) => {
    const users = loadUsers();

    // Nếu đã có nhân vật rồi
    if (users[msg.author.id]) {
      return msg.reply("⚠️ Bạn đã có nhân vật rồi!");
    }

    // Menu chọn Tộc
    const tocMenu = new StringSelectMenuBuilder()
      .setCustomId("select_toc")
      .setPlaceholder("🧬 Chọn Tộc")
      .addOptions([
        { label: "Nhân", value: "nhan", emoji: "👤" },
        { label: "Ma", value: "ma", emoji: "😈" },
        { label: "Tiên", value: "tien", emoji: "👼" },
        { label: "Yêu", value: "yeu", emoji: "🦊" },
        { label: "Thần", value: "than", emoji: "⚡" },
      ]);

    // Menu chọn Hệ
    const heMenu = new StringSelectMenuBuilder()
      .setCustomId("select_he")
      .setPlaceholder("🌿 Chọn Hệ")
      .addOptions([
        { label: "Kim", value: "kim", emoji: "⚔️" },
        { label: "Mộc", value: "moc", emoji: "🌿" },
        { label: "Thủy", value: "thuy", emoji: "💧" },
        { label: "Hỏa", value: "hoa", emoji: "🔥" },
        { label: "Thổ", value: "tho", emoji: "⛰️" },
      ]);

    const row1 = new ActionRowBuilder().addComponents(tocMenu);
    const row2 = new ActionRowBuilder().addComponents(heMenu);

    const embed = new EmbedBuilder()
      .setTitle("✨ Tạo Nhân Vật")
      .setDescription(
        "Hãy chọn **Tộc** và **Hệ** để bắt đầu con đường tu luyện của bạn!"
      )
      .setColor("Purple");

    const reply = await msg.reply({
      embeds: [embed],
      components: [row1, row2],
    });

    // Collector xử lý chọn
    const collector = reply.createMessageComponentCollector({
      time: 60000,
    });

    let selectedRace = null;
    let selectedElement = null;

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        return interaction.reply({
          content: "⚠️ Đây không phải lựa chọn của bạn!",
          ephemeral: true,
        });
      }

      if (interaction.customId === "select_toc") {
        selectedRace = interaction.values[0];
        await interaction.reply({
          content: `🧬 Bạn đã chọn **${selectedRace}**`,
          ephemeral: true,
        });
      }

      if (interaction.customId === "select_he") {
        selectedElement = interaction.values[0];
        await interaction.reply({
          content: `🌿 Bạn đã chọn **${selectedElement}**`,
          ephemeral: true,
        });
      }

      // Khi đã chọn đủ cả Tộc + Hệ
      if (selectedRace && selectedElement) {
        users[msg.author.id] = {
          id: msg.author.id,
          name: msg.author.username,
          toc: selectedRace,
          he: selectedElement,
          hp: 100,
          mana: 100,
          cong: 10,
          thu: 10,
          giap: 10,
          no: 0,
          linhThach: 0,
        };

        saveUsers(users);

        const confirm = new EmbedBuilder()
          .setTitle("✅ Nhân vật đã tạo thành công!")
          .setColor("Green")
          .setDescription(
            `🧬 **Tộc:** ${selectedRace}\n` +
              `🌿 **Hệ:** ${selectedElement}\n` +
              `❤️ Máu: 100\n` +
              `🔷 Mana: 100\n` +
              `⚔️ Công: 10\n` +
              `🛡️ Thủ: 10\n` +
              `💠 Giáp: 10\n` +
              `🔥 Nộ: 0\n` +
              `💎 Linh Thạch: 0`
          );

        await msg.channel.send({ embeds: [confirm] });
        collector.stop();
      }
    });

    collector.on("end", () => {
      if (!selectedRace || !selectedElement) {
        msg.channel.send("⏳ Bạn chưa hoàn tất chọn Tộc và Hệ, hãy thử lại!");
      }
    });
  },
};
