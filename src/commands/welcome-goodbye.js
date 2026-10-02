import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupWelcomeGoodbye(client) {
    const dbPath = path.join(__dirname, '../veritabani.json');

    const getWelcomeChannelId = (guildId) => {
        if (!fs.existsSync(dbPath)) return null;
        try {
            const veritabani = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            return veritabani[guildId]?.welcomeChannelId || null;
        } catch (err) {
            return null;
        }
    };

    client.on('guildMemberAdd', async (member) => {
        try {
            const channelId = getWelcomeChannelId(member.guild.id);
            if (!channelId) return;

            const channel = await member.guild.channels.fetch(channelId).catch(() => null);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('👋 Sunucuya Biri Katıldı!')
                .setDescription(`Aramıza hoş geldin, ${member}! Seninle beraber **${member.guild.memberCount}** kişi olduk 🎉`)
                .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Welcome Olayı Hatası:', error);
        }
    });

    client.on('guildMemberRemove', async (member) => {
        try {
            const channelId = getWelcomeChannelId(member.guild.id);
            if (!channelId) return;

            const channel = await member.guild.channels.fetch(channelId).catch(() => null);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle(' Sunucudan Biri Ayrıldı')
                .setDescription(`**${member.user.tag}** aramızdan ayrıldı. Geriye **${member.guild.memberCount}** kişi kaldık.`);

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Goodbye Olayı Hatası:', error);
        }
    });
}