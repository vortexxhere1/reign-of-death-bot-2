const { Events, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {

    // 1. SLASH KOMUTLARI
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`❌ Komut hatası (${interaction.commandName}):`, error);
        const errObj = { content: '❌ Komut çalıştırılırken hata oluştu!', flags: 64 };
        if (interaction.replied || interaction.deferred) await interaction.followUp(errObj).catch(() => {});
        else await interaction.reply(errObj).catch(() => {});
      }
      return;
    }

    // 2. TICKET BUTONLARI
    if (interaction.isButton()) {

      // A) TICKET OLUŞTUR
      if (interaction.customId === 'ticket_olustur_yeni') {
        await interaction.deferReply({ flags: 64 });

        const guild = interaction.guild;
        const user = interaction.user;

        const varOlanKanal = guild.channels.cache.find(
          c => c.name === `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`
        );

        if (varOlanKanal) {
          return interaction.editReply({ content: `❌ Zaten açık bir destek talebiniz var: ${varOlanKanal}` });
        }

        const categoryId = process.env.TICKET_CATEGORY_ID;
        const staffRoleIds = process.env.TICKET_STAFF_ROLES 
          ? process.env.TICKET_STAFF_ROLES.split(',').map(id => id.trim()).filter(id => id.length > 0)
          : [];

        const permissionOverwrites = [
          { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
        ];

        staffRoleIds.forEach(roleId => {
          permissionOverwrites.push({
            id: roleId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.AttachFiles],
          });
        });

        try {
          const ticketKanal = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            parent: categoryId || null,
            permissionOverwrites: permissionOverwrites,
          });

          const embed = new EmbedBuilder()
            .setTitle(`🎫 Destek Talebi: ${user.username}`)
            .setDescription(`Merhaba <@${user.id}>, destek talebiniz oluşturuldu.\nYetkililerimiz en kısa sürede sizinle ilgilenecektir.`)
            .setColor('#5865F2')
            .setTimestamp();

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_kapat_yeni')
              .setLabel('🔒 Talebi Kapat')
              .setStyle(ButtonStyle.Danger)
          );

          const roleMentions = staffRoleIds.map(id => `<@&${id}>`).join(' ');
          const mentionContent = staffRoleIds.length > 0 ? `<@${user.id}> | ${roleMentions}` : `<@${user.id}>`;

          await ticketKanal.send({ content: mentionContent, embeds: [embed], components: [row] });
          await interaction.editReply({ content: `✅ Destek talebiniz oluşturuldu: ${ticketKanal}` });

        } catch (error) {
          console.error('❌ Ticket kanalı oluşturulurken hata:', error);
          await interaction.editReply({ content: '❌ Destek kanalı oluşturulamadı! (.env ID ayarlarınızı kontrol edin)' });
        }
        return;
      }

      // B) TICKET KAPAT VE LOGLA
      if (interaction.customId === 'ticket_kapat_yeni') {
        await interaction.reply({ content: '🔒 Destek talebi kapatılıyor ve transkript kaydediliyor...', flags: 64 });

        const channel = interaction.channel;
        const logChannelId = process.env.TICKET_LOG_CHANNEL_ID;
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        // Mesaj geçmişini al ve transkript oluştur
        if (logChannel) {
          try {
            const fetchedMessages = await channel.messages.fetch({ limit: 100 });
            const messageList = Array.from(fetchedMessages.values()).reverse();

            let transcriptTxt = `=========================================\n`;
            transcriptTxt += `TICKET TRANSKRIPT: #${channel.name}\n`;
            transcriptTxt += `Kapatan: ${interaction.user.tag} (${interaction.user.id})\n`;
            transcriptTxt += `Tarih: ${new Date().toLocaleString('tr-TR')}\n`;
            transcriptTxt += `=========================================\n\n`;

            messageList.forEach(m => {
              transcriptTxt += `[${m.createdAt.toLocaleString('tr-TR')}] ${m.author.tag}: ${m.content}\n`;
            });

            const buffer = Buffer.from(transcriptTxt, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `${channel.name}-transkript.txt` });

            const logEmbed = new EmbedBuilder()
              .setTitle('📁 Ticket Kapatıldı')
              .addFields(
                { name: 'Kanal', value: channel.name, inline: true },
                { name: 'Kapatan Yetkili/Üye', value: `${interaction.user}`, inline: true }
              )
              .setColor('#ED4245')
              .setTimestamp();

            await logChannel.send({ embeds: [logEmbed], files: [attachment] });
          } catch (err) {
            console.error('Log kanalı gönderim hatası:', err);
          }
        }

        setTimeout(() => {
          channel.delete().catch(err => console.error('Kanal silinemedi:', err));
        }, 3000);
        return;
      }

    }
  }
};