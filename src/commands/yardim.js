const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: { 
    name: 'yardim', 
    description: 'Botun interaktif komut ve yönetim dashboard menüsünü açar' 
  },
  async execute(message, args) {
    const komutlar = message.client.commands;
    
    const komutListesi = komutlar
      .map((komut) => `🔹 **!${komut.data.name}**\n┗ 📝 *${komut.data.description || 'Açıklama bulunmuyor'}*`)
      .join('\n\n');

    const dashboardEmbed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📊 Bot Komut & Yönetim Dashboard')
      .setDescription(
        `Merhaba **${message.author.username}**! Aşağıda bu sunucuda kullanabileceğin tüm komutların listesi yer almaktadır.\n\n` +
        `📂 **Toplam Komut:** \`${komutlar.size}\`\n\n` +
        `--- \n\n` +
        komutListesi
      )
      .setThumbnail(message.client.user.displayAvatarURL())
      .setFooter({ 
        text: `${message.guild.name} • Güvenli Bot Sistemi`, 
        iconURL: message.guild.iconURL() 
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_olustur_yeni')
        .setLabel('📩 Destek Talebi Oluştur')
        .setStyle(ButtonStyle.Primary)
    );

    await message.reply({
      embeds: [dashboardEmbed],
      components: [row]
    });
  },
};