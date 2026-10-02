import { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    name: 'ticket-kur',
    description: 'Destek talebi panelini kurar.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Bu komutu kullanmak için `Yönetici` yetkisine sahip olmalısın!');
        }

        const embed = new EmbedBuilder()
            .setTitle('🎫 Destek Merkezi')
            .setDescription('Bir sorununuz, şikayetiniz veya talebiniz varsa aşağıdaki butona tıklayarak özel destek kanalı açabilirsiniz.')
            .setColor('#5865F2')
            .setFooter({ text: `${message.guild.name} • Destek Sistemi` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_olustur_yeni')
                .setLabel('📩 Destek Talebi Oluştur')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        if (message.deletable) message.delete().catch(() => {});
    }
};