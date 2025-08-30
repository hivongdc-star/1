// commands/create.js
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const { loadUsers, saveUsers } = require("../utils/storage");
const elements = require("../utils/element");
const races = require("../utils/races");

module.exports = {
  name: "create",
  aliases: ["c"],
  run: async (client, msg) => {
    const users = loadUsers();
    if (users[msg.author.id]) {
      return msg.reply("⚠️ Bạn đã có nhân vật rồi! Dùng `-profile` để xem.");
    }

    const raceMenu = new StringSelectMenuBuilder()
      .setCustomId("select_race")
      .setPlaceholder("🧬 Chọn Tộc")
      .addOptions(
        Object.entries(races).map(([key, r]) => ({
          label: r.name,
          value: key,
          emoji: r.emoji,
        }))
      );

    const elementMenu = new StringSelectMenuBuilder()
      .setCustomId("select_element")
      .setPlaceholder("🌿 Chọn Ngũ hành")
      .addOptions([
        { label: "Kim", value: "kim", emoji: "⚔️" },
        { label: "Mộc", value: "moc", emoji: "🌿" },
        { label: "Thủy", value: "thuy", emoji: "💧" },
        { label: "Hỏa", value: "hoa", emoji: "🔥" },
        { label: "Thổ", value: "tho", emoji: "⛰️" },
      ]);

    const row1 = new ActionRowBuilder().addComponents(raceMenu);
    const row2 = new ActionRowBuilder().addComponents(elementMenu);

    const embed = new EmbedBuilder()
      .setTitle("✨ Tạo Nhân Vật")
      .setDescription("Chọn **Tộc** và **Ngũ hành** để bắt đầu tu luyện!")
      .setColor("Purple");

    const reply = await msg.reply({
      embeds: [embed],
      components: [row1, row2],
    });

    let selectedRace = null;
    let selectedElement = null;
    const collector = reply.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        return interaction.reply({
          content: "⚠️ Đây không phải lựa chọn của bạn!",
          ephemeral: true,
        });
      }

      if (interaction.customId === "select_race") {
        selectedRace = interaction.values[0];
        await interaction.reply({
          content: `🧬 Bạn đã chọn **${races[selectedRace].name}**`,
          ephemeral: true,
        });
      }

      if (interaction.customId === "select_element") {
        selectedElement = interaction.values[0];
        await interaction.reply({
          content: `🌿 Bạn đã chọn **${elements.display[selectedElement]}**`,
          ephemeral: true,
        });
      }

      if (selectedRace && selectedElement) {
        // tạo user
        const { createUser } = require("../utils/storage");
        const newUser = createUser(
          msg.author.id,
          selectedRace,
          selectedElement
        );

        const confirm = new EmbedBuilder()
          .setTitle("✅ Nhân vật đã tạo thành công!")
          .setColor("Green")
          .setDescription(
            `🧬 **Tộc:** ${races[selectedRace].emoji} ${races[selectedRace].name}\n` +
              `🌿 **Ngũ hành:** ${elements.display[selectedElement]}\n` +
              `⚔️ **Cảnh giới:** ${newUser.realm}\n` +
              `❤️ Máu: ${newUser.hp} | 🔷 Mana: ${newUser.mana}\n` +
              `🔥 Công: ${newUser.attack} | 🛡️ Thủ: ${newUser.defense} | 📦 Giáp: ${newUser.armor}\n` +
              `💢 Nộ: ${newUser.fury} | 💎 Linh Thạch: ${newUser.linhthach}`
          );

        await msg.channel.send({ embeds: [confirm] });
        collector.stop();
      }
    });

    collector.on("end", () => {
      if (!selectedRace || !selectedElement) {
        msg.channel.send(
          "⏳ Bạn chưa hoàn tất chọn Tộc và Ngũ hành, hãy thử lại!"
        );
      }
    });
  },
};
