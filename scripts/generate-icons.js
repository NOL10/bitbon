import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple Bitcoin Bonsai icon
async function generateIcons() {
  // Create output directory if it doesn't exist
  const outputDir = path.join(process.cwd(), 'build', 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate base SVG
  const svg = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#1a1a1a"/>
      <circle cx="256" cy="256" r="200" fill="#f7931a"/>
      <text x="256" y="320" font-family="Arial" font-size="200" fill="#1a1a1a" text-anchor="middle">₿</text>
    </svg>
  `;

  // Generate PNG for Linux
  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png({
      quality: 100,
      compressionLevel: 9,
      chromaSubsampling: '4:4:4'
    })
    .toFile(path.join(outputDir, 'icon.png'));

  // Generate ICO for Windows
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    sizes.map(size =>
      sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  await sharp(pngBuffers[0])
    .joinChannel(pngBuffers)
    .toFile(path.join(outputDir, 'icon.ico'));

  console.log('Icons generated successfully');
}

generateIcons().catch(console.error); 