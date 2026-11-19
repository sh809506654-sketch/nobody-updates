// Використання: node make-latest-json.js <zip> <версія> <url> ["що нового; ще пункт"]
// Друкує latest.json для кнопки «Оновити програму» в NOBODY · Моя робота.
// Пункти «що нового» розділяються крапкою з комою.
// Необов'язково (з 1.0.5) - швидкий пакет «лише код», через змінні середовища:
//   APP_ONLY_ZIP, APP_ONLY_URL, ELECTRON_VERSION, APP_ONLY_MIN (за замовчуванням 1.0.5).
// Старі версії поле appOnly ігнорують і завантажують повний zip.
const fs = require('fs'), crypto = require('crypto');
const [zip, version, url, notes] = process.argv.slice(2);
if (!zip || !version || !url || !/^\d+\.\d+\.\d+$/.test(version)) { console.error('node make-latest-json.js <zip> <version> <url> [notes]'); process.exit(2); }
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const buf = fs.readFileSync(zip);
const feed = {
  app: 'NobodyWork', version, arch: 'arm64', url,
  sha256: sha(buf), size: buf.length,
  notes: notes ? notes.split(';').map(s => s.trim()).filter(Boolean) : [],
  publishedAt: new Date().toISOString()
};
const ao = process.env.APP_ONLY_ZIP;
if (ao) {
  if (!process.env.APP_ONLY_URL || !/^\d+\.\d+\.\d+/.test(process.env.ELECTRON_VERSION || '')) { console.error('APP_ONLY_URL і ELECTRON_VERSION обов\'язкові разом з APP_ONLY_ZIP'); process.exit(2); }
  const b = fs.readFileSync(ao);
  feed.appOnly = {
    url: process.env.APP_ONLY_URL, sha256: sha(b), size: b.length,
    electron: process.env.ELECTRON_VERSION, minVersion: process.env.APP_ONLY_MIN || '1.0.5'
  };
}
console.log(JSON.stringify(feed, null, 2));
