const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const { useSkill, resetAfterBattle } = require("./duel");
const { loadUsers } = require("./storage");
const skills = require("./skills");
const { createBar } = require("./barHelper");

// Emoji ngũ hành
const elementEmojis = {
  kim: "⚔️",
  moc: "🌿",
  thuy: "💧",
  hoa: "🔥",
  tho: "⛰️",
};

// 📌 Tạo embed trận đấu
function createBattleEmbed(state, users) {
  const p1 = users[state.players[0]];
  const p2 = users[state.players[1]];

  let desc = "";
  if (state.finished) {
    desc = "🏆 " + state.logs[state.logs.length - 1];
  } else {
    const lastLog = state.logs[state.logs.length - 1];
    desc = lastLog
      ? `📜 **${lastLog}**\n\n👉 Lượt của **${users[state.turn].name}**`
      : `👉 Lượt của **${users[state.turn].name}**`;
  }

  function playerField(u) {
    let buffsText = "";
    if (u.buffs?.length > 0) {
      buffsText =
        "\n🌀 Buff: " +
        u.buffs
          .map(
            (b) =>
              `${
                b.type === "buffDmg"
                  ? "💥 +DMG"
                  : b.type === "buffDef"
                  ? "🛡️ +DEF"
                  : b.type === "buffAtk"
                  ? "🔥 +ATK"
                  : b.type === "buffIgnoreArmor"
                  ? "⚔️ Xuyên Thủ"
                  : b.type === "shield"
                  ? "🛡️ Khiên"
                  : b.type
              }(${b.turns})`
          )
          .join(", ");
    }

    let shieldText = u.shield > 0 ? `\n🛡️ Khiên: ${u.shield}` : "";

    return (
      `❤️ HP: ${createBar(u.hp, u.maxHp, 15, "❤️")} (${u.hp}/${u.maxHp})\n` +
      `🔵 MP: ${createBar(u.mp, u.maxMp, 15, "🔵")} (${u.mp}/${u.maxMp})\n` +
      `🔥 Nộ: ${createBar(u.fury, 100, 15, "🔥")} (${u.fury}/100)` +
      shieldText +
      buffsText
    );
  }

  return new EmbedBuilder()
    .setTitle("⚔️ Trận đấu Tu Tiên")
    .setDescription(desc)
    .addFields(
      {
        name: `${elementEmojis[p1.element] || ""} ${p1.name}`,
        value: playerField(p1),
        inline: true,
      },
      {
        name: `${elementEmojis[p2.element] || ""} ${p2.name}`,
        value: playerField(p2),
        inline: true,
      }
    )
    .setColor(state.finished ? "Gold" : "Purple")
    .setFooter({
      text: "✨ Hãy vận dụng linh lực khéo léo để giành thắng lợi!",
    });
}

// 📌 Menu chọn skill
function createSkillMenu(user, userId, isTurn) {
  const skillList = skills[user.element] || [];

  const menu = new StringSelectMenuBuilder()
    .setCustomId(`duel-skill-${userId}`)
    .setPlaceholder(isTurn ? "Chọn skill để sử dụng" : "Chưa tới lượt của bạn")
    .setDisabled(!isTurn);

  if (skillList.length === 0) {
    menu.addOptions([{ label: "Không có skill", value: "none" }]);
  } else {
    menu.addOptions(
      skillList.map((s) => {
        let cd = user.buffCooldowns?.[s.name] || 0;
        let label = cd > 0 ? `${s.name} (CD:${cd})` : s.name;
        return {
          label,
          description: `${s.description} | MP:${s.cost?.mpPercent || 0}% | Nộ:${
            s.cost?.fury || 0
          }`,
          value: s.name,
        };
      })
    );
  }

  return new ActionRowBuilder().addComponents(menu);
}

// 📌 Gửi embed trận đấu
async function sendBattleEmbeds(client, state, channel) {
  const users = loadUsers();
  const p1 = users[state.players[0]];
  const p2 = users[state.players[1]];
  const embed = createBattleEmbed(state, users);

  const row1 = createSkillMenu(
    p1,
    state.players[0],
    state.turn === state.players[0]
  );
  const row2 = createSkillMenu(
    p2,
    state.players[1],
    state.turn === state.players[1]
  );

  await channel.send({ embeds: [embed], components: [row1, row2] });
}

// 📌 Xử lý chọn skill
async function handleSkillInteraction(interaction, client) {
  const userId = interaction.customId.split("duel-skill-")[1];
  if (interaction.user.id !== userId) {
    return interaction.reply({
      content: "❌ Không phải lượt của bạn!",
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.deferUpdate();
  const skillName = interaction.values[0];
  const state = useSkill(userId, skillName);
  const users = loadUsers();

  if (!state) {
    return interaction.followUp({
      content: "❌ Trận đấu không tồn tại!",
      flags: MessageFlags.Ephemeral,
    });
  }

  if (state.finished) {
    resetAfterBattle(state);
    const embed = createBattleEmbed(state, users);
    await interaction.message.channel.send({ embeds: [embed], components: [] });
    return;
  }

  await sendBattleEmbeds(client, state, interaction.message.channel);

  await interaction.followUp({
    content: `✅ Bạn đã dùng skill: **${skillName}**`,
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = { sendBattleEmbeds, handleSkillInteraction };
