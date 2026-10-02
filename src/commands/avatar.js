import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Bir kullanicinin avatarini buyuk gosterir')
        .addUserOption((option) =>
            option
                .setName('hedef')
                .setDescription('Avatarini gormek istedigin kullanici (bos birakirsan kendin)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const hedefUser = interaction.options.getUser('hedef') || interaction.user;

        const embed = new EmbedBuilder()
            .setColor(0xfee75c)
            .setTitle(`${hedefUser.username} - Avatar`)
            .setImage(hedefUser.displayAvatarURL({ size: 1024 }));

        await interaction.reply({ embeds: [embed] });
    },
};