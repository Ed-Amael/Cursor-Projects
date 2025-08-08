const fs = require('fs');
const path = require('path');
const localtunnel = require('localtunnel');

(async () => {
  try {
    const port = process.env.PORT || 8080;
    const subdomain = process.env.LT_SUB || undefined; // optional custom subdomain
    const tunnel = await localtunnel({ port, subdomain });
    const url = tunnel.url;
    const file = path.resolve(__dirname, 'TUNNEL_URL.txt');
    fs.writeFileSync(file, url, 'utf8');
    console.log('Public URL:', url);

    tunnel.on('close', () => {
      console.log('Tunnel closed');
      try { fs.unlinkSync(file); } catch {}
    });
  } catch (err) {
    console.error('Tunnel error', err);
    process.exit(1);
  }
})();