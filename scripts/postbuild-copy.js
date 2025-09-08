const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'db.json');
const destDir = path.resolve(__dirname, '..', 'dist');
const dest = path.join(destDir, 'db.json');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Copied db.json to dist/');
  } else {
    console.log('db.json not found, skipping copy');
  }
} catch (err) {
  console.error('postbuild copy failed:', err);
  process.exit(1);
}