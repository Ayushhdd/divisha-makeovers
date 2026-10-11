import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const versions = JSON.parse(await readFile(new URL('src/app/generated/image-versions.json', root), 'utf8'));
const { published } = JSON.parse(await readFile(new URL('assets/site-images/manifest.json', root), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const p of published) {
  assert.equal(hash(await readFile(new URL(`public/${p}`, root))),
    hash(await readFile(new URL(`assets/site-images/${p}`, root))), `${p}: master must not be recompressed`);
}
const hero = versions['/image-hero/hero2.jpg'];
const mobile = versions['/image-hero/hero-mobile.webp'];
const crop = await sharp(fileURLToPath(new URL('assets/site-images/image-hero/hero2.jpg', root)))
  .autoOrient().extract({left:Math.round((hero.width-mobile.width)*0.75),top:0,width:mobile.width,height:mobile.height}).raw().toBuffer();
const prepared = await sharp(await readFile(new URL('public/image-hero/hero-mobile.webp', root))).raw().toBuffer();
assert.equal(hash(prepared), hash(crop), 'Portrait hero must preserve original decoded pixels and composition');
console.log('PASS: 60 original masters unchanged; mobile hero crop is pixel-exact and lossless.');

const site = process.argv[2] || 'http://localhost:5180';
for (const route of ['/', '/services/bridal', '/services/engagement-reception', '/services/party', '/services/nails']) {
  const r = await fetch(`${site}${route}`, {signal:AbortSignal.timeout(30000)});
  assert.equal(r.status, 200, route);
  const html = await r.text();
  assert.ok(html.includes('/_next/image?'), `${route}: responsive delivery must be enabled`);
  assert.ok(html.includes('responsive2'), `${route}: fresh image versions must be used`);
  if (route === '/') assert.ok(html.includes('hero-mobile.webp'), 'Mobile hero source must be present');
}
const profiles = [
  ['/image-hero/hero-mobile.webp',1920,92,'Mobile hero at 3x density'],
  ['/image-hero/hero2.jpg',3840,92,'Desktop hero'],
  ['/gallery/sgl6.jpg',960,92,'Mobile gallery thumbnail at 3x density'],
  ['/gallery/sgl6.jpg',2048,95,'Gallery enlarged photo'],
  ['/about/about.jpg',1920,92,'Desktop portrait detail'],
  ['/nails/nails1.png',1080,92,'Nail detail'],
];
for (const [src,width,quality,label] of profiles) {
  const params = new URLSearchParams({url:`${src}?v=${versions[src].version}-responsive2`,w:String(width),q:String(quality)});
  const r = await fetch(`${site}/_next/image?${params}`, {headers:{Accept:'image/webp'},signal:AbortSignal.timeout(60000)});
  assert.equal(r.status,200,label);
  assert.match(r.headers.get('content-type'),/image\/webp/,label);
  const cacheAge = Number((r.headers.get('cache-control') || '').match(/max-age=(\d+)/)?.[1]);
  assert.ok(cacheAge >= 86400,`${label}: responsive images must be cached for fast reloads`);
  const bytes = Buffer.from(await r.arrayBuffer());
  const source = await readFile(new URL(`public${src}`,root));
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.width,Math.min(width,versions[src].width),label);
  assert.ok(bytes.length < source.length,label);
  const reference = await sharp(source).autoOrient().resize({width,withoutEnlargement:true}).removeAlpha().raw().toBuffer();
  const decoded = await sharp(bytes).removeAlpha().raw().toBuffer();
  assert.equal(decoded.length,reference.length,label);
  let squared=0;
  for(let i=0;i<decoded.length;i++) squared+=(decoded[i]-reference[i])**2;
  const psnr=10*Math.log10(255**2/(squared/decoded.length));
  assert.ok(psnr>35,`${label}: unexpectedly large compression error (${psnr.toFixed(1)} dB)`);
  console.log(JSON.stringify({label,width:metadata.width,kB:Math.round(bytes.length/1024),smallerPercent:Math.round(100*(1-bytes.length/source.length)),psnrDB:psnr.toFixed(1)}));
}
console.log('PASS: responsive pages and high-density photo profiles; single compression from masters.');
