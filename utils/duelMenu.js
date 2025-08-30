// utils/duelMenu.js
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const { useSkill, resetAfterBattle } = require("./duel");
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
                  : b.type === "ignoreArmor"
                  ? "⚔️ Xuyên Giáp"
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
      `🔵 Mana: ${createBar(u.mana, u.maxMana, 15, "🔵")} (${u.mana}/${
        u.maxMana
      })\n` +
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
    .setFooter({ text: "✨ Hãy dùng skill khéo léo để giành chiến thắng!" });
}

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
      skillList.map((s) => ({
        label: `${s.name}`,
        description: `${s.description} | Mana:${s.cost?.mana || 0}, Nộ:${
          s.cost?.fury || 0
        }`,
        value: s.name,
      }))
    );
  }

  return new ActionRowBuilder().addComponents(menu);
}

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

  if (!state) {
    return interaction.followUp({
      content: "❌ Trận đấu không tồn tại!",
      ephemeral: true,
    });
  }

  if (state.finished) {
    resetAfterBattle(state);
    const embed = createBattleEmbed(state, users);
    for (const dm of state.dmChannels) {
      await dm.send({ embeds: [embed], components: [] });
    }
    return;
  }

  // update cả 2 DM
  for (const dm of state.dmChannels) {
    await sendBattleEmbeds(client, state, dm);
  }

  await interaction.followUp({
    content: `✅ Bạn đã dùng skill: **${skillName}**`,
    ephemeral: true,
  });
}

module.exports = { sendBattleEmbeds, handleSkillInteraction };
