# Website photography

These are the original photos, preserved at full resolution. Used photos are
published unchanged in each Vercel deployment.

`manifest.json` lists the 60 photos used by the current pages. The six unused
alternatives remain here for future use but are omitted from public output.

`npm run prepare:images` copies the original bytes into `public/` at the same URLs.
It runs automatically before the website build or development server. The
photos keep their original dimensions, encoding, quality, and transparency.
Do not resize or recompress these master files during preparation. `SiteImage`
uses Next.js to produce responsive WebP delivery at quality 92 directly from
the masters, with quality 95 for gallery zoom. Browser screen size and pixel
density choose the delivered resolution; other photos stay lazy-loaded.

Preparation also builds a lossless portrait crop of the panoramic hero with
the same 75% horizontal anchor as its existing mobile CSS. It avoids wasting
mobile downloads on the panorama outside the visible viewport. Landscape and
desktop views keep the panorama. Generated image hashes version the source
URLs so changed masters cannot reuse older blurry cached transformations.
Generated public output and `src/app/generated/image-versions.json` are ignored.

To add or replace a photo, put the original here and add its relative filename
to `published` in `manifest.json`. Then use `/folder/filename.jpg` (or `.png` or
`.webp`) in the component and run the preparation command.
