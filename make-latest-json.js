// Використання: node make-latest-json.js <zip> <версія> <url> ["що нового; ще пункт"]
// Друкує latest.json для кнопки «Оновити програму» в NOBODY · Моя робота.
// Пункти «що нового» розділяються крапкою з комою.
const fs = require('fs'), crypto = require('crypto');
const [zip, version, url, notes] = process.argv.slice(2);
if (!zip || !version || !url || !/^\d+\.\d+\.\d+$/.test(version)) { console.error('node make-latest-json.js <zip> <version> <url> [notes]'); process.exit(2); }
const buf = fs.readFileSync(zip);
console.log(JSON.stringify({
  app: 'NobodyWork', version, arch: 'arm64', url,
  sha256: crypto.createHash('sha256').update(buf).digest('hex'), size: buf.length,
  notes: notes ? notes.split(';').map(s => s.trim()).filter(Boolean) : [],
  publishedAt: new Date().toISOString()
}, null, 2));
