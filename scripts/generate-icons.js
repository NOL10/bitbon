import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple Bitcoin Bonsai icon
async function generateIcons() {
  const size = 1024;
  const padding = size * 0.1;
  const center = size / 2;
  const radius = (size - padding * 2) / 2;

  // Create base SVG
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F7931A;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF9500;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#grad)" />
      <path d="M${center} ${padding + radius * 0.2} 
             C${center + radius * 0.4} ${padding + radius * 0.4} 
             ${center + radius * 0.4} ${center + radius * 0.4} 
             ${center} ${center + radius * 0.6}
             C${center - radius * 0.4} ${center + radius * 0.4} 
             ${center - radius * 0.4} ${padding + radius * 0.4} 
             ${center} ${padding + radius * 0.2}Z" 
            fill="white" />
      <text x="${center}" y="${center + radius * 0.8}" 
            font-family="Arial" font-size="${radius * 0.4}" 
            fill="white" text-anchor="middle">₿</text>
    </svg>
  `;

  // Ensure directories exist
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate PNG (for Linux) with proper metadata
  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png({
      quality: 100,
      compressionLevel: 9,
      palette: true,
      colors: 256
    })
    .withMetadata({
      orientation: 1,
      density: 72,
      chromaSubsampling: '4:4:4'
    })
    .toFile(path.join(publicDir, 'icon.png'));

  // Generate ICO (for Windows) with multiple sizes
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    sizes.map(size =>
      sharp(Buffer.from(svg))
        .resize(size, size)
        .png({
          quality: 100,
          compressionLevel: 9,
          palette: true,
          colors: 256
        })
        .toBuffer()
    )
  );

  // Create ICO file with multiple sizes
  const icoPath = path.join(publicDir, 'icon.ico');
  await sharp(pngBuffers[0])
    .joinChannel(pngBuffers)
    .toFile(icoPath);

  // Generate ICNS (for macOS)
  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png({
      quality: 100,
      compressionLevel: 9,
      palette: true,
      colors: 256
    })
    .withMetadata({
      orientation: 1,
      density: 72,
      chromaSubsampling: '4:4:4'
    })
    .toFile(path.join(publicDir, 'icon.icns'));

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error); 