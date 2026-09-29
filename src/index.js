const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('node:fs');
const { Client, GatewayIntentBits, Collection, Options } = require('discord.js');
const { dashboardBaslat } = require('./dashboard/server');

// 1. RAM Tasarruflu Client Tanımı
const client = new Client({
  makeCache: Options.cacheWithLimits({
    MessageManager: 50,
    StageInstanceManager: 0,
    GuildBanManager: 0,
    GuildInviteManager: 0,
    GuildStickerManager: 0,
    GuildScheduledEventManager: 0,
    ReactionManager: 0,
    PresenceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
  }),
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 2. Komut Yükleyici
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((dosya) => dosya.endsWith('.js'));

for (const dosya of commandFiles) {
  const komut = require(path.join(commandsPath, dosya));
  if ('data' in komut && 'execute' in komut) {
    client.commands.set(komut.data.name, komut);
  } else {
    console.warn(`⚠️ ${dosya} dosyasında "data" veya "execute" eksik, atlanıyor.`);
  }
}
console.log(`🔧 ${client.commands.size} komut yüklendi: ${[...client.commands.keys()].join(', ')}`);

// 3. Event Yükleyici
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((dosya) => dosya.endsWith('.js'));

for (const dosya of eventFiles) {
  const event = require(path.join(eventsPath, dosya));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}
console.log(`🔧 ${eventFiles.length} event yüklendi: ${eventFiles.join(', ')}`);

// 4. Dashboard ve Botu Başlat
client.once('ready', () => dashboardBaslat(client));

client.login(process.env.DISCORD_TOKEN);