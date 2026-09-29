const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: { name: 'bakım', description: 'Sunucuyu kilitler ve bakım moduna alır.' },
  async execute(message, args) {
    const ownerId = process.env.OWNER_ID;
    if (message.author.id !== ownerId && message.author.id !== message.guild.ownerId) {
      return message.channel.send('❌ Bakım modunu sadece bot sahibi veya sunucu kurucusu yönetabilir.').catch(() => {});
    }

    const secim = args[0]?.toLowerCase();
    const guild = message.guild;

    // A) BAKIM MODUNU AÇMA
    if (secim === 'aç' || secim === 'ac') {
      if (message.client.bakimModu) {
        return message.channel.send('⚠️ Bakım modu zaten şu an **aktif**.').catch(() => {});
      }

      message.client.bakimModu = true;
      await message.channel.send('🔄 Sunucu kanalları kilitleniyor ve bakım modu başlatılıyor...').catch(() => {});

      const staffRoles = process.env.TICKET_STAFF_ROLES 
        ? process.env.TICKET_STAFF_ROLES.split(',').map(id => id.trim()) 
        : [];

      // Kanalları Kilitle (Yetkili Kanalları Hariç)
      const channels = await guild.channels.fetch();
      for (const [id, channel] of channels) {
        if (!channel || channel.type === ChannelType.GuildCategory) continue;

        const isStaffChannel = staffRoles.some(roleId => 
          channel.permissionOverwrites.cache.has(roleId)
        );

        if (!isStaffChannel) {
          await channel.permissionOverwrites.edit(guild.id, {
            ViewChannel: false,
            SendMessages: false
          }).catch(() => {});
        }
      }

      // Bakım Bildirim Kanalı Oluştur
      const bakimKanali = await guild.channels.create({
        name: 'bakım-duyuru',
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
            deny: [PermissionFlagsBits.SendMessages]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle('🛠️ SUNUCU BAKIMDA')
        .setDescription('Sunucumuz teknik bir bakım ve güncelleme çalışması nedeniyle geçici olarak kilitlenmiştir.\n\nBakım tamamlandığında tüm kanallar tekrar erişime açılacaktır. Anlayışınız için teşekkür ederiz!')
        .setColor('#ED4245')
        .setTimestamp();

      await bakimKanali.send({ embeds: [embed] });
      return message.channel.send(`✅ **Bakım modu aktif edildi!** Tüm kanallar kilitlendi ve ${bakimKanali} oluşturuldu.`).catch(() => {});
    }

    // B) BAKIM MODUNU KAPATMA
    if (secim === 'kapat') {
      if (!message.client.bakimModu) {
        return message.channel.send('⚠️ Bakım modu zaten **kapalı**.').catch(() => {});
      }

      message.client.bakimModu = false;
      await message.channel.send('🔄 Kanalların kilitleri kaldırılıyor...').catch(() => {});

      // Bakım duyuru kanalını sil
      const bakimKanali = guild.channels.cache.find(c => c.name === 'bakım-duyuru');
      if (bakimKanali) await bakimKanali.delete().catch(() => {});

      const staffRoles = process.env.TICKET_STAFF_ROLES 
        ? process.env.TICKET_STAFF_ROLES.split(',').map(id => id.trim()) 
        : [];

      // Kanalların İzinlerini Eski Hali İçin Aç
      const channels = await guild.channels.fetch();
      for (const [id, channel] of channels) {
        if (!channel || channel.type === ChannelType.GuildCategory) continue;

        const isStaffChannel = staffRoles.some(roleId => 
          channel.permissionOverwrites.cache.has(roleId)
        );

        if (!isStaffChannel) {
          await channel.permissionOverwrites.edit(guild.id, {
            ViewChannel: null,
            SendMessages: null
          }).catch(() => {});
        }
      }

      return message.channel.send('✅ **Bakım modu kapatıldı!** Tüm kanallar tekrar kullanıma açıldı.').catch(() => {});
    }

    const durum = message.client.bakimModu ? '🟢 **AÇIK**' : '🔴 **KAPALI**';
    message.channel.send(`ℹ️ Kullanım: \`!bakım aç\` veya \`!bakım kapat\` (Şu anki Durum: ${durum})`).catch(() => {});
  }
};