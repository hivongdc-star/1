const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const { useSkill, resetAfterBattle } = require("./duel");
const { loadUsers } = require("./storage");
const skills = require("./skills");
const { createBar } = require("./barHelper");

function createBattleEmbed(state, users) {
  const p1 = users[state.players[0]];
  const p2 = users[state.players[1]];

  let desc = "";
  if (state.finished) {
    desc = "🏆 " + state.logs[state.logs.length - 1];
  } else {
    const lastLog = state.logs[state.logs.length - 1];
    desc =
      (lastLog ? lastLog + "\n\n" : "") +
      `👉 Lượt của **${users[state.turn].name}**`;
  }

  return new EmbedBuilder()
    .setTitle("⚔️ Trận đấu")
    .setDescription(desc)
    .addFields(
      {
        name: `${p1.name}`,
        value:
          `❤️ HP: ${createBar(p1.hp, p1.maxHp, 15, "❤️")} (${p1.hp}/${
            p1.maxHp
          })\n` +
          `🔵 Mana: ${createBar(p1.mana, p1.maxMana, 15, "🔵")} (${p1.mana}/${
            p1.maxMana
          })\n` +
          `🔥 Nộ: ${createBar(p1.fury, 100, 15, "🔥")} (${p1.fury}/100)`,
        inline: true,
      },
      {
        name: `${p2.name}`,
        value:
          `❤️ HP: ${createBar(p2.hp, p2.maxHp, 15, "❤️")} (${p2.hp}/${
            p2.maxHp
          })\n` +
          `🔵 Mana: ${createBar(p2.mana, p2.maxMana, 15, "🔵")} (${p2.mana}/${
            p2.maxMana
          })\n` +
          `🔥 Nộ: ${createBar(p2.fury, 100, 15, "🔥")} (${p2.fury}/100)`,
        inline: true,
      }
    )
    .setColor(state.finished ? "Gold" : "Purple");
}

function createSkillMenu(user, isTurn) {
  const element = user.element;
  const skillList = skills[element] || [];

  const menu = new StringSelectMenuBuilder()
    .setCustomId(`duel-skill-${user.id}`)
    .setPlaceholder(isTurn ? "Chọn skill để sử dụng" : "Chưa tới lượt của bạn")
    .setDisabled(!isTurn);

  if (skillList.length === 0) {
    menu.addOptions([{ label: "Không có skill", value: "none" }]);
  } else {
    const options = skillList.map((s, i) => ({
      label: `${s.name}`,
      description: `${s.description} | Mana:${s.cost?.mana || 0}, Nộ:${
        s.cost?.fury || 0
      }`,
      value: s.name,
    }));
    menu.addOptions(options);
  }

  return new ActionRowBuilder().addComponents(menu);
}

async function sendBattleEmbeds(client, state, channel) {
  const users = loadUsers();
  const p1 = users[state.players[0]];
  const p2 = users[state.players[1]];
  const embed = createBattleEmbed(state, users);

  const row1 = createSkillMenu(p1, state.turn === p1.id);
  const row2 = createSkillMenu(p2, state.turn === p2.id);

  await channel.send({ embeds: [embed], components: [row1, row2] });
}

async function handleSkillInteraction(interaction, client) {
  const userId = interaction.customId.split("duel-skill-")[1];
  if (interaction.user.id !== userId) {
    return interaction.reply({
      content: "❌ Không phải lượt của bạn!",
      ephemeral: true,
    });
  }

  await interaction.deferUpdate();
  const skillName = interaction.values[0];
  const state = useSkill(userId, skillName);
  const users = loadUsers();

  if (state.finished) {
    resetAfterBattle(state);
    const embed = createBattleEmbed(state, users);
    await interaction.channel.send({ embeds: [embed], components: [] });
    return;
  }

  await sendBattleEmbeds(client, state, interaction.channel);
  await interaction.followUp({
    content: `✅ Bạn đã dùng skill: ${skillName}`,
    ephemeral: true,
  });
}

module.exports = { sendBattleEmbeds, handleSkillInteraction };
