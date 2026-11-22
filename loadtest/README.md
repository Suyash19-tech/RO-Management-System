# Load test (k6)

```bash
docker compose up -d --build
docker compose exec -T postgres psql -U ro -d ro < loadtest/seed.sql   # 5k customers, 20k appointments, ...
docker run --rm -v "$PWD/loadtest:/t" grafana/k6 run /t/k6.js
```

Last run (local Docker on a Mac, k6 on the same machine, 200 peak VUs, 63 s of dashboard traffic):
30,343 requests, ~362 req/s average, p95 37.6 ms, median 2.1 ms, 0% errors on the dashboard scenario.
Rate limiter: 80 requests to /api/customers (limit 60/min) -> 60 x 200, 20 x 429.
Known: max latency 14 s from a cold-cache stampede on /api/dashboard/stats (no single-flight).
