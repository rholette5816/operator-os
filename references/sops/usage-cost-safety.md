# Usage and Cost Safety Review

Run this before deploying any hosted app, automation, scheduled job, webhook, storage workflow, AI feature, email, or SMS. It stops a runaway bill before it happens.

## Mandatory pre-deployment review

Document these for every recurring or metered operation:

1. What triggers it: page load, polling timer, cron, webhook, retry, queue, or user action.
2. How often it can run per user, tab, project, and day.
3. How many downstream operations one trigger creates.
4. Worst-case daily request, read, write, compute, and transfer volume.
5. Likely monthly cost at normal and worst-case volume.
6. The hard limits, caching, deduplication, backoff, and spend controls that contain it.

Warn before deployment if the design can create material charges or the cost cannot be bounded. Do not wait for a bill or usage alert.

## Prohibited patterns

- Short-interval polling that calls a metered endpoint.
- Polling an endpoint that lists many records, then fetching each one.
- `cache: "no-store"` on repeatedly requested data with no freshness need.
- Write operations triggered by a read-only dashboard request.
- Unbounded pagination, recursion, retries, queue consumption, or fan-out.
- One browser tab multiplying background work after the user stops interacting.
- Relying on a provider's default limits as the only cost control.

## Required safeguards

- Prefer webhooks or event-driven updates over polling.
- Use one maintained summary or index instead of scanning individual objects for totals.
- Read only the records the current view needs.
- Apply strict page sizes, batch limits, timeouts, retry ceilings, and exponential backoff.
- Cache shared results and coalesce identical concurrent requests.
- Make mutations explicit. A GET or dashboard load must not refresh or rewrite provider data.
- Stop refresh work when a view is hidden or unmounted. Use manual refresh for expensive reports.
- Add idempotency to scheduled jobs and webhook handlers.
- Configure provider usage alerts and spend limits where available.

## Deployment gate

Before production, report:

```text
COST REVIEW
- Trigger and frequency:
- Operations per trigger:
- Expected daily volume:
- Worst-case daily volume:
- Estimated monthly cost:
- Hard limits and cache:
- Alerts or spend cap:
- Post-deploy monitoring times:
```

Do not deploy when worst-case volume is unknown, the workflow is unbounded, or a high-frequency path reads storage record by record.

## Post-deployment monitoring

Check provider usage at about 15 minutes, 1 hour, and 24 hours for any new recurring workload. Compare request count, storage ops, compute, transfer, and billed cost against the estimate. Roll back immediately if growth is materially higher than expected.

## Why this matters (a real incident)

A dashboard once polled a storage API every 30 seconds, each request listing records and downloading hundreds of private objects with caching disabled. A single session produced roughly 17.9 million storage operations in one billing day. The fix was to remove the polling and the write-on-read refresh. Bounded cron and webhook paths were safe and stayed on. One careless polling loop can cost more than a month of normal usage. Always do this review.
