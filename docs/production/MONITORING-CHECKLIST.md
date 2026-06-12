# Production Monitoring Checklist — Gamya Couture

Post-launch observability for EC2 backend, RDS, and Vercel frontend.

---

## 1. Application logs

### Backend (EC2)

| Source | Command / location | What to watch |
|--------|-------------------|---------------|
| systemd journal | `journalctl -u gamya-couture-backend -f` | Startup errors, stack traces |
| App log file | `/opt/gamya-couture/logs/` (if configured) | Business errors |
| nginx access | `/var/log/nginx/access.log` | 4xx/5xx spikes |
| nginx error | `/var/log/nginx/error.log` | Upstream failures (502) |

**Daily checks:**

| # | Check | Alert if |
|---|-------|----------|
| L1 | No repeated `ERROR` stack traces | > 10/hour same exception |
| L2 | Flyway migration success on startup | `Migration failed` in logs |
| L3 | S3 upload failures | `Image upload failed` |
| L4 | Outbox queue growth | Unprocessed password-reset events |

**Recommended (infra repo):**

- CloudWatch Logs agent → log group `/gamya-couture/backend`
- Metric filter on `ERROR` → SNS alarm

### Frontend (Vercel)

| Source | Location | What to watch |
|--------|----------|---------------|
| Vercel dashboard | Deployments → Runtime Logs | Build/runtime errors |
| Browser console | Production site | API 401/502, CORS errors |

---

## 2. Failed login tracking

**DB table:** `login_attempts` (V11)

```sql
-- Failed logins last hour
SELECT identifier, ip_address, COUNT(*) AS failures
FROM login_attempts
WHERE success = false
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY identifier, ip_address
ORDER BY failures DESC
LIMIT 20;

-- Locked accounts
SELECT id, email, phone, failed_login_attempts, locked_until
FROM users
WHERE locked_until > NOW();
```

| # | Monitor | Threshold | Action |
|---|---------|-----------|--------|
| F1 | Failures per identifier | > 20/hour | Investigate brute force |
| F2 | Failures per IP | > 50/hour | Consider WAF/rate limit |
| F3 | Locked accounts | Any spike | Support outreach |
| F4 | OTP reset failures | > 10/hour per destination | Block/rate limit |

**Recommended:** CloudWatch metric from custom actuator or scheduled query.

---

## 3. API failures

### Health endpoints

| Endpoint | Expected | Frequency |
|----------|----------|-----------|
| `GET /actuator/health` | 200, `"UP"` | Every 1 min |
| `GET /actuator/health/db` | UP | Every 5 min |
| `GET /api/v1/products?page=0&size=1` | 200 | Every 5 min |

**External monitor:** UptimeRobot / Better Stack / Route 53 health check → EC2 public IP.

### Error rate by status

| Status | Meaning | Action |
|--------|---------|--------|
| 502 | nginx → Spring down | Restart systemd; check DB |
| 401 spike | Token issues / attacks | Review auth logs |
| 422 | Business rules (stock) | Expected; track volume |
| 500 | Unhandled exceptions | Fix + deploy hotfix |

```bash
# Quick 5xx sample from nginx (on EC2)
awk '$9 ~ /^5/' /var/log/nginx/access.log | tail -20
```

**Recommended:** Spring Boot Micrometer + CloudWatch or Prometheus:

- `http.server.requests` by status
- Alert: 5xx rate > 1% over 5 min

---

## 4. Database connection issues

**RDS CloudWatch metrics (ap-south-1):**

| Metric | Alert threshold |
|--------|-----------------|
| `DatabaseConnections` | > 80% of max |
| `CPUUtilization` | > 80% for 10 min |
| `FreeableMemory` | < 256 MB |
| `ReadLatency` / `WriteLatency` | > 20 ms sustained |
| `FreeStorageSpace` | < 10 GB |

**Application signals:**

| Symptom | Likely cause |
|---------|--------------|
| `HikariPool - Connection is not available` | Pool exhausted / slow queries |
| `PSQLException: connection refused` | SG rule / RDS down |
| Flyway hang on startup | RDS unreachable from EC2 |

**Verify connectivity (SSM on EC2):**

```bash
nc -zv <rds-endpoint> 5432
curl -sf http://127.0.0.1:8080/actuator/health | jq .components.db
```

---

## 5. Memory leaks & JVM health

**EC2 instance metrics:**

| Metric | Alert |
|--------|-------|
| Memory utilization | > 85% for 15 min |
| Swap usage | > 0 sustained |
| Disk `/` | > 80% |

**JVM (actuator — enable cautiously in prod):**

```yaml
# application-prod.yml (recommended)
management.endpoints.web.exposure.include: health,info,metrics,prometheus
management.endpoint.health.show-details: when_authorized
```

| # | Check | Tool |
|---|-------|------|
| J1 | Heap stable over 24h | CloudWatch agent / jstat |
| J2 | No OOM in journal | `journalctl \| grep OutOfMemory` |
| J3 | GC pause acceptable | Micrometer `jvm.gc.pause` |

**systemd limits** (verify in unit file):

```
MemoryMax=...
```

---

## 6. EC2 CPU / memory

| # | Task | Frequency |
|---|------|-----------|
| E1 | CloudWatch EC2 `CPUUtilization` | Continuous |
| E2 | Status check failed alarm | Immediate page |
| E3 | Cost scheduler stop/start window | Confirm acceptable downtime |
| E4 | SSM agent online | Before deploy |

**Alarms to configure (infra repo):**

- CPU > 80% for 10 minutes
- StatusCheckFailed >= 1
- DiskUtilization > 80%

---

## 7. Slow endpoints

**Candidates for latency tracking:**

| Endpoint | SLA target |
|----------|------------|
| `GET /api/v1/products` | < 500 ms p95 |
| `GET /api/v1/products/{id}` | < 300 ms p95 |
| `POST /api/v1/auth/login` | < 800 ms p95 |
| `GET /api/v1/cart` | < 400 ms p95 |
| Admin product list | < 1 s p95 |

**Known performance risks (from audit):**

- Cart/wishlist N+1 product lookups
- JWT filter DB hit every request
- No caching on category tree

**Investigation:**

```bash
# Enable request logging temporarily (dev only)
# Or use actuator metrics: http.server.requests
curl -w "@curl-format.txt" -o /dev/null -s http://<host>/api/v1/products
```

**Recommended:** AWS X-Ray or Micrometer tracing for p95/p99 dashboards.

---

## 8. Vercel-specific

| # | Monitor | Alert |
|---|---------|-------|
| V1 | Deployment status | Failed build |
| V2 | Edge function errors | 5xx on `/api/v1/*` rewrite |
| V3 | Bandwidth / usage | Unusual spike |
| V4 | Core Web Vitals (RUM) | LCP > 2.5s |

---

## 9. On-call runbook (quick reference)

| Symptom | First action |
|---------|--------------|
| Site down (502) | `systemctl status gamya-couture-backend`; check RDS |
| Login broken for all users | Check JWT_SECRET not rotated mid-session; check DB |
| Images not loading | S3/CloudFront policy; check `APP_STORAGE_S3_*` |
| Cart empty after login | Check merge logs; guest cart header |
| Deploy failed | GitHub Actions logs; SSM output; auto-rollback status |
| RDS CPU high | Slow query log; check N+1; scale instance class |

---

## 10. Monitoring maturity roadmap

| Phase | Capability |
|-------|------------|
| **Now** | Manual journal/nginx checks; GitHub deploy smoke; UptimeRobot ping |
| **Week 2** | CloudWatch alarms (EC2, RDS); log shipping |
| **Week 4** | Micrometer → CloudWatch; login_attempts daily report |
| **Week 8** | APM/tracing; Sentry (frontend + backend); on-call rotation |

---

## Daily checklist (5 minutes)

| # | Task | Done |
|---|------|------|
| 1 | Uptime ping green | ☐ |
| 2 | No open GitHub deploy failures | ☐ |
| 3 | Vercel latest prod deployment success | ☐ |
| 4 | Scan backend logs for ERROR (last 24h) | ☐ |
| 5 | RDS CPU/connections normal | ☐ |
| 6 | Failed login query (anomalies) | ☐ |
