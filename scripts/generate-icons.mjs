import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

async function generateIcon(size, filename) {
  const fontSize = Math.round(size * 0.18);
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#000000"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
          font-family="sans-serif" font-weight="bold" font-size="${fontSize}px" fill="#ffffff">
      meals
    </text>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(join(outDir, filename));
  console.log(`Generated ${filename} (${size}x${size})`);
}

await generateIcon(192, 'icon-192x192.png');
await generateIcon(512, 'icon-512x512.png');
await generateIcon(180, 'apple-touch-icon.png');
