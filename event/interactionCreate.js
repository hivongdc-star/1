// events/interactionCreate.js
const { handleSkillInteraction } = require("../utils/duelMenu");

module.exports = async (client, interaction) => {
  if (
    interaction.isStringSelectMenu() &&
    interaction.customId.startsWith("duel-skill-")
  ) {
    await handleSkillInteraction(interaction, client);
  }
};
