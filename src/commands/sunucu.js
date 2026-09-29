const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: { name: 'sunucu', description: 'Bu sunucu hakkında bilgi gösterir' },
  async execute(message, args) {
    const { guild } = message;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL() || null)
      .addFields(
        { name: 'Sahibi', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Üye Sayısı', value: `${guild.memberCount}`, inline: true },
        { name: 'Kanal Sayısı', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Rol Sayısı', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Oluşturulma Tarihi', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: 'Emoji Sayısı', value: `${guild.emojis.cache.size}`, inline: true },
      )
      .setFooter({ text: `Sunucu ID: ${guild.id}` });

    await message.reply({ embeds: [embed] });
  },
};