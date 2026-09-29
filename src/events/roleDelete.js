const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');

const limits = new Map();
const LIMIT_TIME = 10000;
const MAX_LIMIT = 3;

module.exports = {
  name: Events.RoleDelete,
  async execute(role) {
    const guild = role.guild;
    if (!guild) return;

    try {
      const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleDelete }).catch(() => null);
      if (!fetchedLogs) return;

      const roleLog = fetchedLogs.entries.first();
      if (!roleLog) return;
      const { executor, target } = roleLog;

      if (!target || target.id !== role.id || executor.id === guild.client.user.id || executor.id === guild.ownerId) return;

      const userId = executor.id;
      const now = Date.now();
      const userLimits = limits.get(userId) || [];
      const recentDeletions = userLimits.filter(time => now - time < LIMIT_TIME);

      recentDeletions.push(now);
      limits.set(userId, recentDeletions);

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
              .setTitle('🚨 ANTI-NUKE: ROL KORUMASI!')
              .setDescription(`**Yetkili:** <@${userId}>\n**Sebep:** Üst üste rol sildi.\n**İşlem:** Yetkileri alındı.`)
              .setColor('#FF0000');

            await logChannel.send({ content: `@everyone ⚠️ **ROL SALDIRISI ENGELLENDİ!**`, embeds: [embed] }).catch(() => {});
          }
        }
        limits.delete(userId);
      }
    } catch (error) {
      console.error('RoleDelete koruma hatası:', error);
    }
  }
};