# Portal reliability repair — 19 October 2026

Render's Events page recorded repeated HTTP health-check failures with status
429 on 11–14 October. Its configured path is `/api/health`. The old middleware
order counted those frequent probes against the 200 requests / 15 minute API
quota, so monitoring itself could make the instance appear unhealthy.

The health route now runs before the limiter for both GET and HEAD, keeps the
database readiness check (503 when disconnected), and sends `Cache-Control:
no-store`. Application requests retain the existing quota and now receive
standard rate-limit headers and `Retry-After` on rejection. Keep Render's
health-check path set to `/api/health`.

Sign-in reads native submitted form values, including named username/password
fields, rather than depending on React change events from iOS password autofill.
Requests allow 90 seconds for Render Free wake-up but cannot remain pending
indefinitely. Network, timeout, gateway and rate-limit failures show actionable
messages. Dashboard and service loading offer retries; service searches are
debounced, canceled on replacement, and protected against stale responses.
Failed writes are never automatically repeated.

Verification:

- Backend integration suite: 220 GET/HEAD probes consume no API quota; real
  traffic still receives 429 and Retry-After; health stays 200 after exhaustion.
  Existing isolated database/auth/payment/email-relay checks pass.
- Portal tests cover timeout, network, HTML 503 and 429 responses, no duplicate
  submissions, overlapping searches, and releasing sign-in/loading state.
- Chrome local preview with dummy credentials: sign-in reaches the dashboard;
  a simulated gateway failure displays an error and retry; retry restores the
  service list without another login.
- Portal and Next.js production builds pass. Lint has no errors; existing
  effect/dependency warnings remain.

Render Free still sleeps when idle and can take 50 seconds or more to wake.
This code repair does not change billing or remove that platform limitation.
Actual Face ID / iOS Safari confirmation requires a physical iPhone retest.
