const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sunucu')
    .setDescription('Bu sunucu hakkinda bilgi gosterir'),

  async execute(interaction) {
    const { guild } = interaction;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL() || null)
      .addFields(
        { name: 'Sahibi', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Uye Sayisi', value: `${guild.memberCount}`, inline: true },
        { name: 'Kanal Sayisi', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Rol Sayisi', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Olusturulma Tarihi', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: 'Emoji Sayisi', value: `${guild.emojis.cache.size}`, inline: true },
      )
      .setFooter({ text: `Sunucu ID: ${guild.id}` });

    await interaction.reply({ embeds: [embed] });
  },
};
