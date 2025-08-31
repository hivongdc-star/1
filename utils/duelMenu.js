const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const { useSkill, resetAfterBattle, battles } = require("./duel");
const { loadUsers } = require("./storage");
const skills = require("./skills");
const { createBar } = require("./barHelper");

const elementEmojis = {
  kim: "⚔️",
  moc: "🌿",
  thuy: "💧",
  hoa: "🔥",
  tho: "⛰️",
};

// embed trận đấu
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
        "\n🌀 Buff: " + u.buffs.map((b) => `${b.type}(${b.turns})`).join(", ");
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
    .setFooter({ text: "✨ Vận dụng linh lực để giành thắng lợi!" });
}

// menu skill
function createSkillMenu(user, userId, isTurn) {
  const skillList = skills[user.element] || [];
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`duel-skill-${userId}`)
    .setPlaceholder(isTurn ? "Chọn skill" : "Chưa tới lượt")
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

// gửi embed cho tất cả kênh trong state
async function sendBattleEmbeds(client, state) {
  const users = loadUsers();
  const embed = createBattleEmbed(state, users);

  for (const ch of state.channels) {
    const p1 = users[state.players[0]];
    const p2 = users[state.players[1]];
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

    await ch.send({ embeds: [embed], components: [row1, row2] });
  }
}

// xử lý interaction
async function handleSkillInteraction(interaction, client) {
  const clickerId = interaction.user.id;

  const state = Object.values(battles).find((b) =>
    b.state.players.includes(clickerId)
  )?.state;
  if (!state) {
    return interaction.reply({
      content: "❌ Trận đấu không tồn tại!",
      flags: MessageFlags.Ephemeral,
    });
  }

  if (state.turn !== clickerId) {
    return interaction.reply({
      content: "❌ Không phải lượt của bạn!",
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.deferUpdate();
  const skillName = interaction.values[0];
  const newState = useSkill(clickerId, skillName);
  const users = loadUsers();

  if (newState.finished) {
    resetAfterBattle(newState);
    const embed = createBattleEmbed(newState, users);
    for (const ch of state.channels) {
      await ch.send({ embeds: [embed], components: [] });
    }
    return;
  }

  await sendBattleEmbeds(client, newState);

  await interaction.followUp({
    content: `✅ Bạn đã dùng skill: **${skillName}**`,
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = { sendBattleEmbeds, handleSkillInteraction };
