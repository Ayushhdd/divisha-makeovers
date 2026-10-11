# Website photography

These are the original photos, preserved at full resolution. They are build
inputs, not files to publish in each Vercel deployment.

`manifest.json` lists the 60 photos used by the current pages. The six unused
alternatives remain here for future use but are omitted from public output.

`npm run prepare:images` generates smaller copies in `public/` at the same URLs.
It runs automatically before the website build or development server. The
largest side is limited to 3840 pixels, with no crop or enlargement; JPEGs use
quality 90 and 4:4:4 colour, and PNGs preserve transparency with lossless encoding.
Originals are never overwritten. Build-only image caches and output are ignored.

To add or replace a photo, put the original here and add its relative filename
to `published` in `manifest.json`. Then use `/folder/filename.jpg` (or `.png` or
`.webp`) in the component and run the preparation command.
