import { readFile, copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const originals = path.join(root, 'assets/site-images');
const publicDir = path.join(root, 'public');
const { published } = JSON.parse(await readFile(path.join(originals, 'manifest.json'), 'utf8'));
const mb = bytes => (bytes / 1048576).toFixed(2);
let outputBytes = 0;

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
}
console.log(`Site images: ${published.length} original files published unchanged (${mb(outputBytes)} MB). No image quality reduction.`);
