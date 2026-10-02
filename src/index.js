import { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    Events, 
    AuditLogEvent, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    Collection 
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const TOKEN = process.env.DISCORD_TOKEN || 'SENIN_BOT_TOKENIN';
const PREFIX = '!';

const GUVENLI_KULLANICILAR = ['SENIN_DISCORD_USER_ID'];
const KANALLAR = {
    giris: 'GİRİŞ_YAPILACAK_KANAL_ID',
    cikis: 'ÇIKIŞ_YAPILACAK_KANAL_ID',
    log: 'GUARD_LOG_KANAL_ID'
};
const SHUTUP_ROL_ID = 'CEZALI_VEYA_SHUTUP_ROL_ID';
const SISTEM_SIFRESI = "seninsifren123";
const dogrulananlar = new Set();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Komutları saklayacağımız koleksiyon
client.commands = new Collection();

// 📁 COMMANDS KLASÖRÜNÜ OTOMATİK OKUYAN SİSTEM (HANDLER)
async function komutlariYukle() {
    const commandsPath = path.join(process.cwd(), 'commands');
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const fileUrl = pathToFileURL(filePath).href;
        const command = await import(fileUrl);
        if (command.default && command.default.name) {
            client.commands.set(command.default.name, command.default);
            console.log(`[KOMUT] Yüklendi: ${command.default.name}`);
        }
    }
}

client.once(Events.ClientReady, async (c) => {
    await komutlariYukle();
    console.log(`Bot aktif: ${c.user.tag}`);
});

// --- GİRİŞ & BOT GUARD ---
client.on(Events.GuildMemberAdd, async (member) => {
    const kanal = member.guild.channels.cache.get(KANALLAR.giris);
    const logKanal = member.guild.channels.cache.get(KANALLAR.log);

    if (member.user.bot) {
        try {
            const logs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd });
            const log = logs.entries.first();
            const ekleyen = log ? log.executor : null;
            let guvenli = ekleyen ? GUVENLI_KULLANICILAR.includes(ekleyen.id) : false;
            if (ekleyen && ekleyen.id === member.guild.ownerId) guvenli = true;

            if (!guvenli) {
                await member.kick('İzinsiz bot ekleme (Bot Guard)');
                if (logKanal) {
                    await logKanal.send({ embeds: [new EmbedBuilder().setColor('#FF0000').setTitle('🚨 Bot Guard').setDescription(`İzinsiz eklenen **${member.user.tag}** atıldı.`)] });
                }
                return;
            }
        } catch (e) { console.error(e); }
    }

    if (!kanal) return;
    const embed = new EmbedBuilder().setColor('#00FF00').setTitle('🎉 Aramıza Biri Katıldı!').setDescription(`Hey ${member}, hoş geldin!`);
    await kanal.send({ embeds: [embed] }).catch(() => {});
});

// --- ÇIKIŞ SİSTEMİ ---
client.on(Events.GuildMemberRemove, async (member) => {
    const kanal = member.guild.channels.cache.get(KANALLAR.cikis);
    if (!kanal) return;
    const embed = new EmbedBuilder().setColor('#FF0000').setTitle('😢 Biri Ayrıldı').setDescription(`**${member.user.tag}** ayrıldı.`);
    await kanal.send({ embeds: [embed] }).catch(() => {});
});

// --- KANAL & ROL GUARD ---
async function korumaIslemi(guild, isim, tur) {
    try {
        const logs = await guild.fetchAuditLogs({ limit: 1, type: tur });
        const log = logs.entries.first();
        if (!log || !log.executor) return;
        if (log.executor.id === guild.ownerId || GUVENLI_KULLANICILAR.includes(log.executor.id)) return;

        const uye = await guild.members.fetch(log.executor.id).catch(() => null);
        if (!uye) return;

        const roller = uye.roles.cache.filter(r => r.id !== guild.id && !r.managed);
        await uye.roles.remove(roller).catch(() => {});
        await uye.roles.add(SHUTUP_ROL_ID).catch(() => {});

        const logKanal = guild.channels.cache.get(KANALLAR.log);
        if (logKanal) {
            await logKanal.send({ embeds: [new EmbedBuilder().setColor('#FF0000').setTitle('🚨 Guard Müdahalesi').setDescription(`**${log.executor.tag}** izinsiz işlem yaptı (${isim}), rolleri alındı.`)] });
        }
    } catch (e) { console.error(e); }
}

client.on(Events.ChannelDelete, async (c) => { await korumaIslemi(c.guild, c.name, AuditLogEvent.ChannelDelete); });
client.on(Events.RoleDelete, async (r) => { await korumaIslemi(r.guild, r.name, AuditLogEvent.RoleDelete); });

// --- MESAJ VE KOMUT YÖNETİCİSİ (DASHBOARD + COMMANDS) ---
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Özel Panel Komutu
    if (commandName === 'panelyap') {
        if (!message.member.permissions.has('Administrator')) return message.reply('Yönetici olmalısın.');

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎛️ Güvenlik Doğrulama Merkezi')
            .setDescription('Yönetim paneline erişmek için aşağıdaki butona tıklayıp şifreyi giriniz.');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('panel_ac').setLabel('Doğrulama Ekranını Aç').setStyle(ButtonStyle.Primary).setEmoji('🔑')
        );

        await message.delete().catch(() => {});
        return message.channel.send({ embeds: [embed], components: [row] });
    }

    // commands klasöründeki komutları otomatik çalıştırma yeri
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        await message.reply('Komut çalıştırılırken bir hata oluştu!');
    }
});

// --- BUTON VE ŞİFRE (MODAL) ---
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'panel_ac') {
        const modal = new ModalBuilder().setCustomId('sifre_modal').setTitle('Güvenlik Paneli');
        const input = new TextInputBuilder().setCustomId('sifre_input').setLabel('Sistem şifresini girin:').setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'sifre_modal') {
        const girilen = interaction.fields.getTextInputValue('sifre_input');
        if (girilen === SISTEM_SIFRESI) {
            dogrulananlar.add(interaction.user.id);
            await interaction.reply({ content: '✅ Doğrulama başarılı!', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Hatalı şifre!', ephemeral: true });
        }
    }
});

client.login(TOKEN);