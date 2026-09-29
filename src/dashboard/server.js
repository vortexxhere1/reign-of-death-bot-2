const express = require('express');
const path = require('path');

/**
 * Bot ile ayni process icinde calisan hafif bir web dashboard.
 * client'i disaridan alir, /api/stats endpoint'i uzerinden canli veri sunar.
 */
function dashboardBaslat(client) {
  const app = express();
  const port = process.env.DASHBOARD_PORT || 3000;

  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/stats', (req, res) => {
    res.json({
      botEtiketi: client.user?.tag || 'Baglanmadi',
      avatarUrl: client.user?.displayAvatarURL() || null,
      sunucuSayisi: client.guilds.cache.size,
      kullaniciSayisi: client.guilds.cache.reduce((toplam, g) => toplam + g.memberCount, 0),
      komutSayisi: client.commands.size,
      pingMs: Math.round(client.ws.ping),
      calismaSuresiSaniye: Math.floor(client.uptime / 1000),
      komutlar: client.commands.map((k) => ({ isim: k.data.name, aciklama: k.data.description })),
    });
  });

  app.listen(port, () => {
    console.log(`🖥️  Dashboard hazir: http://localhost:${port}`);
  });
}

module.exports = { dashboardBaslat };
