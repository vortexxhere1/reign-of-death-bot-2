import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    name: 'oylama',
    description: 'Oylama başlatır.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

        const soru = args.join(' ');
        if (!soru) return message.reply('❌ Lütfen oylama konusu yazın.');

        const embed = new EmbedBuilder()
            .setTitle('📊 Oylama')
            .setDescription(soru)
            .setColor('#FEE75C')
            .setFooter({ text: `${message.author.tag} tarafından başlatıldı.` });

        const oylamaMesaj = await message.channel.send({ embeds: [embed] });
        await oylamaMesaj.react('👍');
        await oylamaMesaj.react('👎');
        if (message.deletable) message.delete().catch(() => {});
    }
};