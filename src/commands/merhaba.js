const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('merhaba')
    .setDescription('Bot sana selam verir'),

  async execute(interaction) {
    await interaction.reply(`👋 Merhaba, **${interaction.user.username}**!`);
  },
};
