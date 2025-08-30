const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const { useSkill, resetAfterBattle } = require("./duel");
const { loadUsers } = require("./storage");
const skills = require("./skills");
const { createBar } = require("./barHelper");

// emoji cho ngũ hành
const elementEmojis = {
  kim: "⚔️",
  moc: "🌿",
  thuy: "💧",
  hoa: "🔥",
  tho: "⛰️",
};

// 📌 Hàm tạo embed trận đấu
function createBattleEmbed(state, users) {
  const p1 = users[state.players[0]];
  const p2 = users[state.players[1]];

  // --- log trận ---
  let desc = "";
  if (state.finished) {
    desc = "🏆 " + state.logs[state.logs.length - 1];
  } else {
    const lastLog = state.logs[state.logs.length - 1];
    if (lastLog) {
      desc = `📜 **${lastLog}**\n\n👉 Lượt của **${users[state.turn].name}**`;
    } else {
      desc = `👉 Lượt của **${users[state.turn].name}**`;
    }
  }

  // --- format 1 người chơi ---
  function playerField(u) {
    let buffsText = "";
    if (u.buffs && u.buffs.length > 0) {
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

    let shieldText = u.shield && u.shield > 0 ? `\n🛡️ Khiên: ${u.shield}` : "";

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

// 📌 Menu chọn skill
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
    const options = skillList.map((s) => ({
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

// 📌 Gửi embed trận đấu
async function sendBattleEmbeds(client, state, channel) {
  const users = loadUsers();
  const p1 = users[state.players[0]];
  const p2 = users[state.players[1]];
  const embed = createBattleEmbed(state, users);

  const row1 = createSkillMenu(p1, state.turn === p1.id);
  const row2 = createSkillMenu(p2, state.turn === p2.id);

  await channel.send({ embeds: [embed], components: [row1, row2] });
}

// 📌 Xử lý chọn skill
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
    content: `✅ Bạn đã dùng skill: **${skillName}**`,
    ephemeral: true,
  });
}

module.exports = { sendBattleEmbeds, handleSkillInteraction };
