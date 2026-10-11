# Deployment cleanup — 11 October 2026

The Vercel warning concerns retained deployment output across the whole team.
At the start of this review, Divisha accounted for 2.92 GB of Deployment Storage
and 21.77 MB of Functions Storage. It was not a MongoDB storage warning.

## What changed

- Preserved all original photography under `assets/site-images/`; copy the
  60 images used by the website into `public/`, at their existing URLs.
  Per the owner's correction, all image resizing/recompression was rolled back.
  Published photos contain exactly the original bytes (246.12 MB). Next.js image
  optimization is disabled so pages display originals, avoiding lossy copies
  and previously cached optimized images. Storage cleanup uses retention and
  removal of unused assets/packages, without sacrificing photography quality.
- Keep six unused photo alternatives in the source archive; omit them from
  deployments. Removed five unreferenced Next.js starter SVGs.
- Removed the unused portal PWA build plugin. Retained the browser cleanup for
  old service workers, which protects customers from obsolete cached pages.
- Use Node's built-in development watcher instead of nodemon, and use locked
  `npm ci` installs on Vercel.
- Update Next.js to 16.4.0, React Router to 7.18.4, Nodemailer to 10.1.0, and Sharp
  to 0.35.5; refresh compatible transitive patches and the PostCSS override.
- Fix the gallery's Escape handler, use Next links in the mobile menu, and make
  the admin calendar handle failed or superseded requests instead of hanging
  or displaying an older request's result. Remove verbose payment debug logs.
- Use the same local-midnight boundary for booking creation and daily/date
  lookups, so a server outside UTC does not hide appointments on their day.
- Exclude original photos, the separate Render backend, and local test helpers
  from Next server function traces.

## Verification

- Full portal and Next production build passed.
- All 60 published photos match the originals byte for byte.
  All 62 referenced image URLs exist, including the Next metadata icons.
- Local HTTP checks passed for the homepage, four service pages, the legacy
  engagement URL, both portal login URLs, and original image URLs.
- Scoped-session and UPI-link tests passed. Backend integration tests passed for
  quantities, three-part payments/receipts, OTP delivery/failure, role isolation,
  password hashing, session revocation, and restart-safe admin bootstrapping.
- Signed email-relay tests passed without sending real messages.
- Production-only dependency audits report zero known vulnerabilities in all
  three applications. Some development-only CSS/glob tools still have upstream
  advisories; no forced framework/style downgrade was used to suppress them.
- Lint has no errors. Reviewed warnings remain for client hydration and payment
  state resets in effects; these preserve the existing interaction behaviour.

## Vercel maintenance

For this project, go to Settings → Build and Deployment → Deployment Retention
Policy. Old pre-production and production deployments now use a one-week
retention window; canceled and errored builds retain their 30-day window.
Vercel protects the current production deployment and its eligible recent
history. Cleanup and usage reporting happen asynchronously, so the historical
storage meter will not immediately become the size of the new build.

No customer/database records, admin credentials, verified payments, or receipts
are removed by this source cleanup. UPI app checkout still requires actual
merchant details; manual payment and screenshot approval remain available.

For future photo changes, follow `assets/site-images/README.md`. Publish one
tested Git commit for a set of changes instead of repeatedly redeploying the
same work. Review team Usage if another project contributes to a future warning.
