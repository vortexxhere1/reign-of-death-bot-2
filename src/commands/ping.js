module.exports = {
  data: { name: 'ping', description: 'Botun gecikme süresini gösterir' },
  async execute(message, args) {
    const baslangic = Date.now();
    const msg = await message.reply('Hesaplanıyor...');
    const gecikme = Date.now() - baslangic;
    await msg.edit(
      `🏓 Pong! Mesaj Gecikmesi: **${gecikme}ms** | API: **${Math.round(message.client.ws.ping)}ms**`
    );
  },
};