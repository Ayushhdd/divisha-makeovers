# Website photography

These are the original photos, preserved at full resolution. Used photos are
published unchanged in each Vercel deployment.

`manifest.json` lists the 60 photos used by the current pages. The six unused
alternatives remain here for future use but are omitted from public output.

`npm run prepare:images` copies the original bytes into `public/` at the same URLs.
It runs automatically before the website build or development server. The
photos keep their original dimensions, encoding, quality, and transparency.
No resizing or recompression is allowed. Next.js image optimization is disabled
so pages display the original files directly. Generated public output is ignored.

To add or replace a photo, put the original here and add its relative filename
to `published` in `manifest.json`. Then use `/folder/filename.jpg` (or `.png` or
`.webp`) in the component and run the preparation command.
