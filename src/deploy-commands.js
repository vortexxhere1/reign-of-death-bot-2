require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

// commands/ klasorundeki her dosyayi otomatik okuyup Discord'a gonderecegimiz
// listeyi olusturuyoruz. Yeni komut eklediginde bu dosyayi degistirmene gerek yok,
// sadece "npm run deploy" komutunu tekrar calistir.
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((dosya) => dosya.endsWith('.js'));

for (const dosya of commandFiles) {
  const komut = require(path.join(commandsPath, dosya));
  if ('data' in komut) {
    commands.push(komut.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`${commands.length} slash komutu kaydediliyor: ${commands.map((c) => c.name).join(', ')}`);

    if (process.env.GUILD_ID) {
      // Sunucuya ozel kayit: aninda gorunur, test icin ideal
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );
      console.log('✅ Sunucuya ozel komutlar kaydedildi.');
    } else {
      // Global kayit: tum sunucularda gorunur, yayilmasi ~1 saat surebilir
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
      );
      console.log('✅ Global komutlar kaydedildi.');
    }
  } catch (error) {
    console.error('❌ Komutlar kaydedilirken hata olustu:', error);
  }
})();
