const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('temizle')
    .setDescription('Kanaldan belirli sayida mesaj siler')
    .addIntegerOption((option) =>
      option
        .setName('adet')
        .setDescription('Silinecek mesaj sayisi (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    // Kullanicinin yetkisi olsa da botun kendi yetkisini de kontrol ediyoruz
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ Mesajlari silebilmem icin "Mesajlari Yonet" yetkisine ihtiyacim var.',
        ephemeral: true,
      });
    }

    const adet = interaction.options.getInteger('adet');

    try {
      const silinenler = await interaction.channel.bulkDelete(adet, true);
      await interaction.reply({
        content: `🧹 **${silinenler.size}** mesaj silindi.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Temizle komutu hatasi:', error);
      await interaction.reply({
        content: '❌ Mesajlar silinirken bir hata olustu (14 gunden eski mesajlar toplu silinemez).',
        ephemeral: true,
      });
    }
  },
};
