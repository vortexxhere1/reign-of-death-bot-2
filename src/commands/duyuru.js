const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: { name: 'duyuru', description: 'Embed duyuru yayınlar.' },
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ Bu komut için `Mesajları Yönet` yetkisi gerekli.');
    }

    const input = args.join(' ').split('|');
    const baslik = input[0]?.trim();
    const icerik = input[1]?.trim();

    if (!baslik || !icerik) {
      return message.reply('❌ Kullanım: `!duyuru Başlık | Duyuru Metni`');
    }

    const embed = new EmbedBuilder()
      .setTitle(baslik)
      .setDescription(icerik)
      .setColor('#5865F2')
      .setFooter({ text: `${message.guild.name} • Duyuru` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
    if (message.deletable) message.delete().catch(() => {});
  }
};