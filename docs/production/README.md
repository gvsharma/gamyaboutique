# Production Readiness — Gamya Couture

Documentation for QA, DevOps, and go-live planning.

| Document | Purpose |
|----------|---------|
| [TESTING-STRATEGY.md](./TESTING-STRATEGY.md) | Automated test pyramid, tools, CI gates |
| [MANUAL-QA-CHECKLIST.md](./MANUAL-QA-CHECKLIST.md) | Pre-release manual verification |
| [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) | Backend, frontend, database deploy steps |
| [MONITORING-CHECKLIST.md](./MONITORING-CHECKLIST.md) | Post-launch observability |
| [GO-LIVE-CHECKLIST.md](./GO-LIVE-CHECKLIST.md) | Must-fix vs defer classification |

## CI/CD overview

```
PR → main          push → main
   │                    │
   ▼                    ▼
 ci.yml              validate.yml (reusable)
 (validate only)          │
                           ├── backend: mvn verify
                           ├── frontend: lint + tsc + build
                           └── security: npm audit + Trivy
                                │
                                ▼ (main only)
                           deploy.yml
                                ├── S3 + SSM deploy
                                ├── health check
                                └── smoke-test-api.sh
```

**Vercel:** Connect repo root `frontend/` — deploys independently on merge to `main`. Run manual QA checklist after Vercel preview/production URL updates.

## Quick commands

```bash
# Local backend tests (requires Docker for Testcontainers)
mvn verify

# Local frontend validation
cd frontend && npm ci && npm run lint && npx tsc --noEmit && npm run build

# Post-deploy smoke (replace host)
./scripts/smoke-test-api.sh http://<ec2-ip>
SMOKE_EMAIL=user@example.com SMOKE_PASSWORD='...' ./scripts/smoke-test-api.sh http://<ec2-ip>

# Legacy catalog-only check
./scripts/verify-api-integration.sh http://<ec2-ip>
```

## GitHub secrets / variables

| Name | Type | Used by |
|------|------|---------|
| `AWS_BACKEND_DEPLOY_ROLE_ARN` | Secret | deploy.yml |
| `DEPLOY_BUCKET` | Var or Secret | deploy.yml |
| `EC2_INSTANCE_ID` | Var or Secret | deploy.yml |
| `EC2_HOST` | Var or Secret | deploy.yml |
| `SMOKE_TEST_EMAIL` | Secret (optional) | deploy smoke tests |
| `SMOKE_TEST_PASSWORD` | Secret (optional) | deploy smoke tests |

## Related repos

- **gamya-couture-infra** (Terraform): EC2, RDS, S3, IAM, SSM parameters
- **This repo**: Spring Boot backend + Next.js frontend
