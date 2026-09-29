const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');

const limits = new Map();
const LIMIT_TIME = 10000; // 10 saniye
const MAX_LIMIT = 3;

module.exports = {
  name: Events.ChannelDelete,
  async execute(channel) {
    const guild = channel.guild;
    if (!guild) return;

    try {
      const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete }).catch(() => null);
      if (!fetchedLogs) return;

      const deletionLog = fetchedLogs.entries.first();
      if (!deletionLog) return;
      const { executor, target } = deletionLog;

      if (!target || target.id !== channel.id || executor.id === guild.client.user.id || executor.id === guild.ownerId) return;

      const userId = executor.id;
      const now = Date.now();
      const userLimits = limits.get(userId) || [];
      const recentDeletions = userLimits.filter(time => now - time < LIMIT_TIME);

      recentDeletions.push(now);
      limits.set(userId, recentDeletions);

      // RAM Temizliği: 15 saniye sonra kullanıcı verisini hafızadan tamamen sil
      setTimeout(() => {
        const current = limits.get(userId);
        if (current && current.length === 0) limits.delete(userId);
      }, 15000);

      if (recentDeletions.length >= MAX_LIMIT) {
        const member = await guild.members.fetch(userId).catch(() => null);
        const jailRoleId = process.env.JAIL_ROLE_ID;
        const logChannelId = process.env.SECURITY_LOG_CHANNEL_ID;

        if (member) {
          const rolesToRemove = member.roles.cache.filter(r => r.id !== guild.id && r.id !== jailRoleId);
          if (jailRoleId) await member.roles.add(jailRoleId).catch(() => {});
          await member.roles.remove(rolesToRemove).catch(() => {});

          const logChannel = guild.channels.cache.get(logChannelId);
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setTitle('🚨 ANTI-NUKE DEVREYE GİRDİ!')
              .setDescription(`**Yetkili:** <@${userId}>\n**Sebep:** Üst üste kanal sildi.\n**İşlem:** Yetkileri alındı.`)
              .setColor('#FF0000');

            await logChannel.send({ content: `@everyone ⚠️ **KANAL SALDIRISI ENGELLENDİ!**`, embeds: [embed] }).catch(() => {});
          }
        }
        limits.delete(userId);
      }
    } catch (error) {
      console.error('ChannelDelete koruma hatası:', error);
    }
  }
};