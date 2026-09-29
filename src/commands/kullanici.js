const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: { name: 'kullanici', description: 'Bir kullanıcı hakkında bilgi gösterir' },
  async execute(message, args) {
    const hedefUser = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(hedefUser.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(hedefUser.username)
      .setThumbnail(hedefUser.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'Kullanıcı ID', value: hedefUser.id, inline: true },
        { name: 'Bot mu?', value: hedefUser.bot ? 'Evet' : 'Hayır', inline: true },
        { name: 'Hesap Oluşturulma', value: `<t:${Math.floor(hedefUser.createdTimestamp / 1000)}:D>`, inline: true },
      );

    if (member) {
      embed.addFields({
        name: 'Sunucuya Katılma',
        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`,
        inline: true,
      });
      const roller = member.roles.cache
        .filter((r) => r.id !== message.guild.id)
        .map((r) => r.toString());
      if (roller.length) {
        embed.addFields({ name: `Roller (${roller.length})`, value: roller.join(', ').slice(0, 1024) });
      }
    }

    await message.reply({ embeds: [embed] });
  },
};