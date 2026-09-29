const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: { name: 'sil', description: 'Toplu mesaj siler.' },
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ Mesajları silme yetkiniz yok.');
    }

    const miktar = parseInt(args[0]);
    if (isNaN(miktar) || miktar < 1 || miktar > 100) {
      return message.reply('❌ Lütfen 1 ile 100 arasında bir sayı girin.');
    }

    await message.channel.bulkDelete(miktar, true);
    const bildirim = await message.channel.send(`🧹 **${miktar}** adet mesaj silindi.`);
    setTimeout(() => bildirim.delete().catch(() => {}), 3000);
  }
};