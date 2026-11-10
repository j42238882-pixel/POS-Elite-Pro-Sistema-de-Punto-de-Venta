const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
  { file: 'assets/prod_aceite.jpg',        url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80' },
  { file: 'assets/prod_cafe.jpg',          url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&q=80' },
  { file: 'assets/prod_azucar.jpg',        url: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&q=80' },
  { file: 'assets/prod_queso.jpg',         url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80' },
  { file: 'assets/prod_leche.jpg',         url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80' },
  { file: 'assets/prod_mantequilla.jpg',   url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80' },
  { file: 'assets/prod_jamon.jpg',         url: 'https://images.unsplash.com/photo-1524438418049-ab2acb7aa48f?w=500&q=80' },
  { file: 'assets/prod_refresco.jpg',      url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' },
  { file: 'assets/prod_malta.jpg',         url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&q=80' },
  { file: 'assets/prod_jugo.jpg',          url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&q=80' },
  { file: 'assets/prod_agua.jpg',          url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&q=80' },
  { file: 'assets/prod_galletas.jpg',      url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&q=80' },
  { file: 'assets/prod_chocolate.jpg',     url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&q=80' }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = (u) => {
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Status ${res.statusCode} for ${u}`));
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            const stats = fs.statSync(dest);
            resolve(stats.size);
          });
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    };
    get(url);
  });
}

async function run() {
  console.log('Downloading real product photos...');
  for (const item of images) {
    const target = path.join(__dirname, '..', item.file);
    try {
      const size = await download(item.url, target);
      console.log(`[OK] ${item.file} -> ${size} bytes`);
    } catch (err) {
      console.error(`[ERR] ${item.file}:`, err.message);
    }
  }
  console.log('Download complete.');
}

run();
