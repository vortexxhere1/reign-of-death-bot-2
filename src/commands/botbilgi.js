const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: { name: 'botbilgi', description: 'Bot bilgilerini gösterir.' },
  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 Bot İstatistikleri')
      .addFields(
        { name: '⚡ Gecikme (Ping)', value: `${message.client.ws.ping}ms`, inline: true },
        { name: '👥 Sunucu Üye Sayısı', value: `${message.guild.memberCount}`, inline: true },
        { name: '📁 Yüklü Komut Sayısı', value: `${message.client.commands.size}`, inline: true }
      )
      .setColor('#2B2D31');

    message.reply({ embeds: [embed] });
  }
};
```[cite: 10]