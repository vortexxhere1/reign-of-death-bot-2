const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const dbPath = path.join(__dirname, '../veritabani.json');
    let channelId = process.env.WELCOME_CHANNEL_ID;

    if (fs.existsSync(dbPath)) {
      try {
        const veritabani = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (veritabani[member.guild.id]?.welcomeChannelId) {
          channelId = veritabani[member.guild.id].welcomeChannelId;
        }
      } catch (err) {
        console.error('Veritabanı okuma hatası:', err);
      }
    }

    const kanal = channelId
      ? member.guild.channels.cache.get(channelId)
      : member.guild.systemChannel;

    if (!kanal || !kanal.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('👋 Sunucuya Biri Katıldı!')
      .setDescription(`Hoş geldin **${member.user.username}**!\nSeninle birlikte **${member.guild.memberCount}** kişi olduk.`)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: `${member.guild.name} • Giriş Sistemi`, iconURL: member.guild.iconURL() })
      .setTimestamp();

    kanal.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
  }
};