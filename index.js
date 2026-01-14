require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Events } = require("discord.js");
const { startDispatcher } = require("./utils/dispatcher");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel], // cần để nhận DM
});

// đúng event name là "ready"
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  startDispatcher(client);
});

client.login(process.env.TOKEN);
