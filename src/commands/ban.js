const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: { name: 'ban', description: 'Kullanıcıyı sunucudan yasaklar.' },
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('❌ Kullanıcı banlama yetkiniz yok.');
    }

    const uye = message.mentions.members.first();
    if (!uye) return message.reply('❌ Lütfen banlanacak kullanıcıyı etiketleyin.');
    if (!uye.bannable) return message.reply('❌ Bu kullanıcıyı banlamaya yetkim yetmiyor.');

    const sebep = args.slice(1).join(' ') || 'Belirtilmedi';
    await uye.ban({ reason: sebep });
    message.reply(`🔨 **${uye.user.tag}** sunucudan yasaklandı. Sebep: *${sebep}*`);
  }
};