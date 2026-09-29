const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yardim')
    .setDescription('Kullanilabilir tum komutlari listeler'),

  async execute(interaction) {
    // client.commands Collection'i index.js icinde tum komutlari otomatik
    // topluyor, o yuzden buraya yeni komut eklendiginde bu liste kendiliginden guncellenir
    const komutlar = interaction.client.commands
      .map((komut) => `**/${komut.data.name}** — ${komut.data.description}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📖 Komut Listesi')
      .setDescription(komutlar)
      .setFooter({ text: `Toplam ${interaction.client.commands.size} komut` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
