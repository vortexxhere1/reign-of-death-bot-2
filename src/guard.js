import { AuditLogEvent, PermissionFlagsBits } from 'discord.js';

export function setupGuard(client) {
    // İşlem loglarını takip etmek için bir önbellek (aynı logun tekrar tetiklenmesini önlemek için)
    const processedLogs = new Set();

    client.on('channelDelete', async (channel) => {
        try {
            if (!channel.guild) return;
            const guild = channel.guild;

            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelDelete,
            });

            const deletionLog = fetchedLogs.entries.first();
            if (!deletionLog) return;

            const { executor, target } = deletionLog;
            if (!executor || target.id !== channel.id) return;

            // Log ID'si zaten işlendiyse atla
            if (processedLogs.has(deletionLog.id)) return;
            processedLogs.add(deletionLog.id);
            setTimeout(() => processedLogs.delete(deletionLog.id), 10000);

            // Bot veya sunucu sahibi ise işlem yapma
            if (executor.id === client.user.id || executor.id === guild.ownerId) return;

            const member = await guild.members.fetch(executor.id).catch(() => null);
            if (!member) return;

            // Yönetici yetkisine sahip kişilerin izinsiz kanal silmesini engellemek için cezalandır ve yetkilerini al
            await member.timeout(7 * 24 * 60 * 60 * 1000, 'Guard: İzinsiz kanal silme koruması').catch(() => {});
            
            // Opsiyonel: Silinen kanalı benzer ayarlarla geri oluşturma denemesi veya loglama
            console.log(`[GUARD] ${executor.tag} izinsiz kanal sildi: ${channel.name}. Kullanıcı zaman aşımına uğratıldı.`);
        } catch (error) {
            console.error('ChannelDelete Guard Hatası:', error);
        }
    });

    client.on('roleDelete', async (role) => {
        try {
            if (!role.guild) return;
            const guild = role.guild;

            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.RoleDelete,
            });

            const deletionLog = fetchedLogs.entries.first();
            if (!deletionLog) return;

            const { executor, target } = deletionLog;
            if (!executor || target.id !== role.id) return;

            if (processedLogs.has(deletionLog.id)) return;
            processedLogs.add(deletionLog.id);
            setTimeout(() => processedLogs.delete(deletionLog.id), 10000);

            if (executor.id === client.user.id || executor.id === guild.ownerId) return;

            const member = await guild.members.fetch(executor.id).catch(() => null);
            if (!member) return;

            await member.timeout(7 * 24 * 60 * 60 * 1000, 'Guard: İzinsiz rol silme koruması').catch(() => {});
            console.log(`[GUARD] ${executor.tag} izinsiz rol sildi: ${role.name}. Kullanıcı zaman aşımına uğratıldı.`);
        } catch (error) {
            console.error('RoleDelete Guard Hatası:', error);
        }
    });

    client.on('guildMemberAdd', async (member) => {
        try {
            if (!member.user.bot) return;

            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.BotAdd,
            });

            const botAddLog = fetchedLogs.entries.first();
            if (!botAddLog) return;

            const { executor, target } = botAddLog;
            if (!executor || target.id !== member.id) return;

            // Eğer ekleyen kişi sunucu sahibi değilse ve yönetici değilse botu at
            if (executor.id === member.guild.ownerId) return;

            const executorMember = await member.guild.members.fetch(executor.id).catch(() => null);
            if (executorMember && executorMember.permissions.has(PermissionFlagsBits.Administrator)) {
                return; // Yönetici yetkisi varsa bot eklemesine izin ver
            }

            await member.kick('Guard: İzinsiz bot ekleme koruması');
            if (executorMember) {
                await executorMember.timeout(24 * 60 * 60 * 1000, 'Guard: İzinsiz bot ekleme').catch(() => {});
            }

            console.log(`[GUARD] ${executor.tag} izinsiz bot ekledi (${member.user.tag}). Bot atıldı, kullanıcı cezalandırıldı.`);
        } catch (error) {
            console.error('BotAdd Guard Hatası:', error);
        }
    });
}