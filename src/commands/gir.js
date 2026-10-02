import { joinVoiceChannel } from '@discordjs/voice';

export default {
    name: 'gir',
    description: 'Botu ses kanalına sokar',
    execute(message, args) {
        const kanal = message.member.voice.channel;
        if (!kanal) {
            return message.reply('❌ Önce bir ses kanalına girmelisin!');
        }

        try {
            joinVoiceChannel({
                channelId: kanal.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
            return message.reply(`🔊 Başarıyla **${kanal.name}** kanalına katıldım ve 7/24 aktif kalıyorum!`);
        } catch (error) {
            console.error(error);
            return message.reply('❌ Ses kanalına bağlanırken bir hata oluştu.');
        }
    }
};