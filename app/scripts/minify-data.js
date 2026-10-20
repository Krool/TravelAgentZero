// minify-data.js - postbuild step: rewrite out/data/*.json without whitespace.
//
// public/data/travelers.json stays pretty-printed for readable diffs; the
// static export ships the compact form. Runs automatically after `npm run build` (npm postbuild).

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'out', 'data');
if (!fs.existsSync(dataDir)) {
  console.error(`minify-data: ${dataDir} not found - run next build first`);
  process.exit(1);
}

for (const name of fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))) {
  const file = path.join(dataDir, name);
  const before = fs.statSync(file).size;
  fs.writeFileSync(file, JSON.stringify(JSON.parse(fs.readFileSync(file, 'utf8'))));
  const after = fs.statSync(file).size;
  console.log(`minify-data: ${name} ${before} -> ${after} bytes`);
}
