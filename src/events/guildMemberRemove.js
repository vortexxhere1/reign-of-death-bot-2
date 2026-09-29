const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const fs = require('fs');
const path = require('path');

const limits = new Map();
const LIMIT_TIME = 10000;
const MAX_LIMIT = 3;

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const guild = member.guild;
    if (!guild) return;

    const dbPath = path.join(__dirname, '../veritabani.json');
    let channelId = process.env.WELCOME_CHANNEL_ID;

    if (fs.existsSync(dbPath)) {
      try {
        const veritabani = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (veritabani[guild.id]?.welcomeChannelId) {
          channelId = veritabani[guild.id].welcomeChannelId;
        }
      } catch (err) {
        console.error('Veritabanı okuma hatası:', err);
      }
    }

    try {
      if (channelId) {
        const channel = guild.channels.cache.get(channelId);
        if (channel) {
          const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('👋 Biri Aramızdan Ayrıldı')
            .setDescription(`**${member.user.tag}** sunucudan ayrıldı. Kullanıcı sayısı **${guild.memberCount}** kişiye düştü.`)
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: `${guild.name} • Çıkış Sistemi`, iconURL: guild.iconURL() })
            .setTimestamp();

          await channel.send({ embeds: [embed] });
        }
      }
    } catch (err) {
      console.error('Çıkış mesajı hatası:', err);
    }

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
              .setTitle('🚨 ANTI-NUKE: TOPLU ATMA SALDIRISI!')
              .setDescription(`**Yetkili:** <@${userId}>\n**Sebep:** Üst üste üyeleri sunucudan attı.\n**İşlem:** Yetkileri alındı.`)
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