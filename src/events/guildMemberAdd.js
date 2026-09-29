const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    // .env icinde WELCOME_CHANNEL_ID belirtilmisse oraya, belirtilmemisse
    // sunucunun sistem kanalina (varsa) hos geldin mesaji gonderiyoruz
    const kanalId = process.env.WELCOME_CHANNEL_ID;
    const kanal = kanalId
      ? member.guild.channels.cache.get(kanalId)
      : member.guild.systemChannel;

    if (!kanal || !kanal.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('👋 Hos geldin!')
      .setDescription(`**${member.user.username}**, ${member.guild.name} sunucusuna hos geldin!`)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: `Simdi ${member.guild.memberCount}. uyeyiz` })
      .setTimestamp();

    kanal.send({ embeds: [embed] }).catch((err) => console.error('Hos geldin mesaji gonderilemedi:', err));
  },
};
