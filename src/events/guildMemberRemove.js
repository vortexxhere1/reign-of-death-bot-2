const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');

const limits = new Map();
const LIMIT_TIME = 10000;
const MAX_LIMIT = 3;

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const guild = member.guild;
    if (!guild) return;

    try {
      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick,
      });
      const kickLog = fetchedLogs.entries.first();

      if (!kickLog) return;
      const { executor, target } = kickLog;

      if (target.id !== member.id || executor.id === guild.client.user.id || executor.id === guild.ownerId) return;

      const userId = executor.id;
      const now = Date.now();
      const userLimits = limits.get(userId) || [];
      const recentKicks = userLimits.filter(time => now - time < LIMIT_TIME);

      recentKicks.push(now);
      limits.set(userId, recentKicks);

      if (recentKicks.length >= MAX_LIMIT) {
        const executorMember = await guild.members.fetch(userId).catch(() => null);
        const jailRoleId = process.env.JAIL_ROLE_ID;
        const logChannelId = process.env.SECURITY_LOG_CHANNEL_ID;

        if (executorMember) {
          const rolesToRemove = executorMember.roles.cache.filter(r => r.id !== guild.id && r.id !== jailRoleId);
          if (jailRoleId) await executorMember.roles.add(jailRoleId).catch(() => {});
          await executorMember.roles.remove(rolesToRemove).catch(() => {});

          const logChannel = guild.channels.cache.get(logChannelId);
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setTitle('🚨 ANTI-NUKE: KICK/BAN SALDIRISI!')
              .setDescription(`**Yetkili:** <@${userId}> (${executor.tag})\n**Sebep:** Üst üste üyeleri sunucudan attı.\n**Yapılan İşlem:** Yetkileri alındı.`)
              .setColor('#FF0000')
              .setTimestamp();

            await logChannel.send({ content: `@everyone ⚠️ **TOPLU ATMASI ENGELLENDİ!**`, embeds: [embed] });
          }
        }
        limits.delete(userId);
      }
    } catch (error) {
      console.error('Anti-Nuke Kick hatası:', error);
    }
  }
};