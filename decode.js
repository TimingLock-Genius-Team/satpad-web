const fs = require('fs');
const zlib = require('zlib');
const html = fs.readFileSync('Eulr-demo.html', 'utf-8');
const manifestStart = html.indexOf('<script type="__bundler/manifest">') + '<script type="__bundler/manifest">'.length;
const manifestEnd = html.indexOf('</script>', manifestStart);
const manifestJson = html.substring(manifestStart, manifestEnd).trim();
const manifest = JSON.parse(manifestJson);
for (const [uuid, entry] of Object.entries(manifest)) {
  if (entry.mime === 'text/javascript' || entry.mime === 'text/babel' || entry.mime === 'text/jsx') {
    const buf = Buffer.from(entry.data, 'base64');
    if (entry.compressed) {
      const decompressed = zlib.gunzipSync(buf);
      fs.writeFileSync('script-' + uuid + '.js', decompressed);
    } else {
      fs.writeFileSync('script-' + uuid + '.js', buf);
    }
  }
}
