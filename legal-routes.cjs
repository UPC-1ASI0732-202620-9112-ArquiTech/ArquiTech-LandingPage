// Materialize legal routes for static hosting (including GitHub Pages).
const fs = require('node:fs');
const path = require('node:path');
const output = path.join(__dirname, 'dist/landingatt3/browser');
const html = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
for (const route of ['privacy', 'terms']) {
  const directory = path.join(output, route);
  fs.mkdirSync(directory, {recursive: true});
  fs.writeFileSync(path.join(directory, 'index.html'), html);
}
