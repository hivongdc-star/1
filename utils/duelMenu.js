const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
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
    desc = "🏆 " + (state.logs?.[state.logs.length - 1] || "Trận đấu đã kết thúc!");
  } else {
    const lastLog = state.logs?.[state.logs.length - 1];
    desc = lastLog
      ? `📜 **${lastLog}**\n\n👉 Lượt của **${users[state.turn]?.name || "???"}**`
      : `👉 Lượt của **${users[state.turn]?.name || "???"}**`;
  }

  function playerField(u) {
    if (!u) return "❌ Không có dữ liệu";
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
    ).toString();
  }

  return new EmbedBuilder()
    .setTitle("⚔️ Trận đấu Tu Tiên")
    .setDescription(desc || "⚠️ Chưa có log")
    .addFields([
      {
        name: `${elementEmojis[p1?.element] || ""} ${String(p1?.name || "Người chơi 1")}`,
        value: playerField(p1),
        inline: true,
      },
      {
        name: `${elementEmojis[p2?.element] || ""} ${String(p2?.name || "Người chơi 2")}`,
        value: playerField(p2),
        inline: true,
      },
    ])
    .setColor(state.finished ? "Gold" : "Purple")
    .setFooter({ text: "✨ Vận dụng linh lực để giành thắng lợi!" });
}

// menu skill cho 1 người
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
          description: `${s.description} | ${
            s.cost?.mpPercent ? `MP:${s.cost.mpPercent}%` : ""
          } ${s.cost?.fury ? `| Nộ:${s.cost.fury}` : ""}`.trim(),
          value: s.name,
        };
      })
    );
  }
  return new ActionRowBuilder().addComponents(menu);
}

// gửi/edits embed cho từng người chơi
async function sendBattleEmbeds(client, state) {
  const users = loadUsers();
  const embed = createBattleEmbed(state, users);

  for (const pid of state.players) {
    const player = users[pid];
    const isTurn = state.turn === pid;
    const row = createSkillMenu(player, pid, isTurn);

    // đã có message → edit
    if (state.battleMsgs?.[pid]) {
      await state.battleMsgs[pid].edit({ embeds: [embed], components: [row] });
    } else {
      // fallback nếu chưa có message
      const ch = state.channels?.[pid];
      if (ch) {
        const msg = await ch.send({ embeds: [embed], components: [row] });
        if (!state.battleMsgs) state.battleMsgs = {};
        state.battleMsgs[pid] = msg;
      }
    }
  }
}

// xử lý chọn skill
async function handleSkillInteraction(interaction, client) {
  const clickerId = interaction.user.id;

  const battle = battles[clickerId];
  if (!battle) {
    return interaction.reply({
      content: "❌ Trận đấu không tồn tại!",
      ephemeral: true,
    });
  }

  const state = battle.state;
  if (state.turn !== clickerId) {
    return interaction.reply({
      content: "❌ Không phải lượt của bạn!",
      ephemeral: true,
    });
  }

  await interaction.deferUpdate();
  const skillName = interaction.values[0];
  const newState = useSkill(clickerId, skillName);
  const users = loadUsers();

  if (newState.finished) {
    resetAfterBattle(newState);
    const embed = createBattleEmbed(newState, users);
    for (const pid of state.players) {
      if (state.battleMsgs?.[pid]) {
        await state.battleMsgs[pid].edit({ embeds: [embed], components: [] });
      }
    }
    return;
  }

  await sendBattleEmbeds(client, newState);

  await interaction.followUp({
    content: `✅ Bạn đã dùng skill: **${skillName}**`,
    ephemeral: true,
  });
}

module.exports = { sendBattleEmbeds, handleSkillInteraction };
