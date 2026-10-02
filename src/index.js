import { Client, GatewayIntentBits, Collection } from 'discord.js';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupGuard } from './guard.js';
import { setupWelcomeGoodbye } from './welcome-goodbye.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Render.com web servisi için Express Sağlık Kontrolü (Port ayarı)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot aktif ve çalışıyor!');
});

app.listen(PORT, () => {
    console.log(`🌐 Express sunucusu ${PORT} portunda dinlemede.`);
});

// Discord Bot Client Tanımlamaları
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
    ],
});

client.commands = new Collection();

// Komutları Dinamik Yükleme (ES Modules)
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        import(`file://${filePath}`).then((module) => {
            const command = module.default;
            if (command && command.name && typeof command.execute === 'function') {
                client.commands.set(command.name, command);
                console.log(`✅ Komut yüklendi: ${command.name}`);
            } else {
                console.log(`⚠️ Uyarı: ${file} dosyasında 'name' veya 'execute' alanı eksik veya geçersiz.`);
            }
        }).catch((err) => {
            console.error(`❌ Komut yüklenirken hata oluştu (${file}):`, err);
        });
    }
}

// Güvenlik ve Karşılama Sistemlerini Başlat
setupGuard(client);
setupWelcomeGoodbye(client);

// Bot Hazır Olduğunda
client.once('ready', () => {
    console.log(`🤖 Bot aktif: ${client.user.tag}`);
});

// DOĞRULAMA KONTROLÜ + MESAJ KOMUT İŞLEYİCİSİ
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // KESİN DOĞRULAMA KONTROLÜ: 
    // Eğer kullanıcıda VERIFIED_ROLE_ID yoksa, kurucu/owner hariç hiçbir komut veya mesaj işlemine izin verilmez.
    const verifiedRoleId = process.env.VERIFIED_ROLE_ID;
    const ownerId = process.env.OWNER_ID;

    if (verifiedRoleId && message.author.id !== ownerId && message.author.id !== message.guild.ownerId) {
        const member = await message.guild.members.fetch(message.author.id).catch(() => null);
        if (!member || !member.roles.cache.has(verifiedRoleId)) {
            // Doğrulanmamış üyelerin mesajını anında sil ve işlem yaptırma
            if (message.deletable) await message.delete().catch(() => {});
            return;
        }
    }

    // Bakım modu kontrolü
    if (message.client.bakimModu) {
        if (message.author.id !== ownerId && message.author.id !== message.guild.ownerId) {
            return; 
        }
    }

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        await message.reply('❌ Bu komutu yürütürken bir hata oluştu!').catch(() => {});
    }
});

// Doğrulama Buton Etkileşimi (!panelyap butonu)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'sunucu_dogrula') {
        try {
            const verifiedRoleId = process.env.VERIFIED_ROLE_ID; 
            
            if (!verifiedRoleId) {
                return interaction.reply({ content: '❌ Doğrulama rolü sistemde ayarlanmamış!', ephemeral: true });
            }

            const member = interaction.member;
            if (member.roles.cache.has(verifiedRoleId)) {
                return interaction.reply({ content: '⚠️ Zaten doğrulanmış durumdasınız!', ephemeral: true });
            }

            await member.roles.add(verifiedRoleId);
            await interaction.reply({ content: '✅ Başarıyla doğrulandınız! Artık sunucuyu kullanabilirsiniz.', ephemeral: true });
        } catch (error) {
            console.error('Doğrulama Hatası:', error);
            await interaction.reply({ content: '❌ Doğrulama sırasında bir hata oluştu.', ephemeral: true });
        }
    }
});

// Bot Giriş İşlemi
client.login(process.env.DISCORD_TOKEN);