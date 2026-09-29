const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kullanici')
    .setDescription('Bir kullanici hakkinda bilgi gosterir')
    .addUserOption((option) =>
      option
        .setName('hedef')
        .setDescription('Bilgisini gormek istedigin kullanici (bos birakirsan kendin)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const hedefUser = interaction.options.getUser('hedef') || interaction.user;
    const member = await interaction.guild.members.fetch(hedefUser.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(hedefUser.username)
      .setThumbnail(hedefUser.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'Kullanici ID', value: hedefUser.id, inline: true },
        { name: 'Bot mu?', value: hedefUser.bot ? 'Evet' : 'Hayir', inline: true },
        { name: 'Hesap Olusturulma', value: `<t:${Math.floor(hedefUser.createdTimestamp / 1000)}:D>`, inline: true },
      );

    if (member) {
      embed.addFields({
        name: 'Sunucuya Katilma',
        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`,
        inline: true,
      });
      const roller = member.roles.cache
        .filter((r) => r.id !== interaction.guild.id)
        .map((r) => r.toString());
      if (roller.length) {
        embed.addFields({ name: `Roller (${roller.length})`, value: roller.join(', ').slice(0, 1024) });
      }
    }

    await interaction.reply({ embeds: [embed] });
  },
};
