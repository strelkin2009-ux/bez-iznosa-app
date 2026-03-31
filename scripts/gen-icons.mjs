import { writeFileSync } from 'fs';

// Simple 1x1 pixel placeholder PNGs - replace with real icons later
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#B8673E"/>
  <text x="256" y="300" text-anchor="middle" font-family="Georgia,serif" font-size="240" font-weight="600" fill="#FDFBF8">БИ</text>
</svg>`;

writeFileSync('public/icon.svg', svg);
console.log('Created icon.svg — convert to PNG with any tool');
