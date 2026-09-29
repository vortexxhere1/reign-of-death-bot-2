const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`🤖 Bot aktif: ${client.user.tag}`);

    // Ses Kanalına Bağlanma Ayarı
    const voiceChannelId = process.env.VOICE_CHANNEL_ID;
    const guildId = process.env.GUILD_ID;

    if (voiceChannelId && guildId) {
      try {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
          joinVoiceChannel({
            channelId: voiceChannelId,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true, // RAM ve veri tasarrufu için botu sağırlaştırır
            selfMute: true  // Botu susturur
          });
          console.log('🔊 Bot başarıyla ses kanalına bağlandı.');
        }
      } catch (error) {
        console.error('❌ Ses kanalına bağlanırken hata oluştu:', error);
      }
    }
  },
};