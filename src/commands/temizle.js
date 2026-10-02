import { PermissionFlagsBits } from 'discord.js';

export default {
    name: 'temizle',
    description: 'Kanaldan belirli sayıda mesaj siler',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ Mesajları silme yetkiniz yok.');
        }

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ Mesajları silebilmem için "Mesajları Yönet" yetkisine ihtiyacım var.');
        }

        const adet = parseInt(args[0]);
        if (isNaN(adet) || adet < 1 || adet > 100) {
            return message.reply('❌ Lütfen 1 ile 100 arasında geçerli bir sayı girin. (Örn: `!temizle 10`)');
        }

        try {
            const silinenler = await message.channel.bulkDelete(adet, true);
            const bildirim = await message.channel.send(`🧹 **${silinenler.size}** mesaj silindi.`);
            setTimeout(() => bildirim.delete().catch(() => {}), 3000);
            if (message.deletable) message.delete().catch(() => {});
        } catch (error) {
            console.error('Temizle komutu hatası:', error);
            await message.reply('❌ Mesajlar silinirken bir hata oluştu (14 günden eski mesajlar toplu silinemez).');
        }
    },
};