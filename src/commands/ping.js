const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Botun gecikme suresini gosterir'),

  async execute(interaction) {
    const baslangic = Date.now();
    await interaction.reply('Hesaplaniyor...');
    const gecikme = Date.now() - baslangic;
    await interaction.editReply(
      `🏓 Pong! Gecikme: **${gecikme}ms** | API: **${Math.round(interaction.client.ws.ping)}ms**`
    );
  },
};
