import { readFile, copyFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const originals = path.join(root, 'assets/site-images');
const publicDir = path.join(root, 'public');
const { published } = JSON.parse(await readFile(path.join(originals, 'manifest.json'), 'utf8'));
const mb = bytes => (bytes / 1048576).toFixed(2);
let outputBytes = 0;
const versions = {};

// Publish the original bytes at the existing URLs. Photography must never be
// resized, re-encoded, or recompressed during deployment.
for (const relative of published) {
  if (!/^[a-z0-9-]+\/[a-z0-9-]+\.(jpg|png|webp)$/.test(relative)) {
    throw new Error(`Invalid image manifest path: ${relative}`);
  }
  const source = path.join(originals, relative);
  const destination = path.join(publicDir, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
  outputBytes += (await stat(source)).size;
  const bytes = await readFile(source);
  const metadata = await sharp(bytes).metadata();
  const rotated = [5, 6, 7, 8].includes(metadata.orientation);
  versions[`/${relative}`] = {
    version: createHash('sha256').update(bytes).digest('hex').slice(0, 16),
    width: rotated ? metadata.height : metadata.width,
    height: rotated ? metadata.width : metadata.height,
  };
}

// The panoramic hero is over 9000px wide. Crop only the portion already visible
// on portrait phones, using the same 75% horizontal anchor as the CSS. Lossless
// encoding preserves the master's decoded pixels; Next performs the only lossy
// encoding, at the device's actual required resolution.
const hero = '/image-hero/hero2.jpg';
const heroMeta = versions[hero];
const cropWidth = Math.floor(heroMeta.height * 3 / 4);
const left = Math.round((heroMeta.width - cropWidth) * 0.75);
const mobileHero = '/image-hero/hero-mobile.webp';
const mobileBytes = await sharp(path.join(originals, hero.slice(1))).autoOrient()
  .extract({ left, top: 0, width: cropWidth, height: heroMeta.height })
  .webp({ lossless: true, effort: 4 }).toBuffer();
await writeFile(path.join(publicDir, mobileHero.slice(1)), mobileBytes);
versions[mobileHero] = {
  version: createHash('sha256').update(mobileBytes).digest('hex').slice(0, 16),
  width: cropWidth, height: heroMeta.height,
};
const generated = path.join(root, 'src/app/generated');
await mkdir(generated, { recursive: true });
await writeFile(path.join(generated, 'image-versions.json'), `${JSON.stringify(versions, null, 2)}\n`);
console.log(`Site images: ${published.length} original masters retained (${mb(outputBytes)} MB); lossless portrait hero prepared. Responsive delivery compresses once at high quality.`);
