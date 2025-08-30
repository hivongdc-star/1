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

  const desc = state.finished
    ? "🏆 " + state.logs[state.logs.length - 1]
    : state.logs.at(-1)
    ? `📜 **${state.logs.at(-1)}**\n\n👉 Lượt của **${users[state.turn].name}**`
    : `👉 Lượt của **${users[state.turn].name}**`;

  const playerField = (u) => {
    let buffsText = u.buffs?.length
      ? "\n🌀 Buff: " +
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
          .join(", ")
      : "";
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
  };

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
  if (!user || !user.element) {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`duel-skill-${userId}`)
        .setPlaceholder("❌ Không có skill (element lỗi)")
        .setDisabled(true)
        .addOptions([{ label: "Không có skill", value: "none" }])
    );
  }
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
        label: s.name,
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
  const embed = createBattleEmbed(state, users);
  const row1 = createSkillMenu(
    users[state.players[0]],
    state.players[0],
    state.turn === state.players[0]
  );
  const row2 = createSkillMenu(
    users[state.players[1]],
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

  const skillName = interaction.values[0];
  const state = useSkill(userId, skillName);
  if (!state)
    return interaction.reply({
      content: "❌ Trận đấu không tồn tại!",
      ephemeral: true,
    });

  const users = loadUsers();
  if (state.finished) {
    resetAfterBattle(state);
    const embed = createBattleEmbed(state, users);
    for (const ch of state.channels) {
      await ch.send({ embeds: [embed], components: [] });
    }
    return interaction.reply({
      content: `✅ Bạn đã dùng skill: **${skillName}**`,
      ephemeral: true,
    });
  }

  for (const ch of state.channels) {
    await sendBattleEmbeds(client, state, ch);
  }
  return interaction.reply({
    content: `✅ Bạn đã dùng skill: **${skillName}**`,
    ephemeral: true,
  });
}

module.exports = { sendBattleEmbeds, handleSkillInteraction };
