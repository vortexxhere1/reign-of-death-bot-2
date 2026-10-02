import { PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'giriscikis-ayarla',
    description: 'Resimli/embedli giriş çıkış kanalını ayarlar.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Bu komutu kullanmak için `Yönetici` yetkisine sahip olmalısın.');
        }

        const kanal = message.mentions.channels.first();
        if (!kanal) {
            return message.reply('❌ Lütfen bir kanal etiketleyin. Örnek: `!giriscikis-ayarla #hoşgeldiniz`');
        }

        const dbPath = path.join(__dirname, '../../veritabani.json');
        let veritabani = {};

        if (fs.existsSync(dbPath)) {
            try {
                veritabani = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            } catch (err) {
                veritabani = {};
            }
        }

        veritabani[message.guild.id] = {
            ...veritabani[message.guild.id],
            welcomeChannelId: kanal.id
        };

        fs.writeFileSync(dbPath, JSON.stringify(veritabani, null, 2));

        await message.reply(`✅ Giriş-Çıkış kanalı başarıyla ${kanal} olarak ayarlandı!`);
    }
};