require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { startDispatcher } = require("./utils/dispatcher");
const { handleSkillInteraction } = require("./utils/duelMenu");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel], // cần để nhận DM
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  startDispatcher(client);
});

// --- Xử lý interaction (menu chọn skill) ---
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId.startsWith("duel-skill-")) {
      await handleSkillInteraction(interaction, client);
    }
  } catch (err) {
    console.error("❌ Interaction error:", err);
    if (!interaction.replied) {
      try {
        await interaction.reply({
          content: "⚠️ Có lỗi xảy ra khi xử lý skill!",
          ephemeral: true,
        });
      } catch (e) {
        console.error("❌ Reply error:", e);
      }
    }
  }
});

client.login(process.env.TOKEN);
