const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const { useSkill, resetAfterBattle } = require("./duel");
const { loadUsers } = require("./storage");
const skills = require("./skills");
const { createBar } = require("./barHelper");

function truncateSafe(text, fallback = "N/A", maxLen = 100) {
  if (!text || typeof text !== "string") return fallback;
  return text.length > maxLen ? text.slice(0, maxLen - 3) + "..." : text;
}

function getElementEmoji(element) {
  switch (element) {
    case "hoa":
      return "🔥";
    case "thuy":
      return "💧";
    case "moc":
      return "🌲";
    case "tho":
      return "🪨";
    case "kim":
      return "⚔️";
    default:
      return "✨";
  }
}

/**
 * Tạo embed trạng thái trận đấu
 */
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
          `❤️ HP: ${createBar(p1.hp, p1.maxHp ?? p1.hp, 15, "❤️")} (${p1.hp}/${
            p1.maxHp ?? p1.hp
          })\n` +
          `🔵 Mana: ${createBar(p1.mana, p1.maxMana ?? p1.mana, 15, "🔵")} (${
            p1.mana
          }/${p1.maxMana ?? p1.mana})\n` +
          `🔥 Nộ: ${createBar(p1.fury ?? 0, 100, 15, "🔥")} (${p1.fury}/100)`,
        inline: true,
      },
      {
        name: `${p2.name}`,
        value:
          `❤️ HP: ${createBar(p2.hp, p2.maxHp ?? p2.hp, 15, "❤️")} (${p2.hp}/${
            p2.maxHp ?? p2.hp
          })\n` +
          `🔵 Mana: ${createBar(p2.mana, p2.maxMana ?? p2.mana, 15, "🔵")} (${
            p2.mana
          }/${p2.maxMana ?? p2.mana})\n` +
          `🔥 Nộ: ${createBar(p2.fury ?? 0, 100, 15, "🔥")} (${p2.fury}/100)`,
        inline: true,
      }
    )
    .setColor(state.finished ? "Gold" : "Purple");
}

function createSkillMenu(user, isTurn) {
  const element = user.element || user.he;
  const skillList = skills[element] || [];
  const emoji = getElementEmoji(element);

  const menu = new StringSelectMenuBuilder()
    .setCustomId(`duel-skill-${user.id}`)
    .setPlaceholder(isTurn ? "Chọn skill để sử dụng" : "Chưa tới lượt của bạn")
    .setDisabled(!isTurn);

  if (skillList.length === 0) {
    menu.addOptions([
      {
        label: "Không có skill",
        description: "Người chơi này chưa có skill",
        value: "none",
      },
    ]);
  } else {
    const options = skillList.map((s, i) => ({
      label: truncateSafe(`${emoji} ${s.name || "Skill"}`, "Skill", 100),
      description: truncateSafe(
        `${s.description || "Không có mô tả"} | Mana:${s.cost?.mana || 0}, Nộ:${
          s.cost?.fury || 0
        }`,
        "Mô tả",
        100
      ),
      value: truncateSafe(s.name || `skill_${i}`, `skill_${i}`, 100),
    }));

    menu.addOptions(options);
  }

  return new ActionRowBuilder().addComponents(menu);
}

/**
 * Gửi embed + menu cho cả 2 người
 */
async function sendBattleEmbeds(client, state, channel) {
  const users = loadUsers();
  const p1 = users[state.players[0]];
  const p2 = users[state.players[1]];
  const embed = createBattleEmbed(state, users);

  const row1 = createSkillMenu(p1, state.turn === p1.id);
  const row2 = createSkillMenu(p2, state.turn === p2.id);

  // Gửi cho Player 1
  try {
    const u1 = await client.users.fetch(p1.id);
    await u1.send({ embeds: [embed], components: [row1] });
  } catch {
    if (channel) {
      channel.send({
        content: `⚠️ Không thể DM cho <@${p1.id}>, gửi tại đây:`,
        embeds: [embed],
        components: [row1],
      });
    }
  }

  // Gửi cho Player 2
  try {
    const u2 = await client.users.fetch(p2.id);
    await u2.send({ embeds: [embed], components: [row2] });
  } catch {
    if (channel) {
      channel.send({
        content: `⚠️ Không thể DM cho <@${p2.id}>, gửi tại đây:`,
        embeds: [embed],
        components: [row2],
      });
    }
  }
}

/**
 * Xử lý chọn skill
 */
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
    for (const pid of state.players) {
      try {
        const u = await client.users.fetch(pid);
        await u.send({ embeds: [embed], components: [] });
      } catch {
        if (interaction.channel) {
          await interaction.channel.send({
            content: `⚠️ Không thể DM cho <@${pid}>, gửi tại đây:`,
            embeds: [embed],
            components: [],
          });
        }
      }
    }

    await interaction.followUp({
      content: "✅ Trận đấu kết thúc, nhân vật đã hồi phục.",
      ephemeral: true,
    });
    return;
  }

  await sendBattleEmbeds(client, state, interaction.channel);

  await interaction.followUp({
    content: `✅ Bạn đã dùng skill: ${skillName}`,
    ephemeral: true,
  });
}

module.exports = { sendBattleEmbeds, handleSkillInteraction };
