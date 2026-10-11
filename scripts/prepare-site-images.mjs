import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const originals = path.join(root, 'assets/site-images');
const publicDir = path.join(root, 'public');
const cacheDir = path.join(root, '.local-logs/site-images');
const { published } = JSON.parse(await readFile(path.join(originals, 'manifest.json'), 'utf8'));
const recipe = '3840px-jpeg90-444-png-lossless-v1';
const mb = bytes => (bytes / 1048576).toFixed(2);
let inputBytes = 0;
let outputBytes = 0;

// Keep original photography in Git. Only publish the images actually used by
// the site, at the same URLs. Never resize up or crop; PNG transparency remains.
for (const relative of published) {
  if (!/^[a-z0-9-]+\/[a-z0-9-]+\.(jpg|png|webp)$/.test(relative)) {
    throw new Error(`Invalid image manifest path: ${relative}`);
  }
  const input = await readFile(path.join(originals, relative));
  const destination = path.join(publicDir, relative);
  const hashPath = path.join(cacheDir, `${relative}.sha256`);
  const digest = createHash('sha256').update(recipe).update(input).digest('hex');
  inputBytes += input.length;
  const cacheHit = await readFile(hashPath, 'utf8').then(hash => hash === digest).catch(() => false);
  const existing = await stat(destination).catch(() => null);
  if (cacheHit && existing) {
    outputBytes += existing.size;
    continue;
  }
  let image = sharp(input).autoOrient().resize({
    width: 3840, height: 3840, fit: 'inside', withoutEnlargement: true,
  });
  if (relative.endsWith('.jpg')) image = image.jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: '4:4:4' });
  else if (relative.endsWith('.png')) image = image.png({ compressionLevel: 9 });
  else image = image.webp({ quality: 90 });
  const output = await image.toBuffer();
  // Keep a smaller original if recompression would increase its size.
  const chosen = output.length < input.length ? output : input;
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, chosen);
  await mkdir(path.dirname(hashPath), { recursive: true });
  await writeFile(hashPath, digest);
  outputBytes += chosen.length;
}
console.log(`Site images: ${published.length} URLs preserved; ${mb(inputBytes)} MB → ${mb(outputBytes)} MB (${(100 * (1 - outputBytes / inputBytes)).toFixed(1)}% smaller). Originals retained outside the deployment.`);
