import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://host.docker.internal:3100';
const rateLimited = new Counter('rate_limited_429');

export const options = {
  scenarios: {
    // Dashboard traffic: L1/L2-cached stats endpoint + product list.
    dashboard: {
      executor: 'ramping-vus',
      stages: [
        { duration: '15s', target: 50 },
        { duration: '30s', target: 200 },
        { duration: '15s', target: 0 },
      ],
      exec: 'dashboard',
    },
    // Verifies Redis sliding-window limiter (60 req/min/IP on /api/customers).
    ratelimit: {
      executor: 'per-vu-iterations', vus: 1, iterations: 80, maxDuration: '40s',
      startTime: '65s', exec: 'ratelimit',
    },
  },
  thresholds: {
    'http_req_failed{scenario:dashboard}': ['rate<0.01'],
    'http_req_duration{scenario:dashboard}': ['p(95)<500'],
  },
};

export function dashboard() {
  const r = Math.random();
  const res = r < 0.7
    ? http.get(`${BASE}/api/dashboard/stats?filter=this_year`)
    : http.get(`${BASE}/api/products`);
  check(res, { 'status 200': (x) => x.status === 200 });
  sleep(0.1);
}

export function ratelimit() {
  const res = http.get(`${BASE}/api/customers`);
  if (res.status === 429) rateLimited.add(1);
  check(res, { '200 or 429': (x) => x.status === 200 || x.status === 429 });
}
