const { Events } = require('discord.js');

const PREFIX = '!';

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    // Sadece Prefixli Komut Kontrolü
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
      }
    }
  }
};