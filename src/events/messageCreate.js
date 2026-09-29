const { Events } = require('discord.js');

const PREFIX = '!';

const otoCevaplar = [
  { anahtarlar: ['selam', 'merhaba', 'selamlar'], cevap: 'Selam! Nasıl yardımcı olabilirim? 👋' },
  { anahtarlar: ['nasilsin', 'naber'], cevap: 'İyiyim, sorduğun için teşekkürler! Sen nasılsın? 😊' },
  { anahtarlar: ['tesekkur', 'sagol', 'sagolun'], cevap: 'Rica ederim! 🙌' },
];

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    // 1. Prefixli Komut Kontrolü
    if (message.content.startsWith(PREFIX)) {
      const args = message.content.slice(PREFIX.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      const command = message.client.commands.get(commandName);
      if (command) {
        try {
          await command.execute(message, args);
        } catch (error) {
          console.error('Komut hatası:', error);
          message.reply('❌ Komut çalıştırılırken bir hata oluştu!');
        }
        return;
      }
    }

    // 2. Oto-Cevap Kontrolü
    const icerik = message.content.toLowerCase();
    for (const { anahtarlar, cevap } of otoCevaplar) {
      if (anahtarlar.some((kelime) => icerik.includes(kelime))) {
        message.reply(cevap);
        break;
      }
    }
  }
};