const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'rolkill',
    description: '0-100k arası TSB Kill rollerini renkli şekilde oluşturur',
    async execute(message, args) {
        // Yetki kontrolü (Rolleri Yönet yetkisi gerekli)
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply('❌ Bu komutu kullanmak için **Rolleri Yönet** yetkisine sahip olmalısın.');
        }

        // 0k'dan 100k'ya kadar 5k'lık aralıkları otomatik üreten dizi
        const killRolleri = [];
        for (let i = 0; i < 100; i += 5) {
            const baslangic = i === 0 ? '0' : `${i}k`;
            const bitis = `${i + 5}k`;
            killRolleri.push(`${baslangic}-${bitis} Kill`);
        }
        killRolleri.push('100k+ Kill');

        // Her rol için rastgele canlı bir renk üreten fonksiyon
        const rastgeleRenk = () => Math.floor(Math.random() * 16777215);

        const bilgi = await message.channel.send(`⚔️ **TSB Kill Rolleri Oluşturuluyor...**\nToplam ${killRolleri.length} adet rol sırayla eklenecek, lütfen bekleyin.`);

        let olusturulanSayisi = 0;

        try {
            for (const rolAdi of killRolleri) {
                const varMi = message.guild.roles.cache.find(r => r.name.toLowerCase() === rolAdi.toLowerCase());
                
                if (!varMi) {
                    await message.guild.roles.create({
                        name: rolAdi,
                        color: rastgeleRenk(),
                        reason: 'TSB Kill Rolleri Otomatik Oluşturma'
                    });
                    olusturulanSayisi++;
                    // Discord rate limit koruması için bekleme
                    await new Promise(resolve => setTimeout(resolve, 800));
                }
            }

            await bilgi.edit(`✅ **İşlem Tamamlandı!**\nToplam **${olusturulanSayisi}** adet yeni TSB Kill rolü renkli olarak oluşturuldu!`);
        } catch (error) {
            console.error('TSB Rol Hatası:', error);
            await bilgi.edit('❌ Roller oluşturulurken bir hata oluştu. Botun rolünün sunucudaki en üst seviyede ve yetkisinin tam olduğundan emin ol.');
        }
    }
};